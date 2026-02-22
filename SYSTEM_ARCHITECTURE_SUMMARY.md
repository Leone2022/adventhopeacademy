# System Architecture & Integration Summary
## Advent Hope Academy School Management System

---

## 📋 TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Architecture](#database-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [Core Workflows](#core-workflows)
6. [Financial System](#financial-system)
7. [API Endpoints](#api-endpoints)
8. [Integration Points](#integration-points)

---

## 🎯 SYSTEM OVERVIEW

### Architecture Type
- **Multi-Tenant SaaS Application**: Each school has isolated data via `schoolId`
- **Role-Based Access Control (RBAC)**: 8 user roles with hierarchical permissions
- **Full-Stack Next.js 14**: App Router, Server Components, API Routes
- **PostgreSQL Database**: Relational database with Prisma ORM

### Core Modules
1. **User Management** - Authentication, authorization, user accounts
2. **Student Management** - Registration, records, academic tracking
3. **Application System** - New student applications and admissions
4. **Academic Management** - Classes, subjects, grades, attendance, timetables
5. **Financial Management** - Fees, payments, invoices, transactions
6. **Hostel Management** - Accommodation allocation and monitoring
7. **Transport Management** - Routes and student assignments
8. **Communication** - Announcements, messages, email notifications
9. **Parent Portal** - Parent access to student information

---

## 🛠️ TECHNOLOGY STACK

```
Frontend:
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Shadcn UI Components

Backend:
- Next.js API Routes
- NextAuth.js (Authentication)
- Prisma ORM
- Node.js

Database:
- PostgreSQL
- Prisma Client

Email:
- Nodemailer (Gmail SMTP)
- Can be swapped for SendGrid/AWS SES

Security:
- bcrypt (Password hashing)
- JWT (Session tokens)
- CSRF Protection
- Account lockout mechanism
```

---

## 🗄️ DATABASE ARCHITECTURE

### Primary Keys Strategy
**All tables use `cuid()` for primary keys**
- Format: `id String @id @default(cuid())`
- Example: `clh3k4j5m0000356xtv8nqw0f`

### Core Database Models (31 tables)

#### 1. **School** - Multi-tenant root
```prisma
id: String (PK)
subdomain: String (UNIQUE) - e.g., "adventhope"
domain: String (UNIQUE, nullable) - Custom domain
name, logo, colors, settings
isActive: Boolean

Relationships:
- Has many: Users, Students, Staff, Classes, Applications, Subjects, etc.
```

#### 2. **User** - Authentication & Authorization
```prisma
id: String (PK)
email: String (UNIQUE)
password: String (hashed with bcrypt)
name, phone
role: UserRole enum
status: UserStatus enum (ACTIVE, PENDING, REJECTED, SUSPENDED, INACTIVE)
schoolId: String (FK → School) - NULL for SUPER_ADMIN

Security Fields:
- emailVerificationToken, emailVerificationExpires
- passwordResetToken, passwordResetExpires
- twoFactorEnabled, twoFactorSecret
- failedLoginAttempts, lastFailedLoginAt, accountLockedUntil
- mustChangePassword: Boolean

Relationships:
- Belongs to: School (optional)
- Has one: Student, Staff, Parent profile
- Has many: Sessions, Accounts (OAuth)
```

**UserRole Enum:**
```typescript
SUPER_ADMIN     (Level 8) - Platform admin, access all schools
SCHOOL_ADMIN    (Level 7) - School owner/principal
ACCOUNTANT      (Level 6) - Financial management
REGISTRAR       (Level 6) - Student records
TEACHER         (Level 5) - Academic operations
HOSTEL_MANAGER  (Level 5) - Hostel operations
PARENT          (Level 3) - View own children's data
STUDENT         (Level 2) - View own data
```

#### 3. **Student** - Central entity
```prisma
id: String (PK)
studentNumber: String (UNIQUE) - e.g., "AHA20240001"
schoolId: String (FK → School)
userId: String (FK → User, nullable)
firstName, lastName, middleName
dateOfBirth, gender: Gender enum
curriculum: Curriculum enum (ZIMSEC | CAMBRIDGE)
currentClassId: String (FK → Class, nullable)
status: StudentStatus enum (ACTIVE, GRADUATED, TRANSFERRED, etc.)

Profile Data:
- photo, nationalId, birthCertNumber
- address, phone, email
- bloodGroup, allergies, medicalConditions
- emergencyContacts: Json

Academic:
- admissionDate, previousSchool, previousGrade
- academicResults: Json, documents: Json

Flags:
- isBoarding, isAlumni

Relationships:
- Belongs to: School, Class, TransportRoute, User
- Has many: Grades, Attendance, DisciplineRecords, ReportCards
- Has one: StudentAccount, HostelAllocation, Application
- Many-to-many: Parents (via ParentStudent)
```

#### 4. **Parent** - Guardian information
```prisma
id: String (PK)
userId: String (FK → User, UNIQUE)
firstName, lastName, nationalId
occupation, employer, workPhone, workAddress
city, address, alternatePhone

Relationships:
- Belongs to: User
- Many-to-many: Students (via ParentStudent)
- Has many: Payments, Messages
```

#### 5. **ParentStudent** - Link table
```prisma
id: String (PK)
parentId: String (FK → Parent)
studentId: String (FK → Student)
relationship: String - e.g., "Father", "Mother", "Guardian"
isPrimary: Boolean - Primary contact
canPickup: Boolean
emergencyContact: Boolean

Unique constraint: [parentId, studentId]
```

#### 6. **Staff** - Employee records
```prisma
id: String (PK)
schoolId: String (FK → School)
userId: String (FK → User, nullable)
employeeNumber: String (UNIQUE)
firstName, lastName, middleName
dateOfBirth, gender, nationalId
position, department, employmentType
hireDate, terminationDate, salary
qualifications: Json
isActive: Boolean

Relationships:
- Belongs to: School, User
- Has many: ClassSubjects (teaches), Timetables, Messages
- Inverse: ClassTeacher of Classes, HostelManager of Hostels
```

#### 7. **Class** - Academic classes/forms
```prisma
id: String (PK)
schoolId: String (FK → School)
name: String - e.g., "Form 1A"
level: String - e.g., "Form 1"
stream: String - e.g., "A"
curriculum: Curriculum enum
capacity: Int
classTeacherId: String (FK → Staff, nullable)
isActive: Boolean

Unique constraint: [schoolId, name]

Relationships:
- Belongs to: School, ClassTeacher (Staff)
- Has many: Students, ClassSubjects, Timetables, FeeStructures
```

#### 8. **Subject** - Academic subjects
```prisma
id: String (PK)
schoolId: String (FK → School)
code: String - e.g., "MATH101"
name: String - e.g., "Mathematics"
curriculum: Curriculum enum
category: String
isCore: Boolean - Core vs. elective
isExaminable: Boolean
isActive: Boolean

Unique constraint: [schoolId, code, curriculum]

Relationships:
- Belongs to: School
- Has many: ClassSubjects, Grades, Timetables
```

#### 9. **ClassSubject** - Classes-Subjects mapping
```prisma
id: String (PK)
schoolId: String (FK → School)
classId: String (FK → Class)
subjectId: String (FK → Subject)
teacherId: String (FK → Staff, nullable)

Unique constraint: [classId, subjectId]

Relationships:
- Belongs to: School, Class, Subject, Teacher (Staff)
```

---

## 💰 FINANCIAL SYSTEM (Detailed)

### Financial Architecture

#### Core Financial Models:

##### 1. **StudentAccount** - Student financial ledger
```prisma
id: String (PK)
studentId: String (FK → Student, UNIQUE)
balance: Decimal - Current outstanding balance
lastPaymentDate: DateTime
lastPaymentAmount: Decimal

Relationships:
- Belongs to: Student (one-to-one)
- Has many: Transactions, Invoices, PaymentPlans
```

##### 2. **Transaction** - All financial movements
```prisma
id: String (PK)
studentAccountId: String (FK → StudentAccount)
type: TransactionType enum
amount: Decimal
balanceBefore: Decimal - Balance before transaction
balanceAfter: Decimal - Balance after transaction
description: String
reference: String - Transaction reference number
paymentMethod: PaymentMethod enum (nullable)
proofOfPayment: String - File URL
bankReference, mobileMoneyRef: String
processedBy: String - User ID who processed
processedAt: DateTime
notes: String
invoiceItemId: String (FK → InvoiceItem, nullable)

Relationships:
- Belongs to: StudentAccount, InvoiceItem
- Has one: Payment (inverse)
```

**TransactionType Enum:**
```typescript
CHARGE      - Add fees/charges to account (increases balance)
PAYMENT     - Student pays (decreases balance)
ADJUSTMENT  - Manual balance adjustment
REFUND      - Refund payment (increases balance)
WAIVER      - Fee waiver/discount (decreases balance)
DISCOUNT    - Discount applied (decreases balance)
```

**PaymentMethod Enum:**
```typescript
CASH, BANK_TRANSFER, MOBILE_MONEY, 
ECOCASH, INNBUCKS, PAYNOW, CHEQUE, CARD, OTHER
```

##### 3. **Payment** - Payment receipts
```prisma
id: String (PK)
transactionId: String (FK → Transaction, UNIQUE)
parentId: String (FK → Parent, nullable)
receiptNumber: String (UNIQUE) - e.g., "RCP202400001"
amount: Decimal
paymentMethod: PaymentMethod enum
proofOfPayment: String - File URL
bankReference, mobileMoneyRef, chequeNumber: String
status: String - "Pending", "Verified", "Rejected"
verifiedBy: String - User ID
verifiedAt: DateTime
rejectionReason: String
notes: String

Relationships:
- Belongs to: Transaction (one-to-one), Parent
```

##### 4. **Invoice** - Formal fee invoices
```prisma
id: String (PK)
schoolId: String (FK → School)
studentAccountId: String (FK → StudentAccount)
invoiceNumber: String (UNIQUE) - e.g., "INV202400001"
subtotal: Decimal
discount: Decimal
total: Decimal
amountPaid: Decimal
amountDue: Decimal
issueDate: DateTime
dueDate: DateTime
status: InvoiceStatus enum
notes: String
createdBy: String - User ID

Relationships:
- Belongs to: School, StudentAccount
- Has many: InvoiceItems
```

**InvoiceStatus Enum:**
```typescript
DRAFT, SENT, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED, VOIDED
```

##### 5. **InvoiceItem** - Invoice line items
```prisma
id: String (PK)
invoiceId: String (FK → Invoice)
feeStructureId: String (FK → FeeStructure, nullable)
description: String
quantity: Int
unitPrice: Decimal
amount: Decimal - quantity × unitPrice

Relationships:
- Belongs to: Invoice, FeeStructure
- Has many: Transactions
```

##### 6. **FeeStructure** - Fee definitions
```prisma
id: String (PK)
schoolId: String (FK → School)
academicYearId: String (FK → AcademicYear)
termId: String (FK → Term, nullable)
classId: String (FK → Class, nullable)
name: String - e.g., "Tuition", "Transport", "Boarding"
feeType: String
curriculum: Curriculum enum (nullable)
amount: Decimal
dueDate: DateTime
lateFee: Decimal - Penalty for late payment
description: String
isActive: Boolean
createdBy: String

Relationships:
- Belongs to: School, AcademicYear, Term, Class
- Has many: InvoiceItems
```

##### 7. **PaymentPlan** - Installment plans
```prisma
id: String (PK)
studentAccountId: String (FK → StudentAccount)
totalAmount: Decimal
numberOfInstallments: Int
installmentAmount: Decimal
startDate: DateTime
status: String - "Active", "Completed", "Cancelled"
notes: String
approvedBy: String - User ID

Relationships:
- Belongs to: StudentAccount
- Has many: PaymentPlanInstallments
```

##### 8. **PaymentPlanInstallment** - Individual installments
```prisma
id: String (PK)
paymentPlanId: String (FK → PaymentPlan)
installmentNumber: Int
amount: Decimal
dueDate: DateTime
paidDate: DateTime (nullable)
paidAmount: Decimal (nullable)
status: String - "Pending", "Paid", "Overdue"

Unique constraint: [paymentPlanId, installmentNumber]

Relationships:
- Belongs to: PaymentPlan
```

### Financial Workflow Algorithm

#### 1. **Student Registration with Initial Payment**
```
INPUT: Student data, totalFees, initialDeposit

PROCESS:
1. Calculate balance = totalFees - initialDeposit
2. Begin database transaction:
   a. Create Student record
   b. Create StudentAccount with balance
   c. If initialDeposit > 0:
      - Create CHARGE transaction (adds totalFees to balance)
      - Create PAYMENT transaction (reduces balance by deposit)
3. Commit transaction

RESULT: Student registered with correct balance
```

#### 2. **Recording a Payment**
```
INPUT: studentId, amount, paymentMethod, reference

PROCESS:
1. Get current StudentAccount balance
2. Calculate new balance = currentBalance + amount (adds to owed amount)
   NOTE: Balance represents AMOUNT OWED, so payment INCREASES it
   Actually: newBalance = currentBalance - amount (pays down debt)

3. Begin database transaction:
   a. Update StudentAccount:
      - Set balance = newBalance
      - Set lastPaymentDate = now
      - Set lastPaymentAmount = amount
   
   b. Create Transaction record:
      - type: PAYMENT
      - amount: payment amount
      - balanceBefore: old balance
      - balanceAfter: new balance
      - paymentMethod, reference, etc.
      - processedBy: current user
   
   c. Create Payment record:
      - Generate receiptNumber (RCP{YEAR}{SEQUENCE})
      - Link to transaction
      - Store payment details
   
4. Commit transaction

RESULT: Payment recorded, balance updated, receipt generated
```

#### 3. **Charging Fees**
```
INPUT: studentId, feeAmount, description

PROCESS:
1. Get current StudentAccount balance
2. Calculate new balance = currentBalance + feeAmount

3. Begin database transaction:
   a. Update StudentAccount balance
   b. Create Transaction record:
      - type: CHARGE
      - amount: fee amount
      - balanceBefore/After
      - description
      - processedBy: current user

4. Commit transaction

RESULT: Fees added to student account
```

#### 4. **Invoice Generation**
```
INPUT: studentId, feeStructures[], dueDate

PROCESS:
1. Generate invoiceNumber (INV{YEAR}{SEQUENCE})
2. Calculate totals from fee structures
3. Begin transaction:
   a. Create Invoice:
      - status: DRAFT or SENT
      - subtotal, discount, total
      - amountPaid: 0
      - amountDue: total
   
   b. Create InvoiceItems for each fee
   
   c. (Optional) Create CHARGE transaction to update balance

4. Commit transaction

RESULT: Invoice created and sent to parent
```

### Balance Calculation Logic

**Important: Balance Direction**
```
Positive Balance = Student OWES money
Negative Balance = Student has CREDIT (overpaid)
Zero Balance = Fully paid up

Examples:
- Balance: $500 → Student owes $500
- Balance: -$50 → Student has $50 credit
- Balance: $0 → Fully paid
```

**Transaction Impact:**
```
CHARGE:   balance increases (add debt)
PAYMENT:  balance decreases (reduce debt)
WAIVER:   balance decreases (remove debt)
REFUND:   balance increases (add credit/debt)
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Authentication Flow

#### 1. **Login Process**
```
INPUT: identifier (email/phone/studentNumber), password, role

ALGORITHM:
1. Identify login type by role:
   - STUDENT: Use studentNumber as identifier
   - PARENT: Use email or phone
   - STAFF/ADMIN: Use email

2. Fetch user from database with relations

3. Check account status:
   - User exists and isActive?
   - Student status is ACTIVE?
   - Account locked? (accountLockedUntil)

4. Verify password with bcrypt:
   - If invalid:
     * Increment failedLoginAttempts
     * If attempts >= 5: Lock account for 15 minutes
     * Send lockout email
     * Throw error
   
5. If password valid:
   - Reset failedLoginAttempts to 0
   - Clear accountLockedUntil
   - Update lastLogin
   - For SUPER_ADMIN/SCHOOL_ADMIN: Clear mustChangePassword

6. Create JWT session token with:
   - User ID, role, schoolId, school info
   - mustChangePassword flag

7. Return session

RESULT: User authenticated with JWT token
```

#### 2. **Account Lockout Mechanism**
```
Threshold: 5 failed attempts
Lockout Duration: 15 minutes
Actions: Email notification sent
Recovery: Automatic after duration OR password reset
```

#### 3. **Password Requirements**
```typescript
minLength: 8
requireUppercase: true
requireLowercase: true
requireNumbers: true
requireSpecialChars: false
```

#### 4. **Session Management**
```
Strategy: JWT (NextAuth.js)
Duration: 30 days
Storage: HTTP-only cookies
Refresh: On token update trigger
```

### Authorization (RBAC)

#### Permission Hierarchy
```
SUPER_ADMIN (8)
  └─ Full access to all schools
  └─ Create/manage schools
  └─ System configuration

SCHOOL_ADMIN (7)
  └─ Full access within own school
  └─ User management
  └─ All modules

ACCOUNTANT (6) / REGISTRAR (6)
  └─ Financial management / Student records
  └─ Module-specific access

TEACHER (5) / HOSTEL_MANAGER (5)
  └─ Academic operations / Hostel management
  └─ Limited access

PARENT (3)
  └─ Read-only access to own children's data
  └─ Communication with school

STUDENT (2)
  └─ View own academic records
  └─ Limited portal access
```

#### Multi-Tenant Isolation
```
Rule: All data queries filtered by schoolId
Exception: SUPER_ADMIN can access all schools

Implementation:
- Middleware checks user's schoolId
- Database queries include: WHERE schoolId = user.schoolId
- API routes validate school access
```

### Security Features

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **Email Verification**: Token-based, expires after 24 hours
3. **Password Reset**: Secure token, expires after 1 hour
4. **Two-Factor Authentication**: Optional, TOTP-based
5. **Account Lockout**: After 5 failed attempts
6. **Session Expiry**: 30 days, sliding window
7. **CSRF Protection**: Built into Next.js
8. **SQL Injection Protection**: Prisma ORM parameterization

---

## 🔄 CORE WORKFLOWS

### 1. Student Application Workflow

```
STATES: DRAFT → PENDING → UNDER_REVIEW → 
        DOCUMENTS_REQUIRED/INTERVIEW_SCHEDULED → 
        APPROVED/REJECTED/WAITLISTED → ENROLLED

ALGORITHM:
1. Public user submits application:
   - Personal info, guardian info
   - Academic history
   - Documents (birth certificate, reports, photos)
   - Generate applicationNumber (APP{YEAR}{SEQUENCE})
   - Status: DRAFT initially

2. User submits application:
   - Status → PENDING
   - submittedAt timestamp set

3. Admin reviews:
   - Status → UNDER_REVIEW
   - reviewedBy, reviewedAt set
   - Add reviewNotes

4. Request documents (if needed):
   - Status → DOCUMENTS_REQUIRED

5. Schedule interview (optional):
   - Status → INTERVIEW_SCHEDULED
   - Set interviewDate, interviewNotes

6. Make decision:
   - APPROVED:
     * Status → APPROVED
     * decisionDate, decisionBy set
     * Ready for enrollment
   
   - REJECTED:
     * Status → REJECTED
     * Set rejectionReason
   
   - WAITLISTED:
     * Status → WAITLISTED

7. Enroll approved application:
   - Create Student record from Application
   - Create User account (if applicable)
   - Create StudentAccount
   - Generate studentNumber
   - Link Application.convertedToStudentId = student.id
   - Status → ENROLLED
   - Send welcome email with credentials
```

### 2. Student Registration Workflow

```
INPUT: Application or Direct Registration

ALGORITHM:
1. Validate input data:
   - Required fields present
   - Student number unique (or generate)
   - School context available

2. Generate studentNumber (if not provided):
   - Format: AHA{YEAR}{SEQUENCE}
   - Example: AHA20240001

3. Calculate financial start:
   - totalFees: sum of applicable fees
   - initialDeposit: amount paid upfront
   - balance: totalFees - initialDeposit

4. Begin database transaction:
   
   a. Create Student record:
      - All personal, academic, medical info
      - status: ACTIVE
      - admissionDate: now
      - Link to Class, School
   
   b. Create StudentAccount:
      - balance: calculated balance
      - lastPaymentDate/Amount: if initialDeposit > 0
   
   c. Create initial transactions (if fees):
      - CHARGE transaction: totalFees
      - PAYMENT transaction: initialDeposit
   
   d. Link parents (if provided):
      - Create or link Parent records
      - Create ParentStudent relationships
   
   e. Create User account:
      - Generate secure password
      - role: STUDENT
      - mustChangePassword: true
      - Link to Student record
   
   f. Allocate hostel (if boarding):
      - Find available bed
      - Create HostelAllocation
   
   g. Assign transport (if needed):
      - Link to TransportRoute

5. Commit transaction

6. Send welcome emails:
   - To student: credentials, login URL
   - To parents: student registration confirmation

RESULT: Student fully registered and activated
```

### 3. Academic Management Workflow

#### A. **Grade Entry**
```
1. Teacher selects: Class, Subject, Term, AssessmentType
2. Enters scores for each student
3. System calculates:
   - percentage: (score / maxScore) × 100
   - grade: Based on grading scale
   - gradePoint: For GPA calculation
4. Save Grade records
5. Update ReportCard aggregates
```

#### B. **Attendance Marking**
```
1. Teacher views class roster for date
2. Marks each student:
   - PRESENT, ABSENT, LATE, EXCUSED, SICK
3. Saves Attendance records
4. Updates ReportCard attendance totals
5. (Optional) Send notifications for absences
```

#### C. **Report Card Generation**
```
1. Select: Student, AcademicYear, Term
2. Aggregate data:
   - All grades for term
   - Calculate totalMarks, averagePercentage
   - Determine overallGrade
   - Calculate class/stream position
   - Sum attendance (daysPresent, daysAbsent)
3. Teacher adds comments
4. Head teacher reviews and adds comment
5. Publish report:
   - isPublished: true
   - publishedAt, publishedBy set
6. Notify parents
```

### 4. Hostel Management Workflow

```
HIERARCHY: Hostel → HostelBlock → HostelRoom → HostelBed

ALLOCATION PROCESS:
1. Student marked as isBoarding
2. Find available HostelBed:
   - Match gender
   - Check capacity
   - Room has space
3. Create HostelAllocation:
   - Link student to bed
   - Set checkInDate
   - allocatedBy: current user
4. Mark bed as occupied:
   - isAvailable: false
5. (Optional) Create HostelFee charge

DE-ALLOCATION:
1. Set checkOutDate
2. Mark isActive: false
3. Free bed: isAvailable: true
```

### 5. Communication Workflow

#### A. **Announcements**
```
1. Admin creates announcement:
   - title, content
   - targetAudience: "ALL", "STUDENTS", "PARENTS", "STAFF", specific class
   - flags: isUrgent, isPinned
   - options: sendSMS, sendEmail

2. Set publishDate, expiryDate

3. System distributes:
   - Shows on relevant dashboards
   - (Optional) Send email/SMS to target audience

4. Track engagement:
   - Views, read status
```

#### B. **Messages**
```
1. User composes message:
   - Select recipient (teacher, parent, student)
   - subject, content
   - (Optional) attachments

2. Create Message record:
   - senderId, recipientId
   - senderType, recipientType
   - isRead: false

3. Recipient receives notification

4. Threading support:
   - parentMessageId links replies
```

---

## 🔌 API ENDPOINTS

### Authentication
```
POST   /api/auth/register          - Create new user account
POST   /api/auth/[...nextauth]     - NextAuth.js login/logout/session
POST   /api/auth/verify-email      - Verify email with token
POST   /api/auth/reset-password    - Initiate password reset
GET    /api/auth/validate-reset-token - Validate reset token
```

### Students
```
GET    /api/students              - List students (with filters, pagination)
POST   /api/students              - Create new student
GET    /api/students/[id]         - Get student details
PATCH  /api/students/[id]         - Update student
DELETE /api/students/[id]         - Delete/deactivate student
GET    /api/students/export       - Export students to CSV/PDF

GET    /api/students/[id]/payments - Get payment history
POST   /api/students/[id]/payments - Record payment
```

### Applications
```
GET    /api/applications          - List applications (admin)
POST   /api/applications          - Submit new application
GET    /api/applications/[id]     - Get application details
PATCH  /api/applications/[id]     - Update application status
POST   /api/applications/[id]/approve - Approve and convert to student

GET    /api/register/check-status - Check application status
POST   /api/register/student      - Public registration
```

### Staff
```
GET    /api/staff                 - List staff members
POST   /api/staff                 - Create staff
GET    /api/staff/[id]            - Get staff details
PATCH  /api/staff/[id]            - Update staff
DELETE /api/staff/[id]            - Deactivate staff
```

### Finances
```
GET    /api/finances/stats        - Financial statistics and reports
```

### Parent
```
GET    /api/parent/children       - Get parent's children data
POST   /api/parent/link-student   - Link parent to student
```

### Hostels
```
GET    /api/hostels               - List hostels
POST   /api/hostels               - Create hostel
GET    /api/hostels/rooms         - List rooms and availability
POST   /api/hostels/allocate      - Allocate student to bed
```

### Uploads
```
POST   /api/upload                - Upload files (documents, photos)
```

### Middleware
```
GET    /api/middleware/*          - School identification from subdomain/domain
```

---

## 🔗 INTEGRATION POINTS FOR FINANCIAL SYSTEM

### Current Financial System Summary

**Capabilities:**
1. ✅ Student account ledger (balance tracking)
2. ✅ Transaction recording (CHARGE, PAYMENT, etc.)
3. ✅ Payment processing with receipts
4. ✅ Multiple payment methods
5. ✅ Invoice generation
6. ✅ Fee structures by class/term
7. ✅ Payment plans with installments
8. ✅ Financial reporting and statistics

**Limitations:**
1. ❌ No payment gateway integration (Stripe, PayPal, Paynow)
2. ❌ Limited automated billing
3. ❌ No parent online payment portal (in-progress)
4. ❌ Basic reporting (needs enhancement)
5. ❌ No SMS notifications for payment reminders
6. ❌ No automated late fee calculation
7. ❌ No expense management (school expenses)

### Recommended Integration Strategy

#### Phase 1: Payment Gateway Integration
**Goal:** Enable online payments from parent portal

```typescript
// New API endpoint: /api/payments/initiate
POST /api/payments/initiate
{
  studentId: string
  amount: number
  paymentMethod: "PAYNOW" | "STRIPE" | "PAYPAL"
}

Response:
{
  paymentUrl: string
  paymentId: string
  expiresAt: timestamp
}

// Callback endpoint: /api/payments/callback
POST /api/payments/callback
{
  paymentId: string
  status: "success" | "failed"
  transactionRef: string
  amount: number
}

WORKFLOW:
1. Parent initiates payment from portal
2. System creates pending Payment record
3. Redirect to payment gateway
4. Gateway processes payment
5. Callback updates Payment status
6. If successful: create Transaction, update StudentAccount
7. Send receipt email to parent
```

#### Phase 2: Automated Billing Engine
**Goal:** Auto-generate invoices based on fee structures

```typescript
// Scheduled job: Daily/Weekly
ALGORITHM:
1. For each active AcademicYear and Term:
   
   2. Get all FeeStructures for term
   
   3. For each Student in applicable classes:
      a. Check if already invoiced
      b. If not:
         - Generate Invoice
         - Create InvoiceItems from FeeStructures
         - Create CHARGE transaction
         - Send invoice email to parents
   
   4. Check for overdue invoices:
      a. Invoice.dueDate < today AND status != PAID
      b. Calculate late fees
      c. Create CHARGE transaction for late fee
      d. Send reminder email/SMS
```

#### Phase 3: Enhanced Reporting
**Goal:** Comprehensive financial reports

```typescript
// New endpoints:
GET /api/finances/reports/revenue
  - Total revenue by period
  - Revenue by payment method
  - Revenue by class/grade
  - Revenue trends

GET /api/finances/reports/outstanding
  - Students with outstanding balances
  - Aging report (30/60/90 days overdue)
  - Collection efficiency

GET /api/finances/reports/fee-structure
  - Fee distribution by type
  - Fee collection rates
  - Discount/waiver analysis

GET /api/finances/reports/expenses
  - (New) School expense tracking
  - Budget vs. actual
  - Expense categories
```

#### Phase 4: Parent Portal Enhancements
**Goal:** Self-service financial management

```
Features:
1. View all invoices and receipts
2. Check account balance and payment history
3. Make online payments
4. Set up payment plans
5. Download receipts and statements
6. Receive payment reminders
7. Chat/message accountant
```

#### Phase 5: Accounting System Integration
**Goal:** Integrate with QuickBooks, Xero, or custom ERP

```typescript
// Integration points:
1. Transaction sync:
   - Push all Transactions to external system
   - Map transaction types to external categories
   - Handle reconciliation

2. Invoice sync:
   - Export invoices in standard format
   - Import payment confirmations

3. Chart of accounts mapping:
   - Map fee types to GL accounts
   - Map payment methods to bank accounts

4. Reporting integration:
   - Pull data from external system
   - Display in SMS dashboard
```

### Database Changes Needed

#### 1. Add Payment Gateway Tables
```prisma
model PaymentGatewayTransaction {
  id              String   @id @default(cuid())
  transactionId   String   @unique // FK to Transaction
  gateway         String   // "PAYNOW", "STRIPE", etc.
  gatewayRef      String   // External reference
  amount          Decimal
  currency        String   @default("USD")
  status          String   // "pending", "processing", "completed", "failed"
  initiatedAt     DateTime
  completedAt     DateTime?
  metadata        Json?    // Gateway-specific data
  errorMessage    String?
  
  transaction     Transaction @relation(fields: [transactionId], references: [id])
}

model PaymentReminder {
  id            String    @id @default(cuid())
  invoiceId     String    // FK to Invoice
  sentAt        DateTime
  method        String    // "email", "sms"
  status        String    // "sent", "failed"
  
  invoice       Invoice   @relation(fields: [invoiceId], references: [id])
}
```

#### 2. Add Expense Management (Optional)
```prisma
model Expense {
  id            String    @id @default(cuid())
  schoolId      String    // FK to School
  category      String    // "Salaries", "Utilities", "Supplies", etc.
  amount        Decimal
  description   String
  expenseDate   DateTime
  paymentMethod String
  receiptUrl    String?
  approvedBy    String?
  createdBy     String
  createdAt     DateTime  @default(now())
  
  school        School    @relation(fields: [schoolId], references: [id])
}

model Budget {
  id            String    @id @default(cuid())
  schoolId      String
  academicYearId String
  category      String
  budgetedAmount Decimal
  spentAmount   Decimal   @default(0)
  
  school        School    @relation(fields: [schoolId], references: [id])
  academicYear  AcademicYear @relation(fields: [academicYearId], references: [id])
}
```

### Key Financial Algorithms

#### 1. Balance Calculation
```typescript
function calculateStudentBalance(studentAccountId: string): Decimal {
  const transactions = await prisma.transaction.findMany({
    where: { studentAccountId }
  });
  
  let balance = 0;
  for (const tx of transactions) {
    switch (tx.type) {
      case 'CHARGE':
      case 'REFUND':
        balance += tx.amount; // Increases debt
        break;
      case 'PAYMENT':
      case 'WAIVER':
      case 'DISCOUNT':
        balance -= tx.amount; // Reduces debt
        break;
      case 'ADJUSTMENT':
        balance += tx.amount; // Can be positive or negative
        break;
    }
  }
  
  return balance;
}
```

#### 2. Payment Verification
```typescript
function verifyPayment(paymentId: string, verifiedBy: string): Promise<void> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { transaction: { include: { studentAccount: true } } }
    });
    
    if (!payment) throw new Error("Payment not found");
    
    if (payment.status !== "Pending") {
      throw new Error("Payment already processed");
    }
    
    // Update payment
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "Verified",
        verifiedBy,
        verifiedAt: new Date()
      }
    });
    
    // Transaction already created when payment was recorded
    // Balance already updated
    
    // Send receipt email
    await sendReceiptEmail(payment);
  });
}
```

#### 3. Late Fee Calculation
```typescript
async function calculateAndApplyLateFees(): Promise<void> {
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      dueDate: { lt: new Date() },
      status: { in: ['SENT', 'PARTIALLY_PAID'] }
    },
    include: {
      studentAccount: true,
      items: { include: { feeStructure: true } }
    }
  });
  
  for (const invoice of overdueInvoices) {
    // Check if late fee already applied
    const lateFeeExists = await prisma.transaction.findFirst({
      where: {
        studentAccountId: invoice.studentAccountId,
        description: { contains: `Late fee for ${invoice.invoiceNumber}` }
      }
    });
    
    if (lateFeeExists) continue;
    
    // Calculate late fee
    let totalLateFee = 0;
    for (const item of invoice.items) {
      if (item.feeStructure?.lateFee) {
        totalLateFee += item.feeStructure.lateFee.toNumber();
      }
    }
    
    if (totalLateFee > 0) {
      // Apply late fee
      const currentBalance = invoice.studentAccount.balance.toNumber();
      await prisma.transaction.create({
        data: {
          studentAccountId: invoice.studentAccountId,
          type: 'CHARGE',
          amount: totalLateFee,
          balanceBefore: currentBalance,
          balanceAfter: currentBalance + totalLateFee,
          description: `Late fee for ${invoice.invoiceNumber}`,
          reference: `LATE-${invoice.invoiceNumber}`,
          processedBy: 'SYSTEM',
          processedAt: new Date()
        }
      });
      
      // Update invoice
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'OVERDUE',
          total: { increment: totalLateFee },
          amountDue: { increment: totalLateFee }
        }
      });
      
      // Send notification
      await sendLatePaymentNotification(invoice);
    }
  }
}
```

---

## 📊 KEY INDEXES FOR PERFORMANCE

Current database indexes for optimal query performance:

```prisma
// User lookups
@@index([email])
@@index([schoolId, role])
@@index([passwordResetToken])
@@index([emailVerificationToken])

// Student queries
@@index([schoolId, studentNumber])
@@index([schoolId, status])
@@index([currentClassId])

// Financial queries
@@index([studentAccountId, processedAt])
@@index([reference])
@@index([type, processedAt])
@@index([schoolId, invoiceNumber])
@@index([studentAccountId, status])
@@index([receiptNumber])
@@index([parentId, createdAt])

// Multi-tenant isolation
@@index([subdomain])
@@index([domain])
@@index([schoolId])
@@index([schoolId, applicationNumber])
```

---

## 🔍 DATA FLOW EXAMPLES

### Example 1: Student Makes Payment via Parent Portal

```
1. Parent logs in → JWT session created
2. Parent views children → GET /api/parent/children
   - Returns students with account balances
3. Parent clicks "Make Payment" for child
4. Parent enters amount and method
5. POST /api/students/[id]/payments
   Request body:
   {
     amount: 500,
     paymentMethod: "MOBILE_MONEY",
     mobileMoneyRef: "MP123456",
     description: "Term 1 fees"
   }

6. Backend processes:
   a. Validates session and permissions
   b. Gets student and account
   c. Calculates new balance: currentBalance - 500
   d. Begins transaction:
      - Updates StudentAccount
      - Creates Transaction record (type: PAYMENT)
      - Creates Payment record with receipt number
   e. Commits transaction

7. Response:
   {
     message: "Payment recorded successfully",
     receiptNumber: "RCP202400123",
     newBalance: 1500
   }

8. System sends receipt email to parent
```

### Example 2: Admin Enrolls Approved Application

```
1. Admin views applications → GET /api/applications?status=APPROVED
2. Admin selects application → GET /api/applications/[id]
3. Admin clicks "Enroll" → POST /api/applications/[id]/enroll
   Request body:
   {
     studentNumber: "AHA20240050",
     classId: "class-id",
     totalFees: 2000,
     initialDeposit: 500
   }

4. Backend processes:
   a. Begin transaction:
      - Create Student from Application data
      - Create StudentAccount (balance: 1500)
      - Create CHARGE transaction (2000)
      - Create PAYMENT transaction (500)
      - Create User account with generated password
      - Update Application (status: ENROLLED, convertedToStudentId)
   b. Commit transaction

5. System sends welcome emails:
   - To student: login credentials
   - To parent: enrollment confirmation

6. Response:
   {
     message: "Student enrolled successfully",
     studentId: "student-id",
     studentNumber: "AHA20240050",
     credentials: { username, tempPassword }
   }
```

---

## 📈 SCALABILITY CONSIDERATIONS

### Current Architecture Strengths
1. ✅ Multi-tenant by design (schoolId isolation)
2. ✅ Indexed database queries
3. ✅ Transaction-based data integrity
4. ✅ Modular API design
5. ✅ Stateless authentication (JWT)

### Recommended Improvements for Large Scale
1. **Caching Layer**
   - Redis for session storage
   - Cache frequently accessed data (fee structures, classes)

2. **Database Optimization**
   - Read replicas for reports
   - Partition large tables (Transactions, Audit Logs) by date
   - Archive old academic years

3. **Background Jobs**
   - Queue system (Bull, BullMQ) for:
     * Bulk email sending
     * Report generation
     * Late fee calculations
     * Daily automated billing

4. **File Storage**
   - Move file uploads to S3/Cloudinary
   - CDN for static assets

5. **Monitoring**
   - Application monitoring (Sentry)
   - Database monitoring
   - API rate limiting

---

## 🎓 ACADEMIC YEAR MANAGEMENT

### Important Time-Based Logic

```typescript
// Academic year structure
AcademicYear {
  name: "2024/2025"
  startDate: 2024-01-15
  endDate: 2024-12-15
  isCurrent: true
  
  terms: [
    Term 1: Jan-Apr (isCurrent: true)
    Term 2: May-Aug
    Term 3: Sep-Dec
  ]
}

// Fee structures tied to academic year and term
// Grades recorded per term
// Report cards generated per term
// Attendance tracked per term
```

### Year Rollover Process
```
1. Mark current year as isCurrent: false
2. Create new AcademicYear (isCurrent: true)
3. Create new Terms
4. Promote students to next class:
   - Update currentClassId
   - Adjust status (GRADUATED if final year)
5. Copy fee structures to new year
6. Archive old year's data
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

```
Development:
- Local PostgreSQL
- npm run dev (localhost:3000)

Production (Vercel + Supabase):
- Vercel: Next.js hosting
- Supabase: PostgreSQL database
- Environment variables in Vercel dashboard
- Automatic deployments from GitHub

Required Environment Variables:
- DATABASE_URL (Supabase connection string)
- NEXTAUTH_URL (production URL)
- NEXTAUTH_SECRET (random secret)
- EMAIL_USER, EMAIL_PASSWORD (Gmail SMTP)
```

---

## 📝 SUMMARY & NEXT STEPS FOR FINANCIAL INTEGRATION

### Current Financial System Summary:
- **Fully functional** ledger-based system
- Tracks all student financial transactions
- Supports multiple payment methods
- Generates receipts and invoices
- Basic reporting available

### To Integrate External Financial System:

1. **Identify Integration Type:**
   - **Embedded** (APIs within this system) ← Current approach
   - **External** (Sync to QuickBooks/Xero/ERP)
   - **Payment Gateway** (Stripe/PayPal/Paynow)

2. **Key Integration Points:**
   - `StudentAccount` table: Central ledger
   - `Transaction` table: All financial movements
   - `Payment` table: Payment receipts
   - `Invoice` table: Billing documents

3. **Data Export Format:**
   ```json
   Transaction Export:
   {
     "transactionId": "cuid",
     "studentNumber": "AHA20240001",
     "studentName": "John Doe",
     "type": "PAYMENT|CHARGE|...",
     "amount": 500.00,
     "balanceBefore": 2000.00,
     "balanceAfter": 1500.00,
     "date": "2024-02-17",
     "paymentMethod": "CASH",
     "reference": "RCP202400123",
     "processedBy": "admin@school.com"
   }
   ```

4. **Recommended Actions:**
   - [ ] Add payment gateway integration (Phase 1)
   - [ ] Implement automated billing engine (Phase 2)
   - [ ] Enhance financial reports (Phase 3)
   - [ ] Build parent payment portal (Phase 4)
   - [ ] External accounting system sync (Phase 5)

5. **Quick Start for Testing:**
   ```bash
   # Access financial dashboard
   Login as ACCOUNTANT role
   Navigate to: /admin/finances
   
   # Test payment recording
   POST /api/students/[studentId]/payments
   
   # View financial stats
   GET /api/finances/stats?range=month
   ```

---

## 📞 SUPPORT & DOCUMENTATION

### Key Files to Reference:
- `/prisma/schema.prisma` - Complete database schema
- `/lib/auth.ts` - Authentication logic
- `/lib/roles.ts` - Authorization and permissions
- `/lib/multi-tenant.ts` - School isolation logic
- `/app/api/**` - All API endpoints

### Database Diagram:
```
School (root)
  ├── Users (staff, parents, students)
  ├── Students
  │   ├── StudentAccount (financial)
  │   │   ├── Transactions
  │   │   ├── Invoices
  │   │   │   └── InvoiceItems
  │   │   ├── Payments
  │   │   └── PaymentPlans
  │   ├── Grades
  │   ├── Attendance
  │   ├── ReportCards
  │   └── HostelAllocation
  ├── Parents (linked via ParentStudent)
  ├── Staff
  ├── Classes
  │   ├── ClassSubjects
  │   └── Timetables
  ├── Subjects
  ├── FeeStructures
  ├── AcademicYears
  │   └── Terms
  ├── Hostels
  │   └── Blocks
  │       └── Rooms
  │           └── Beds
  ├── TransportRoutes
  ├── Applications
  └── Announcements
```

---

**Document Version:** 1.0  
**Last Updated:** February 17, 2026  
**Author:** System Analysis  
**Purpose:** Financial System Integration Reference
