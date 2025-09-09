# Setup Guide

This guide will help you set up the RLS Guard Dog project locally and deploy it to production.

## Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account
- MongoDB instance (local or cloud)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/1234-ad/rls-guard-dog.git
cd rls-guard-dog
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Go to Settings > API to get your keys

#### Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rls-guard-dog
MONGODB_DB_NAME=rls-guard-dog

# Application Configuration
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 4. Set Up Database

#### Install Supabase CLI

```bash
npm install -g supabase
```

#### Initialize Supabase

```bash
supabase login
supabase init
```

#### Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

#### Run Migrations

```bash
supabase db push
```

#### Seed the Database

```bash
supabase db seed
```

### 5. Set Up MongoDB (Optional)

If you want to use MongoDB for additional features:

#### Local MongoDB

```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas (Cloud)

1. Create account at [mongodb.com](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Testing Setup

### Run All Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Security tests (RLS policies)
npm run test:security

# All tests
npm run test:all
```

### Test Database Setup

For integration tests, you may want a separate test database:

```bash
# Create test project in Supabase
# Update test environment variables
cp .env.local .env.test.local

# Run migrations on test database
SUPABASE_DB_URL=your-test-db-url supabase db push
```

## Production Deployment

### 1. Vercel Deployment (Recommended)

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Deploy

```bash
vercel
```

#### Set Environment Variables

In Vercel dashboard, add all environment variables from `.env.local`.

### 2. Docker Deployment

#### Build Docker Image

```bash
docker build -t rls-guard-dog .
```

#### Run Container

```bash
docker run -p 3000:3000 --env-file .env.local rls-guard-dog
```

### 3. Manual Deployment

#### Build for Production

```bash
npm run build
```

#### Start Production Server

```bash
npm start
```

## Database Schema Updates

### Creating New Migrations

```bash
supabase migration new your_migration_name
```

Edit the generated SQL file in `supabase/migrations/`.

### Applying Migrations

```bash
# Local
supabase db push

# Production
supabase db push --linked
```

## Environment Configuration

### Development

```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
# ... other dev configs
```

### Staging

```env
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
# ... other staging configs
```

### Production

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
# ... other production configs
```

## Security Configuration

### Supabase RLS Policies

Ensure RLS is enabled on all tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_enrollments ENABLE ROW LEVEL SECURITY;
```

### JWT Configuration

In Supabase dashboard:
1. Go to Settings > API
2. Configure JWT settings
3. Set appropriate JWT expiry times

### CORS Configuration

Configure allowed origins in Supabase:
1. Go to Settings > API
2. Add your domain to allowed origins

## Monitoring and Logging

### Supabase Monitoring

1. Go to Reports in Supabase dashboard
2. Monitor API usage, database performance
3. Set up alerts for unusual activity

### Application Monitoring

Consider adding:
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User analytics (PostHog, Google Analytics)

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check Supabase connection
supabase status

# Test database connection
psql "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

#### Migration Issues

```bash
# Reset local database
supabase db reset

# Check migration status
supabase migration list
```

#### RLS Policy Issues

```bash
# Test policies with different users
supabase auth login
# Run queries as different users
```

#### Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules
npm install
```

### Debug Mode

Enable debug logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

### Performance Issues

1. Check database query performance in Supabase
2. Monitor RLS policy performance
3. Use Next.js built-in performance monitoring

## Backup and Recovery

### Database Backups

```bash
# Manual backup
supabase db dump > backup.sql

# Restore from backup
psql "your-connection-string" < backup.sql
```

### Automated Backups

Set up automated backups in Supabase dashboard or use external tools.

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Environment variables secured
- [ ] HTTPS enabled in production
- [ ] JWT secrets rotated regularly
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Security tests passing
- [ ] Dependencies updated

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [security documentation](./SECURITY.md)
3. Check existing GitHub issues
4. Create a new issue with detailed information

## Next Steps

After setup:

1. Review the [security documentation](./SECURITY.md)
2. Run the test suite to ensure everything works
3. Customize the application for your needs
4. Set up monitoring and alerting
5. Plan your deployment strategy

Happy coding! 🚀