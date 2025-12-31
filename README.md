# Advent Hope Academy SMS

A multi-tenant School Management System built with Next.js 14, Prisma, and NextAuth.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- (Optional) AWS S3 or Cloudinary for file uploads

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/advent_hope_academy?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-generate-a-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Optional: AWS S3 (for file uploads)
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION=""
# AWS_S3_BUCKET=""

# Optional: Cloudinary (for image uploads)
# CLOUDINARY_CLOUD_NAME=""
# CLOUDINARY_API_KEY=""
# CLOUDINARY_API_SECRET=""
```

**Important:** Generate a secure random string for `NEXTAUTH_SECRET`. You can use:
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push database schema to your database
npm run db:push

# (Optional) Seed the database with initial data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

## Project Structure

- `/app` - Next.js 14 App Router pages and API routes
- `/components` - React components
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and migrations
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions

## Features

- Multi-tenant architecture (multiple schools)
- Role-based access control
- Student management
- Academic management (classes, subjects, grades, attendance)
- Financial management (fees, payments, transactions)
- Hostel management
- Application system
- Transport management
- Communication (announcements)

## Deployment

### GitHub Setup
See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed instructions on pushing to GitHub.

### Vercel Deployment
See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for step-by-step Vercel deployment guide.

### Quick Deploy to Vercel
1. Push code to GitHub: `Leone2022/adventhopeacademy`
2. Import project in Vercel
3. Add environment variables
4. Deploy!


