<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# m365-light – agent instructions

m365-light is a minimal admin panel for Microsoft 365 (Entra ID + Exchange Online). IT operators use it to manage users, groups, shared mailboxes, and distribution lists without full admin roles. Target operations: CRUD users, group membership, password/MFA resets, shared mailbox/distribution list management.

## instructions

m365 ligth is a light version of admin.cloud.microsoft, entraID and exchange online. The target is to handle most basics actions that an IT can do:

- CRUD users
- Assign?unassign users to groups
- Reset passwords/mfa
- CRUD sharedmailboxes/distribution list

Then, those users won't need admin roles inside m365.

## Commands

- `pnpm dev` – dev server
- `pnpm lint` – ESLint
- `pnpm typecheck` – `tsc --noEmit`
- `pnpm format` – Prettier (TS/TSX only)
- `pnpm build` – production build

Run `lint -> typecheck` before committing. No test command configured.

## Key quirks (will surprise most agents)

- **Tailwind v4**: configured via `@import "tailwindcss"` in CSS, **not** `tailwind.config.ts`. Use `@theme` / `@custom-variant` directives.
- **Components** use `@base-ui/react` (not Radix) + shadcn/ui `base-vega` style.
- **Path alias**: `@/*` maps to project root (`./*`). E.g. `@/lib/utils`, `@/components/ui`.
- **No Radix** – do not reach for `@radix-ui/*` packages; Base UI is the primitives library.

## Architecture

- `app/` – Next.js App Router pages + API routes
- `lib/auth.ts` – next-auth config (Azure AD provider)
- `lib/graph/` – Microsoft Graph client, user & group operations
- `proxy.ts` – middleware protecting `/dashboard/*` and `/api/admin/*`
- `components/ui/` – shadcn/ui components (Base UI-based)

## Auth & API

- Azure AD OAuth via `next-auth`. Env vars: `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`, `AZURE_AD_GROUP_ID`, `NEXTAUTH_SECRET` (in `.env.local`).
- Microsoft Graph client uses session access token. See `lib/graph/client.ts`.
