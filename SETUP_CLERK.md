Setup Clerk for this Next.js App (App Router)

This repository already includes basic Clerk wiring (middleware, provider usage, sign-in/sign-up UI, and server-side helper loader). This document explains how to finish configuring Clerk, what environment variables to set, and how to test locally and in production.

1) Create a Clerk account and application

- Go to https://clerk.com and sign up (or sign in).
- Create a new application and note the frontend API and API keys.

2) Required environment variables

Add the following to your `.env` (or hosting provider environment configuration):

- CLERK_PUBLISHABLE_KEY (frontend key) — used by client SDK and components
- CLERK_SECRET_KEY (server key) — used by server SDK if needed
- CLERK_WEBHOOK_SECRET — used to verify webhooks (your webhook secret)
- NEXT_PUBLIC_APP_URL — e.g. http://localhost:3000

Examples (put these in `.env`):

```env
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3) Configure Clerk application

- In the Clerk dashboard, add `http://localhost:3000` to the allowed origins and redirect URLs for local development.
- Add any deployed domains to allowed origins when you deploy.

4) Webhooks (optional, recommended if you want server-side sync)

- In Clerk dashboard → Webhooks, add a new webhook and point it to your deployed webhook endpoint, e.g. `https://<your-domain>/api/webhooks/clerk`.
- Copy the webhook secret and place it in `CLERK_WEBHOOK_SECRET` in `.env` or the host provider.
- The repository's webhook handler `app/api/webhooks/clerk/route.ts` uses `svix` to verify signatures and updates Prisma's `User` records.

5) Middleware and route protection

- `middleware.ts` uses `clerkMiddleware()` and already includes a matcher that protects `/dashboard` and API routes except the webhook path. You can edit `matcher` if you want to protect other routes.

6) App Router server helpers

- `lib/auth.ts` includes a runtime loader that attempts to load Clerk's server `auth()` helper from `@clerk/nextjs/server` or `@clerk/nextjs` depending on the package layout.
- Use `getCurrentUser()` (in `lib/auth.ts`) inside App Router server components to retrieve the current authenticated user and map them to your Prisma `User` record.

7) Local dev flow

- Add Clerk env vars to `.env` and run:

```zsh
npm install
npm run dev
```

- Visit `/sign-in` or `/sign-up` to use Clerk-provided UIs (the project already uses `SignIn` and `SignUp` components in the app).
- If you rely on webhooks, you can test locally with a tool like `ngrok` and register the tunnel URL in Clerk dashboard, then send test payloads from Clerk.

8) Deploying

- Ensure the same Clerk env variables are set in the hosting environment.
- When deploying, set `CLERK_WEBHOOK_SECRET` and `CLERK_SECRET_KEY` as environment secrets in your host so server-side hooks and helpers work.

9) Troubleshooting

- Error "auth() and currentUser() are only supported in App Router" — make sure `getCurrentUser()` or `auth()` is only called from files in `/app` server components or app routes.
- If `@clerk/nextjs/server` import fails in your environment, the runtime loader in `lib/auth.ts` will attempt a fallback. Consider pinning `@clerk/nextjs` to a version where server entrypoints exist.

10) Helpful commands

```zsh
# run the dev server
npm run dev
# run build/test locally
npm run build
# test webhooks with ngrok (optional)
ngrok http 3000
```

If you want, I can also:
- Add Clerk env names to `.env.example` (done already).
- Add example entries in `next.config.js` if you want to conditionally set Clerk behavior.
- Walk through an end-to-end local login and webhook test using ngrok and Clerk's dashboard.
