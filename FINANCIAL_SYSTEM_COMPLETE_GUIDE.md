# 📚 FINANCIAL SYSTEM - COMPLETE NAVIGATION GUIDE

**Last Updated:** February 17, 2026  
**System Version:** 2.0 - Simplified Financial Management

---

## 🎯 QUICK START: The New Workflow

### **For Administrators**

The new system follows this simple 3-step process:

1. **SET** → Define fee structures for Day Scholars & Boarders
2. **APPLY** → Automatically charge all eligible students
3. **MANAGE** → Record payments and apply bursaries as needed

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
3. [Daily Operations](#daily-operations)
4. [Student Types - Day Scholar vs Boarder](#student-types)
5. [Bursary System](#bursary-system)
6. [Payment Gateway](#payment-gateway)
7. [Reports & Monitoring](#reports--monitoring)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ SYSTEM OVERVIEW

### Main Dashboard Access

**URL:** `/dashboard/finances`

### Key Features

- **Fee Structure Management** - Set different fees for Day Scholars and Boarders
- **Automatic Fee Application** - Bulk charge students with one click
- **Bursary System** - Apply percentage-based discounts automatically
- **Payment Recording** - Track payments from multiple sources
- **Payment Gateway Integration** - Accept online payments (Stripe, PayPal, etc.)
- **Real-time Balance Tracking** - Automatic balance calculations
- **Student Account Management** - View all student financial records

---

## 📝 STEP-BY-STEP SETUP GUIDE

### **STEP 1: Create Fee Structures** (Start of Term)

**Navigate to:** Dashboard → Finances → **Fee Structure** (top-left button)

#### 1.1 Create Day Scholar Fees

1. Click **"New Fee Structure"** button
2. Fill in the form:
   - **Academic Year:** Select current year (e.g., "2025-2026")
   - **Term:** Select term (e.g., "Term 1")
   - **Fee Name:** Enter descriptive name (e.g., "Term 1 Tuition - Day Scholar")
   - **Fee Type:** Select category:
     - `Tuition` - School fees
     - `Transport` - Bus/transport fees
     - `Books` - Books and materials
     - `Uniform` - Uniform costs
     - `Exam` - Examination fees
     - `Activities` - Extra-curricular
     - `Other` - Miscellaneous
   - **Student Type:** Select **"Day Scholar Only"**
   - **Amount (USD):** Enter fee amount (e.g., 500.00)
   - **Late Fee (USD):** Optional penalty for late payment
   - **Class (Optional):** Leave empty to apply to all classes, or select specific class
   - **Due Date (Optional):** Payment deadline
   - **Description:** Additional notes
3. Click **"Create Fee Structure"**

#### 1.2 Create Boarder Fees

1. Repeat the process above
2. Change **Student Type** to **"Boarder Only"**
3. Enter higher amount for boarding fees (e.g., 1500.00)
4. Click **"Create Fee Structure"**

#### Example Fee Structures

| Fee Name | Student Type | Amount | Description |
|----------|-------------|--------|-------------|
| Term 1 Tuition - Day | Day Scholar | $500 | Basic tuition |
| Term 1 Tuition - Boarder | Boarder | $1,500 | Tuition + Boarding |
| Transport Fee | Day Scholar | $100 | Bus transport |
| Books & Materials | Both | $75 | Required books |

---

### **STEP 2: Apply Bursaries** (Optional - Before Charging)

**Navigate to:** Dashboard → Finances → **Bursaries** (top-right of Fee Structure)

#### 2.1 Apply Scholarship/Discount

1. Click **"Apply Bursary"** button
2. **Select Students:**
   - Search for student by name or number
   - Check boxes for students who qualify
   - Multiple students can be selected for same bursary
3. **Enter Bursary Details:**
   - **Discount Percentage:** Enter percentage (e.g., 50 for 50% off)
   - **Reason:** Select from dropdown:
     - Academic Excellence
     - Sports Scholarship
     - Financial Need
     - Staff Child
     - Sibling Discount
     - Merit Scholarship
     - Community Service
     - Other
   - **End Date:** Leave empty for permanent bursary, or set expiration date
   - **Additional Notes:** Any extra information
4. Click **"Apply Bursary"**

#### How Bursaries Work

- **Automatic Application:** When fees are applied, bursaries are automatically calculated
- **Example:** 
  - Original Fee: $1,000
  - Bursary: 50%
  - **Final Charge: $500**
- **Duration:** Bursaries remain active until end date or manually deactivated
- **Multiple Students:** Same bursary settings can apply to multiple students

---

### **STEP 3: Apply Fees to Students**

**Navigate to:** Dashboard → Finances → **Fee Structure**

#### 3.1 Bulk Apply Fees

1. Find the fee structure in the table
2. Click the **"Send" icon** (paper airplane) in the Actions column
3. Review the confirmation dialog:
   - Fee name and amount
   - Student type (Day Scholar/Boarder/Both)
   - Warning message
4. Click **"Apply Now"**

#### 3.2 View Results

After application, you'll see:

- **Summary Cards:**
  - Total Students processed
  - Successful charges
  - Failed charges
  - Total amount charged
  - Total bursary discounts applied
- **Detailed Results:**
  - List of successful charges with:
    - Student name and number
    - Class
    - Student type (Day/Boarder)
    - Original amount
    - Bursary discount (if any)
    - Final amount charged
    - Previous balance
    - New balance
  - List of failed charges with error messages

---

## 💼 DAILY OPERATIONS

### **Recording Payments**

**Navigate to:** Dashboard → Finances → **Record Payment**

#### Method 1: Individual Payment (Recommended)

1. Click **"Record Payment"** from dashboard
2. Select payment method:
   - **Cash** - Physical cash payments
   - **Bank Transfer** - Direct bank deposits
   - **Mobile Money** - M-Pesa, EcoCash, etc.
   - **Cheque** - Check payments
   - **Card** - Manual card payments
   - **Other** - Other payment types
3. Search and select student
4. Enter payment amount
5. Add receipt number/reference (optional)
6. Add notes (optional)
7. Upload proof of payment (optional)
8. Click **"Process Payment"**

#### Method 2: Online Payment Gateway

**Navigate to:** Parent Portal → Payments

Parents can pay online using:
- **Stripe** - Credit/Debit cards
- **PayPal** - PayPal balance or cards
- More gateways available

**Benefits:**
- Automatic balance updates
- Email receipts sent automatically
- Real-time payment tracking
- No manual intervention needed

---

### **Adding Individual Charges**

**Navigate to:** Dashboard → Finances → **Add Charge**

**Use this for:**
- Late fees
- Damage charges
- Special event fees
- Individual penalties
- One-off charges

**Steps:**
1. Click **"Add Charge"**
2. Search and select student
3. Enter charge amount
4. Select charge type (optional)
5. Enter description (required)
6. Add notes (optional)
7. Click **"Process Transaction"**

---

### **Bulk Charging**

**Navigate to:** Dashboard → Finances → **Bulk Charge**

**Use this for:**
- Mid-term additional fees
- Special event charges for multiple students
- Make-up fees for specific groups
- Class-specific charges

**Steps:**
1. Click **"Bulk Charge"**
2. **Select Students:**
   - **Option A:** Individual selection (checkbox)
   - **Option B:** Filter by class → Click "Select Class"
   - **Option C:** Search → Select All
3. **Enter Charge Details:**
   - Amount (USD)
   - Charge Type (Tuition, Transport, etc.)
   - Description (required)
   - Notes (optional)
4. Review summary showing:
   - Number of students
   - Per-student amount
   - Total amount
5. Click **"Apply Charges"**
6. View detailed results

---

## 👥 STUDENT TYPES

### Understanding Day Scholar vs Boarder

**Day Scholar:**
- Students who commute daily
- Live at home
- Lower fees (no boarding costs)
- May pay transport fees

**Boarder:**
- Students who live at school
- Stay in dormitories/hostels
- Higher fees (includes accommodation, meals, supervision)
- No transport fees typically

**Both:**
- Fee structures that apply to all students regardless of type
- Example: Examination fees, books, uniforms

### Setting Student Type

**Navigate to:** Dashboard → Students → Edit Student

1. Find student in list
2. Click Edit
3. Toggle **"Is Boarding"** switch:
   - **ON** = Boarder
   - **OFF** = Day Scholar
4. Save changes

### Fee Application Rules

When you apply a fee structure:

| Fee Structure Student Type | Day Scholar Students | Boarder Students |
|----------------------------|----------------------|------------------|
| Day Scholar Only | ✅ Charged | ❌ Not charged |
| Boarder Only | ❌ Not charged | ✅ Charged |
| Both | ✅ Charged | ✅ Charged |

---

## 🎓 BURSARY SYSTEM

### Complete Bursary Guide

**Navigate to:** Dashboard → Finances → **Bursaries**

#### Viewing Active Bursaries

Dashboard shows:
- **Students with Bursaries** - Total count
- **Active Bursaries** - Currently in effect
- **Average Discount** - Mean percentage across all bursaries

#### Creating Bursaries

**Best Practice:** Apply bursaries BEFORE applying fee structures

1. Click **"Apply Bursary"**
2. **Select Students:**
   - Search by name/student number
   - Students with existing bursaries show amber highlight
   - Can select multiple students for same discount
3. **Configure Bursary:**
   - **Percentage:** 1-100% (e.g., 25 = 25% discount)
   - **Reason:** Select appropriate category
   - **End Date:** Leave empty for permanent
   - **Notes:** Supporting documentation/rationale
4. **Preview:** Shows calculated discount example
5. Click **"Apply Bursary"**

#### Managing Bursaries

**Toggle Active/Inactive:**
- Click status badge in table to activate/deactivate
- Inactive bursaries won't affect new charges

**Edit Bursary:**
- Click pencil icon
- Can modify percentage, reason, notes, end date
- Cannot change student (create new instead)

**Delete Bursary:**
- Click trash icon
- Confirms before deletion
- Historical charges remain unchanged

#### Bursary Calculation Examples

**Example 1: Single Fee**
- Term Tuition: $1,000
- Bursary: 30%
- **Student Pays: $700**

**Example 2: Multiple Fees with Bursary**
- Tuition: $1,000
- Transport: $200
- Bursary: 50%
- **Calculation:**
  - Tuition after discount: $500
  - Transport after discount: $100
  - **Total: $600**

**Example 3: Multiple Active Bursaries**
- Note: System uses the most recent active bursary
- Only one bursary applies per student at a time

---

## 💳 PAYMENT GATEWAY

### Online Payments for Parents

**Parent Access:** `/parent/payments`

#### Available Gateways

1. **Stripe** (Primary)
   - Credit/Debit cards
   - International payments
   - Instant processing

2. **PayPal** (Coming Soon)
   - PayPal balance
   - Linked bank accounts
   - Buyer protection

3. **Paynow** (Zimbabwe)
   - Local payment method
   - Mobile money integration

#### Payment Process

**Parent View:**
1. Log in to Parent Portal
2. Navigate to **Payments**
3. Select student (if multiple children)
4. Choose payment gateway
5. Enter amount or use quick pay buttons:
   - Full Balance
   - Half Balance
   - $100, $200, $500
6. Click **"Proceed to Pay"**
7. Complete payment on gateway
8. Redirected to status page
9. Email receipt sent automatically

**Admin View:**
- Payments appear automatically in transactions
- Balance updated in real-time
- No manual intervention needed
- View in: Dashboard → Finances → **Accounts** tab

#### Gateway Configuration

**File:** `.env.local`

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# PayPal (optional)
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```

---

## 📊 REPORTS & MONITORING

### Student Accounts Tab

**Navigate to:** Dashboard → Finances → **Accounts** tab

#### Viewing Options

**Filter by Balance:**
- **All** - Every student account
- **Owing** - Positive balance (students owe money)
- **Credit** - Negative balance (overpaid)
- **Zero** - No balance

**Search:**
- By student name
- By student number
- Real-time filtering

#### Account Details

Each student shows:
- Name and student number
- Class
- Current balance
- Last payment date
- Last payment amount
- **Actions:**
  - View transactions history
  - Quick record payment
  - View detailed ledger

#### Transaction History

Click "View" icon to see:
- All charges and payments
- Date and time
- Transaction type (CHARGE/PAYMENT/ADJUSTMENT/REFUND)
- Amount
- Balance before/after
- Description
- Processed by (admin name)

---

### Recent Transactions

**Navigate to:** Dashboard → Finances → **Overview** tab

Shows:
- Last 10-20 transactions across all students
- Real-time updates
- Filter by type
- Quick access to student details

---

### Financial Statistics

**Dashboard Overview Cards:**

1. **Total Collected**
   - All-time payments received
   - Shown in green

2. **Outstanding Fees**
   - Total amount owed by all students
   - Shown in orange

3. **This Month Collection**
   - Current month payments
   - Shown in blue

4. **Students with Balance**
   - Count of students owing money
   - Shown in red

---

## 🔧 TROUBLESHOOTING

### Common Issues & Solutions

#### Issue: Fee structure not appearing in list

**Solution:**
- Check if academic year/term is selected correctly
- Verify fee structure is set to "Active"
- Refresh the page (F5)

#### Issue: Student not charged when fee applied

**Possible Causes:**
1. Student type mismatch:
   - Fee for "Day Scholar" but student is marked as "Boarder"
   - **Fix:** Edit student type or create correct fee structure
2. Student status is not "ACTIVE"
   - **Fix:** Activate student account
3. Student in wrong class
   - **Fix:** Update student class or use "All Classes" fee

#### Issue: Bursary not applying

**Check:**
1. Bursary is "Active" (green badge)
2. End date hasn't passed
3. Bursary was created BEFORE charging
   - If charged already, bursary only applies to new charges

**Fix:** 
- Apply adjustment to correct the balance
- Or recharge with bursary active

#### Issue: Payment not reflecting in balance

**Possible Causes:**
1. Wrong student selected
2. System error

**Solution:**
1. Check transaction history for the student
2. Verify payment was actually processed
3. Contact system administrator if transaction shows but balance wrong

#### Issue: Cannot access Fee Structure or Bursary pages

**Cause:** Insufficient permissions

**Solution:**
- Must be: SUPER_ADMIN, SCHOOL_ADMIN, or ACCOUNTANT role
- Contact system administrator to update role

---

## 📞 SUPPORT & CONTACTS

### Quick Reference

| Task | Navigate To | Permission Required |
|------|-------------|---------------------|
| Create Fee Structure | Finances → Fee Structure | Admin/Accountant |
| Apply Fees | Finances → Fee Structure | Admin/Accountant |
| Apply Bursary | Finances → Bursaries | Admin/Accountant |
| Record Payment | Finances → Record Payment | Admin/Accountant |
| Bulk Charge | Finances → Bulk Charge | Admin/Accountant |
| View Accounts | Finances → Accounts Tab | Admin/Accountant |
| Online Payment | Parent Portal → Payments | Parent (no admin) |

### System Requirements

- **Browser:** Chrome, Firefox, Edge, Safari (latest versions)
- **Internet:** Stable connection required
- **Screen:** 1024x768 minimum resolution

### Best Practices

1. **Start of Term:**
   - Create fee structures first
   - Apply bursaries second
   - Then apply fees to students

2. **Regular Operations:**
   - Record payments promptly
   - Verify balances weekly
   - Send payment reminders monthly

3. **Data Backup:**
   - System auto-backs up daily
   - Manual backup: Dashboard → Settings → Export Data

4. **Security:**
   - Never share login credentials
   - Log out when finished
   - Report suspicious activity immediately

---

## 🎯 COMPLETE WORKFLOW EXAMPLE

### Scenario: New Term Setup

**Day 1 - Setup:**

1. **Create Fee Structures:**
   - Day Scholar Tuition: $500
   - Boarder Tuition: $1,500
   - Transport (Day only): $100
   - Books (Both): $75

2. **Apply Bursaries:**
   - Student A: 50% (Academic Excellence)
   - Student B: 25% (Sibling Discount)
   - Students C, D, E: 100% (Staff Children)

3. **Apply Fees:**
   - Apply "Day Scholar Tuition" → 200 students charged
   - Apply "Boarder Tuition" → 100 students charged
   - Apply "Transport" → 180 day scholars charged
   - Apply "Books" → 300 students charged

**Week 1-4 - Payment Collection:**

4. **Record Payments:**
   - Parents bring cash: Record Payment
   - Bank transfers: Record Payment with reference
   - Online payments: Automatic (no action needed)

5. **Monitor:**
   - Check "Owing Students" daily
   - Send reminders weekly
   - Follow up on overdue accounts

**Mid-Term:**

6. **Additional Charges:**
   - Field trip fee: Use Bulk Charge for participating students
   - Late fees: Use Add Charge for individual students

**End of Term:**

7. **Reporting:**
   - Export student accounts
   - Generate financial reports
   - Prepare for next term

---

## ✅ IMPLEMENTATION CHECKLIST

Use this checklist when starting a new term:

- [ ] Create all fee structures (Day/Boarder/Both)
- [ ] Review and update student types (Day Scholar vs Boarder)
- [ ] Apply bursaries to eligible students
- [ ] Test fee application with 1-2 students first
- [ ] Apply fees to all students
- [ ] Verify charges in student accounts
- [ ] Send payment notifications to parents
- [ ] Set up online payment gateway (if not done)
- [ ] Train staff on new features
- [ ] Create payment schedule/reminders

---

## 🚀 ADVANCED FEATURES

### Bulk Operations Tips

**Select All Students in a Class:**
1. Bulk Charge page
2. Filter by class
3. Click "Select Class" button
4. All students in that class selected instantly

**Apply Different Fees by Class:**
- Create fee structure with Class specified
- System only charges students in that class

**Seasonal/Temporary Charges:**
- Use Bulk Charge for one-time events
- Use Fee Structure for recurring term charges

### Bursary Strategies

**Family Discounts:**
- Apply same bursary percentage to all siblings
- Reason: "Sibling Discount"
- Makes bulk application easy

**Performance-Based:**
- Review bursaries termly
- Set end date for one term
- Renew based on performance

**Gradual Reduction:**
- Year 1: 100%
- Year 2: 75%
- Year 3: 50%
- Year 4: 25%
- Create new bursary each year with reduced percentage

---

**END OF GUIDE**

For additional support or feature requests, contact your system administrator.

*This guide covers Financial System v2.0 - Simplified Financial Management*
