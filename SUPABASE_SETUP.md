# Supabase Setup Guide

This guide will help you set up Supabase as your PostgreSQL database for this Next.js SaaS starter.

## Why Supabase?

✅ **Perfect for Vercel**: Built-in connection pooling for serverless  
✅ **Free Tier**: Generous limits for getting started  
✅ **Easy Setup**: No complex configuration needed  
✅ **Scalable**: Automatically handles growth  
✅ **Additional Features**: Real-time, auth, storage (optional)  

## Step-by-Step Setup

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Verify your email

### 2. Create New Project
1. Click "New project"
2. Choose an organization (or create one)
3. Fill in project details:
   - **Name**: Your project name (e.g., "my-saas-app")
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for setup to complete (~2 minutes)

### 3. Get Connection String
1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **Nodejs** tab
4. **Important**: Switch to **Connection pooling** mode
5. Copy the connection string

The pooled connection string should look like:
```
postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].pooler.supabase.com:6543/postgres
```

**⚠️ Important**: 
- Use the **pooled** connection (port 6543), not direct (port 5432)
- Replace `[YOUR-PASSWORD]` with your actual database password

### 4. Run Setup Script
```bash
pnpm db:setup
```
- Choose option **S** for Supabase
- Paste your connection string when prompted

### 5. Run Migrations
```bash
pnpm db:migrate
pnpm db:seed
```

## Vercel Deployment

When deploying to Vercel:

1. Add your `POSTGRES_URL` to Vercel environment variables
2. Use the same pooled connection string from Supabase
3. Deploy normally - the optimized connection config will handle the rest

## Connection Configuration

This starter is pre-configured for serverless environments with:
- Connection pooling support
- Optimized connection limits
- Quick idle timeout for serverless functions

## Troubleshooting

### "Too many connections" error
- Make sure you're using the **pooled** connection string (port 6543)
- Check that you haven't exceeded Supabase's connection limits

### Connection timeouts
- Verify your connection string is correct
- Check Supabase project status in their dashboard

### Migration errors
- Ensure your database user has sufficient permissions
- Try running migrations one at a time

## Supabase Dashboard Features

While this starter uses custom auth, Supabase provides additional features you can optionally use:

- **Database Browser**: Visual query builder
- **SQL Editor**: Run custom queries  
- **Real-time**: Live data subscriptions
- **Storage**: File uploads and management
- **Edge Functions**: Serverless functions at the edge

## Cost and Limits

**Free Tier includes**:
- 500MB database space
- 2GB bandwidth
- 50,000 monthly active users
- 5GB file storage

Perfect for development and small to medium production apps.
