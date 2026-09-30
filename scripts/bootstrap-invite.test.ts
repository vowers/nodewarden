import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { validBootstrapInvite } from '../src/utils/bootstrap-invite';
import { handleRegister } from '../src/handlers/accounts';
import type { Env } from '../src/types';

const code = 'test-only-initialization-code-123456789';
test('initial registration fails closed without a strong configured code', () => {
  assert.equal(validBootstrapInvite(code, undefined), false);
  assert.equal(validBootstrapInvite('short', 'short'), false);
  for (const value of [undefined, null, 123, {}, '', 'wrong', code.slice(1)]) {
    assert.equal(validBootstrapInvite(value, code), false);
  }
});
test('the exact initialization code is accepted', () => {
  assert.equal(validBootstrapInvite(code, code), true);
  assert.equal(validBootstrapInvite(` ${code} `, code), true);
  assert.equal(validBootstrapInvite(code.slice(0, -1) + '0', code), false);
});
test('registration handler rejects missing or incorrect first-admin codes before creating a user', async () => {
  const env = {
    JWT_SECRET: 'test-only-jwt-secret-at-least-32-characters-long',
    BOOTSTRAP_INVITE_CODE: code,
    DB: {
      prepare(sql: string) {
        assert.equal(sql, 'SELECT COUNT(*) AS count FROM users');
        return { first: async () => ({ count: 0 }) };
      },
    },
  } as unknown as Env;
  for (const inviteCode of [undefined, 'wrong', code]) {
    const response = await handleRegister(new Request('https://example.invalid/api/accounts/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    }), env);
    // With a valid setup code, normal upstream account-field validation runs.
    assert.equal(response.status, inviteCode === code ? 400 : 403);
  }
});
test('release merges retain the first-account guard and invitation field', () => {
  const accounts = readFileSync(new URL('../src/handlers/accounts.ts', import.meta.url), 'utf8');
  const publicRoutes = readFileSync(new URL('../src/router-public.ts', import.meta.url), 'utf8');
  assert.match(accounts, /userCount === 0 && !validBootstrapInvite\(body.inviteCode, env.BOOTSTRAP_INVITE_CODE\)/);
  assert.ok(accounts.indexOf('!validBootstrapInvite(') < accounts.indexOf('storage.createFirstUser(user)'));
  assert.match(publicRoutes, /registrationInviteRequired: true/);
});
