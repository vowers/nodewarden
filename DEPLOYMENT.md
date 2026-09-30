# Personal Cloudflare deployment

- Production: https://nodewarden.vowers.workers.dev
- Branch: `production`, based on upstream stable release `v1.8.0`.
- D1: `nodewarden-db`; R2: `nodewarden-attachments`. Do not recreate these during upgrades.
- Runtime secrets: `JWT_SECRET` and `BOOTSTRAP_INVITE_CODE`. Never commit their values.
- The first administrator must enter the separately delivered initialization code in the invitation field. Choose the vault master password in the browser; it is not the initialization code.
- Once an account exists, upstream's normal single-use invitations are required; the initialization code cannot create another administrator.
- Keep JWT_SECRET stable: changing it invalidates sessions and can affect encrypted server-side settings.

`Update deployed NodeWarden` checks the latest non-prerelease GitHub Release daily at 02:57 UTC (10:57 Beijing), merges its tag into `production`, checks the local registration protection, and triggers Cloudflare Workers Builds. Conflicts stop the update instead of overwriting local settings. A manual run requests deployment even without a new release. Check Cloudflare for the actual deployment outcome.

The Workers Builds commands are `npm run build` and `npx tsx --test scripts/bootstrap-invite.test.ts && npm run deploy`.

Cloud backup is not configured: the owner must set up an appropriate destination in the app and verify restore. Keep regular encrypted vault exports. This community project is not affiliated with Bitwarden and does not replace backups or a security audit.
