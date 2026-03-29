# Supabase Database Setup Guide

This project has been configured to use **Supabase** (PostgreSQL) instead of SQLite.

## 📋 Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created

## 🚀 Setup Steps

### Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string** section
4. Select **URI** tab
5. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres`)

### Step 2: Update Environment Variables

Add your Supabase connection string to `.env.local`:

```env
# Supabase Database Connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Or use the direct connection (for migrations):
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Important Notes:**
- Replace `[YOUR-PASSWORD]` with your database password
- Replace `[YOUR-PROJECT-REF]` with your project reference ID
- For production, use the connection pooler URL (with `pgbouncer=true`)
- For migrations, you might need the direct connection URL

### Step 3: Run Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables in Supabase
npm run prisma:migrate
# or
npx prisma migrate deploy
```

### Step 4: Seed the Database

```bash
# Populate database with initial data
npm run prisma:seed
```

### Step 5: Verify Connection

Start your development server:

```bash
npm run dev
```

The application should now connect to your Supabase database.

## 🔧 Troubleshooting

### Connection Issues

- **Error: "Can't reach database server"**
  - Check your Supabase project is active
  - Verify the connection string is correct
  - Check if your IP needs to be whitelisted (Supabase dashboard → Settings → Database)

### Migration Issues

- **Error: "Migration failed"**
  - Use the direct connection URL (without `pgbouncer`) for migrations
  - Check Supabase logs for detailed error messages

### Connection Pooling

Supabase uses connection pooling. For best results:
- Use `pgbouncer=true` in connection string for application queries
- Use direct connection for migrations

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

## 🎯 Next Steps

After setup:
1. ✅ Database is connected to Supabase
2. ✅ Tables are created via migrations
3. ✅ Initial data is seeded
4. ✅ Application is ready to use

Your bookings will now be stored in Supabase instead of a local SQLite file!

