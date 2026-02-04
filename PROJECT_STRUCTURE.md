# Advent Hope Academy - Project Structure

## Overview
**Framework**: Next.js 14.2+ (TypeScript, App Router)  
**Database**: PostgreSQL via Supabase with Prisma ORM  
**Authentication**: NextAuth.js (role-based access control)  
**UI**: Tailwind CSS + Lucide React icons  
**Exports**: Excel (xlsx), PDF (jspdf), Word (docx)  
**Deployment**: Vercel (auto-trigger on GitHub push)

---

## Root Directory Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts (dev, build, lint, db commands) |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS plugins (Tailwind, nesting) |
| `next.config.js` | Next.js configuration |
| `middleware.ts` | Global middleware (authentication checks) |
| `next-env.d.ts` | Next.js TypeScript definitions |
| `.env.local` | Local environment variables (secrets, DB URL) |
| `.env.example` | Template for environment variables |

---

## `/app` - Next.js App Router Directory
**Structure**: Pages, API routes, layouts, and server/client components

### Root App Files
- `layout.tsx` - Root layout (HTML structure, providers)
- `page.tsx` - Home page (`/`)
- `providers.tsx` - Client context providers (NextAuth session)
- `globals.css` - Global Tailwind styles
- `sitemap.ts` - SEO sitemap generation

### `/app/api` - REST API Endpoints

#### `/api/auth/*`
- `[...nextauth]/route.ts` - NextAuth.js configuration (Credentials provider)
- `login/route.ts` - Session login endpoint
- `register/route.ts` - User registration (students, parents, staff)
- `change-password/route.ts` - Password change (authenticated users)
- `forgot-password/route.ts` - Password reset request
- `reset-password/route.ts` - Password reset completion
- `validate-reset-token/route.ts` - Verify reset tokens
- `verify-email/route.ts` - Email verification

#### `/api/admin/*`
- `approve-registration/route.ts` - Admin approves pending registrations
- `bulk-approve-registrations/route.ts` - Bulk approval
- `reject-registration/route.ts` - Reject pending applications
- `create-student/route.ts` - Create new student account
- `create-parent/route.ts` - Create new parent account
- `pending-registrations/route.ts` - List pending registrations
- `parents/[id]/route.ts` - GET (fetch parent), PUT (update), POST (reset password)

#### `/api/parent/*`
- `link-student/route.ts` - Parent searches and links child (GET search, POST link)
- `children/route.ts` - List all linked children

#### `/api/students/*`
- `[id]/route.ts` - GET (fetch student details), PUT (update), DELETE
- `[id]/payments/route.ts` - Student payment history

#### `/api/applications/*`
- `[id]/route.ts` - Fetch application details
- `[id]/convert/route.ts` - Convert application to active student

#### Other APIs
- `/api/apply/*` - Application submission endpoints
- `/api/register/*` - Registration endpoints (student, parent, check-status)
- `/api/finances/stats` - Financial dashboard statistics
- `/api/hostels/rooms` - Hostel room management
- `/api/staff/[id]` - Staff member endpoints
- `/api/upload/*` - File upload handling
- `/api/middleware/*` - Helper middleware functions

### `/app/auth/*` - Authentication Pages
- `login/page.tsx` - User login page
- `register/page.tsx` - User registration page
- `error/page.tsx` - Authentication error page

### `/app/portal/*` - Parent/Student Self-Service Portal
- `login/page.tsx` - Portal login page
- `add-child/page.tsx` - **NEW** Parent links children (search & verify)
- `change-password/page.tsx` - Change password
- `forgot-password/page.tsx` - Forgot password reset flow
- `reset-password/page.tsx` - Reset password completion

### `/app/dashboard/*` - Admin Dashboard
- `page.tsx` - Dashboard overview
- `activity/` - Activity log/audit trail
- `applications/` - Manage student applications
- `attendance/` - Attendance tracking
- `calendar/` - School calendar events
- `classes/` - Class management
- `finances/` - Financial module
- `grades/` - Grade management
- `hostel/` - Hostel assignments
- `hostels/` - Hostel management
- `parents/` - Parent management (including `/[id]` for editing)
- `reports/` - Generate reports
- `settings/` - Admin settings
- `staff/` - Staff management (list, create, edit)
- `students/` - Student management
  - `[id]/` - Student details view
  - `[id]/edit` - Edit student
  - `[id]/payment` - Payment record
  - `[id]/card` - Student card printing
  - `new/` - Create new student

### `/app/parent/*` - Parent Portal
- `dashboard/page.tsx` - **MODIFIED** Parent's main page (shows linked children)
  - `client.tsx` - Child client-side rendering component
