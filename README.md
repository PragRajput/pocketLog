# Pocketlog

A personal expense tracker to log, categorize, and analyze your spending — built with Next.js, Prisma, and Neon PostgreSQL.

## Features

- **Expenses** — Log expenses with amount, description, date, and notes
- **Funds** — Organize spending across multiple wallets or funds with optional budgets
- **Categories** — Categorize expenses with custom colors and icons
- **Tags** — Label expenses with flexible tags
- **Reports** — Visualize spending patterns with charts

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **Database** — [Neon](https://neon.tech) (serverless PostgreSQL)
- **ORM** — [Prisma 7](https://www.prisma.io)
- **UI** — [Tailwind CSS v4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com)
- **Deployment** — [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database (free tier works)

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/your-username/pocketlog.git
   cd pocketlog
   npm install
   ```

2. Copy the environment variables and fill in your Neon connection strings:

   ```bash
   cp .env.example .env
   ```

   ```env
   DATABASE_URL="postgresql://..."   # Pooled connection (for app queries)
   DIRECT_URL="postgresql://..."     # Direct connection (for migrations)
   ```

3. Run migrations and start the dev server:

   ```bash
   npx prisma migrate deploy
   npm run dev
   ```

   Open [http://localhost:8082](http://localhost:8082).

## Deployment

This project is configured for Vercel + Neon out of the box.

1. Push to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add `DATABASE_URL` and `DIRECT_URL` in Vercel → Settings → Environment Variables
4. Deploy — Vercel runs `prisma migrate deploy && next build` automatically
