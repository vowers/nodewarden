import { constantTimeEquals } from './api-key';

// Only used while no account exists. Normal invitations remain upstream-owned.
export function validBootstrapInvite(provided: unknown, expected: string | undefined): boolean {
  return typeof provided === 'string'
    && typeof expected === 'string'
    && expected.length >= 32
    && constantTimeEquals(provided.trim(), expected);
}
