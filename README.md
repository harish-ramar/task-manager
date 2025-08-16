# Next.js SaaS Starter

This is a starter template for building a SaaS application using **Next.js** with support for authentication and a dashboard for logged-in users.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) showing pricing plans (payment integration removed)
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
pnpm install
```

## Database Setup

This starter supports multiple database options:

### 1. Local Development with Docker
- Uses PostgreSQL 16 in a Docker container
- Perfect for local development
- Automatically configured on port 54322

### 2. Supabase (Recommended for Production)
- Fully managed PostgreSQL with built-in connection pooling
- Perfect for serverless environments like Vercel
- Free tier available with generous limits
- Built-in dashboard and real-time features

### 3. Other Remote PostgreSQL
- Any PostgreSQL-compatible database
- Vercel Postgres, Neon, PlanetScale, etc.
- Make sure it supports connection pooling for serverless

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can also create new users through the `/sign-up` route.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Going to Production

### Database for Production

For production deployment on Vercel, **Supabase is highly recommended** because:

1. **Built-in Connection Pooling**: Essential for serverless functions
2. **Automatic Scaling**: Handles traffic spikes automatically  
3. **Edge Network**: Global distribution for low latency
4. **Generous Free Tier**: Perfect for getting started

Other good options:
- **Vercel Postgres**: Native integration with Vercel
- **Neon**: Serverless PostgreSQL with branching
- **PlanetScale**: MySQL-compatible with branching

### Why Connection Pooling Matters

Serverless functions (like Vercel) create new connections for each request. Without connection pooling:
- You'll quickly exhaust database connection limits
- Performance will degrade significantly
- Database may become unresponsive

The connection configuration in this starter is optimized for serverless environments.

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `POSTGRES_URL`: Set this to your production database URL.
3. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com
- https://turbostarter.dev