- `children/[id]/page.tsx` - **NEW** Student details page (server-side with security check)
  - `client.tsx` - Student info display component

### `/app/student/*` - Student Portal
- `dashboard/page.tsx` - Student dashboard

### `/app/apply/*` - Application Flow
- `page.tsx` - Start application
- `status/page.tsx` - Check application status

### `/app/register/*` - User Registration
- `student/` - Student self-registration
- `parent/` - Parent self-registration
- `status/` - Check registration status

### `/app/admin/*` - Admin-Only Pages
- `create-accounts/` - Bulk create accounts
- `pending-registrations/` - Review pending registrations
- `students/` - Student management
  - `[id]/view/` - Student details

---

## `/components` - React Components
**Convention**: Reusable UI components and feature components

### `/components/ui/*` - UI Library Components
- `button.tsx` - Button variants (primary, secondary, outline, etc.)
- `input.tsx` - Form input field
- `select.tsx` - Dropdown select
- `card.tsx` - Card container
- `badge.tsx` - Badge/label component
- `table.tsx` - Data table
- `modal.tsx` - Modal dialog
- `avatar.tsx` - User avatar
- `dropdown.tsx` - Dropdown menu
- `navbar.tsx` - Navigation bar
- `sidebar.tsx` - Sidebar navigation
- And many more...

### Root Components
- `StudentApplicationForm.tsx` - Application form component
- [Other feature components as needed]

---

## `/lib` - Utility & Service Functions

| File | Purpose |
|------|---------|
| `auth.ts` | Authentication helpers (session validation, role checks) |
| `email.ts` | Email service (Nodemailer configuration for Gmail) |
| `multi-tenant.ts` | Multi-tenancy support utilities |
| `pdf-utils.ts` | PDF generation helpers (jsPDF, autotable) |
| `prisma.ts` | Prisma client singleton |
| `roles.ts` | Role-based access control definitions |
| `security.ts` | Security utilities (encryption, hashing, token generation) |
| `utils.ts` | General utility functions (formatting, validation) |

---

## `/hooks` - React Hooks
| File | Purpose |
|------|---------|
| `useAuth.ts` | Authentication hook (current session, user info) |
| [Other custom hooks] | Additional hook utilities |

---

## `/types` - TypeScript Type Definitions
| File | Purpose |
|------|---------|
| `next-auth.d.ts` | NextAuth.js type augmentation (custom User properties) |
| `index.d.ts` | Application-wide type definitions |

---

## `/prisma` - Database Configuration
| File | Purpose |
|------|---------|
| `schema.prisma` | **Database schema** (User, Student, Parent, Grades, Attendance, etc.) |
| `seed.ts` | Database seeding script (populate test data) |
| `migrations/` | Database migration history |
  - `20251230143841_initial_schema/` - Initial schema
  - `20260122190304_add_password_reset_fields/` - Password reset tokens
  - `20260123092627_add_user_registration_fields/` - Registration fields

### Database Schema Summary
**Core Tables:**
- `User` - Authentication (email, password, role, status)
- `Student` - Student records (class, number, personal info)
- `Parent` - Parent records (contact, occupation)
- `ParentStudent` - Junction table (M:N relationship)
- `Grade` - Academic grades (subject, score, term, year)
- `Attendance` - Attendance records (present/absent/late)
- `StudentAccount` - Financial account (balance, payments)
- `Class` - Class definitions (level, stream, curriculum)
- `Staff` - Staff/Teacher records
- `Application` - Student applications
- `Registration` - User registration pending approval

---

## `/public` - Static Assets
```
public/
├── uploads/
│   ├── documents/     - Uploaded documents
│   ├── photos/        - Student/staff photos
│   └── results/       - Academic results files
└── robots.txt         - SEO robots.txt
```

---

## `/scripts` - Utility & Setup Scripts
| File | Purpose |
|------|---------|
| `create-admin.js` | Create admin user in database |
| `create-test-accounts.js` | Create test accounts (admin, parent, student) |
| `test-email.js` | Test email configuration |
| `test-login.js` | Test authentication endpoints |
| `test-student-login.js` | Test student login |
| `test-reset-password.js` | Test password reset flow |
| `check-accounts.js` | Verify accounts exist in database |
| `backup-database.js` | Backup database |
| `restore-database.js` | Restore database from backup |
| `set-reset-token.ts` | Set password reset token manually |
| `automated-backup.ps1` | PowerShell backup automation |
| `setup.ps1` | Windows setup script |
| `setup-database.ps1` | Database initialization script |
| `push-to-github.ps1` | Git push automation |

---

