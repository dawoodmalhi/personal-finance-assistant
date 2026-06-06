Setup Supabase Postgres for this project

This document walks through creating a Supabase project, connecting it to this Next.js app, and running Prisma migrations.

1) Create a Supabase project

- Go to https://supabase.com and sign in or create an account.
- Create a new project. Choose a project name and a secure password for the database.
- Wait for the project to provision.

2) Get the database connection string

- In the Supabase project dashboard, open Settings → Database → Connection string.
- Copy the full Postgres connection string (it looks like: `postgres://postgres:password@db.host.supabase.co:5432/postgres`).

3) Configure local environment variables

- In the project root, copy `.env.example` to `.env`:

```zsh
cp .env.example .env
```

- Edit `.env` and paste the `DATABASE_URL` connection string you copied from Supabase.
- Add any Clerk environment variables you use (CLERK_WEBHOOK_SECRET etc.) if you plan to test authentication and webhooks locally.

4) Install dependencies (if not already installed)

```zsh
npm install
```

5) Generate Prisma client

```zsh
npx prisma generate
```

6) Run Prisma migrations

- Create an initial migration and push it to the Supabase database:

```zsh
npx prisma migrate dev --name init
```

Note: `migrate dev` will create a local migration and apply it to the database. On CI or production, prefer `prisma migrate deploy`.

7) Verify the connection

- Start the dev server:

```zsh
npm run dev
```

- Visit the app and exercise features that hit the database.

8) Helpful Supabase tips

- You can connect to the Supabase SQL editor and inspect the `User` table created by Prisma.
- If you deploy this app, set `DATABASE_URL` in your hosting provider to the Supabase connection string.

Troubleshooting

- If you see errors connecting to the DB, confirm your `DATABASE_URL` is correct and that the network allows connections.
- If Prisma and Supabase versions mismatch, try updating `prisma` and `@prisma/client` to matching versions.