## `/backups` - Database Backups
```
backups/
└── backup-2026-01-22T20-12-37-527Z.json  - Full database snapshot
```

---

## `/logs` - Application Logs
```
logs/
├── error.log      - Error logs
├── combined.log   - All logs
└── [other logs]   - Development logs
```

---

## Key Files by Functionality

### Authentication & Authorization
- `lib/auth.ts` - Auth helpers
- `lib/roles.ts` - Role definitions
- `app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `middleware.ts` - Auth middleware

### Database & ORM
- `prisma/schema.prisma` - Data model
- `lib/prisma.ts` - Client initialization
- `prisma/migrations/` - Schema history

### Email Service
- `lib/email.ts` - Email config & sending
- `app/api/auth/forgot-password/route.ts` - Uses email service
- `app/api/auth/reset-password/route.ts` - Uses email service

### Parent Portal (NEW)
- `app/api/parent/link-student/route.ts` - API for linking
- `app/portal/add-child/page.tsx` - Parent linking page
- `app/parent/dashboard/page.tsx` - Shows linked children
- `app/parent/children/[id]/page.tsx` - Child details (server-side verified)
- `app/parent/children/[id]/client.tsx` - Display component

### Data Export
- `lib/pdf-utils.ts` - PDF generation
- Pages use xlsx, jspdf, docx libraries

### Admin Features
- `/app/dashboard/*` - Admin dashboard pages
- `/app/admin/*` - Admin-only pages
- `/app/api/admin/*` - Admin API endpoints

---

## Database Relationships

```
User (1) ──── (1) Student
User (1) ──── (1) Parent
Parent (M) ──── (N) Student via ParentStudent
Student (1) ──── (M) Grade
Student (1) ──── (M) Attendance
Student (1) ──── (1) StudentAccount
Class (1) ──── (M) Student
Staff (1) ──── (M) Grade (teacher)
```

---

## Environment Variables (.env.local)

```bash
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]/[db]

# NextAuth
NEXTAUTH_SECRET=[random-secret]
NEXTAUTH_URL=http://localhost:3000

# Email (Gmail SMTP)
GMAIL_USER=[your-email@gmail.com]
GMAIL_PASS=[your-app-password]

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=[your-key]
AWS_SECRET_ACCESS_KEY=[your-secret]
AWS_REGION=us-east-1

# Cloudinary (optional)
CLOUDINARY_URL=[your-cloudinary-url]
```

---

## Role-Based Access Control (RBAC)

| Role | Access |
|------|--------|
| `SUPER_ADMIN` | All system access |
| `SCHOOL_ADMIN` | School operations, accounts, reports |
| `REGISTRAR` | Student registration, applications |
| `PARENT` | View linked children, contact teachers |
| `STUDENT` | View own grades, attendance, balance |
| `TEACHER` | Manage classes, record grades/attendance |

---

## Current Development Status

### ✅ Completed Features
- User authentication (NextAuth.js)
- Student management & registration
- Parent registration & linking system
- Parent portal with child linking UI
- Student details page (secure server-side verification)
- Grade tracking & display
- Attendance recording
- Financial account management
- Admin dashboard
- Email notifications
- Data export (Excel, PDF, Word)
- Role-based access control

### 🚀 In Development
- Enhanced financial reporting
- Advanced grade analytics
- Parent-teacher messaging
- SMS notifications
- Bulk CSV import

### 📋 Planned
- Offline-first capability
- Mobile app (React Native)
- Advanced analytics dashboard
- Automated report generation
- Student performance predictive modeling

---

## Installation & Running

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your database & email config

# Initialize database
npm run db:push
npm run db:seed

# Run development server
npm run dev
# Visit: http://localhost:3000

# Build for production
npm run build
npm start
```

---

## Testing

### Test Accounts Created
- **Admin**: admin@adventhope.ac.zw / admin123
- **Parent**: testparent@adventhope.ac.zw / parent123 (linked to STU2024999)
- **Student**: STU2024999 / student123

### Quick Tests
```bash
# Run test script
node scripts/check-accounts.js

# Test login
node scripts/test-login.js

# Test email
node scripts/test-email.js
```

---

## Deployment

**Hosting**: Vercel (auto-deploy on GitHub push)  
**Database**: Supabase PostgreSQL  
**Email**: Gmail SMTP

### Deploy Steps
1. Push code to GitHub
2. Vercel auto-triggers build
3. Set environment variables in Vercel dashboard
4. Database migrations auto-run
5. Live at: [your-vercel-url].vercel.app

---

*Last Updated: 2026-01-23*  
*Project: Advent Hope Academy School Management System*  
*Location: Zimbabwe*  
*Scale: 1,000 - 10,000 students*
