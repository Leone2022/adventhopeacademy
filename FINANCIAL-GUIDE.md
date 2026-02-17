# Advent Hope Academy - Financial Management Guide

## Getting Started

Login as **School Admin** or **Accountant** → Click **Finances** in the sidebar.

---

## Step 1: Initialize Student Accounts (One-Time Setup)

Before charging any fees, every student needs a financial account.

1. Go to **Finances** dashboard
2. Click the purple **Initialize Accounts** button (top right)
3. This creates accounts for all students who don't have one yet
4. You only need to do this once, or after adding new students

---

## Step 2: Set Up Fee Structures

Define what fees students must pay each term.

1. On the Finances dashboard, click **Fee Structure** (quick action tile)
2. Click **New Fee Structure**
3. Fill in:
   - **Academic Year** and **Term** (e.g. Term 1)
   - **Fee Name** (e.g. "Term 1 Tuition 2026")
   - **Fee Type** (Tuition, Boarding, Full Package, etc.)
   - **Student Type** (Day Scholar / Boarder / Both)
   - **Amount** in USD
   - Optionally: specific **Class**, **Due Date**, **Late Fee**
4. Click **Save**

You can create multiple fee structures (tuition, boarding, books, etc.) and apply them separately.

---

## Step 3: Apply Bursaries (If Applicable)

If any students have scholarships or discounts, set these up BEFORE applying charges.

1. On the Finances dashboard, click **Bursaries** (quick action tile)
2. Click **Apply Bursary**
3. Search and select the student(s)
4. Set the **Discount Percentage** (e.g. 50%)
5. Choose a **Reason** (Academic Excellence, Financial Need, etc.)
6. Click **Apply**

When fees are charged, the bursary discount is automatically deducted.

---

## Step 4: Charge Students

### Option A: Apply Fee Structure (Recommended for Whole School)

This charges all eligible students at once using a fee structure you defined.

1. Go to **Finances** → **Fee Structure**
2. Find the fee structure → click **Apply Now**
3. Confirm → all matching students are charged automatically
4. Bursary discounts are applied automatically
5. Review the results summary (successful, failed, total charged)

### Option B: Bulk Charge (Custom Amount to Selected Students)

Use this when you need to charge a specific group a custom amount.

1. On the Finances dashboard, click **Bulk Charge** (quick action tile)
2. Filter students by **Class**, **Curriculum**, **Student Type**
3. Select students (tick checkboxes, or use "Select All")
4. Enter **Amount**, **Description**, and **Charge Type**
5. Click **Apply Charges**
6. Review results

### Option C: Single Student Charge

1. On the Finances dashboard, click **Add Charge** (quick action tile)
2. Search for the student by name or student number
3. Enter **Amount** and **Description**
4. Click **Add Charge**

OR from a student's statement page, click the orange **Add Charge** button.

---

## Step 5: Record Payments

When a parent pays (cash, EcoCash, bank transfer, etc.), record it here.

### From the Dashboard

1. Click **Record Payment** (blue button or quick action tile)
2. Search for the student
3. Enter **Amount**, **Payment Method**, and optional **Reference Number**
4. Click **Record Payment**
5. A receipt number is generated automatically

### From a Student's Statement

1. Open any student's statement (see Step 6)
2. Click the green **Record Payment** button
3. Fill in the payment details
4. Click **Record Payment**

---

## Step 6: View a Student's Financial Statement

This shows the full ledger: all charges, payments, and current balance.

1. On the Finances dashboard, switch to the **Student Accounts** tab
2. Search for the student by name or student number
3. Click the **eye icon** to open their statement
4. You'll see:
   - **Summary cards**: Total Charged, Total Paid, Balance, % Paid
   - **Transaction history**: every charge, payment, and adjustment

### Print / Download Statement

- Click **Export PDF** on the statement page
- A branded PDF downloads with the school header, student details, and full transaction table

---

## Step 7: Reverse a Mistake

If a charge or payment was entered incorrectly, you can reverse it.

1. Open the student's statement (Step 6)
2. Find the transaction in the table
3. Click the **undo icon** (↩) on that row
4. Confirm the reversal
5. A counter-entry is created and the balance is corrected
6. The original transaction is marked as "Reversed"

Note: This does NOT delete the original record. Both the original and the reversal are kept for audit purposes.

---

## Step 8: View Owing Students

To quickly see all students who still owe money:

1. On the Finances dashboard, click **Owing Students** (quick action tile)
2. This switches to the Student Accounts tab filtered to only show students with outstanding balances
3. From here you can click into any student's statement

---

## For Parents

Parents access finances through their own portal after logging in.

1. Parent logs in at `/portal/login`
2. Clicks **Finances** in the sidebar
3. Sees all linked children with their balances
4. Clicks a child to view their full transaction history
5. Can **Download Statement** as PDF
6. Can click **Make Payment** to pay online (if payment gateways are configured)

Parents can only VIEW financial information — they cannot add charges or reverse transactions.

### Online Payments (If Configured)

If Stripe, PayPal, or Paynow is set up:

1. Parent goes to the **Payments** page
2. Selects their child and enters the amount
3. Chooses a payment method
4. Gets redirected to the payment gateway
5. After payment, sees a confirmation page with receipt
6. The payment is automatically recorded in the student's account

---

## Quick Reference

| Task | Where to Go |
|------|------------|
| Initialize accounts | Finances → Initialize Accounts button |
| Create fee structure | Finances → Fee Structure tile |
| Apply fees to all students | Fee Structure → Apply Now |
| Charge selected students | Finances → Bulk Charge tile |
| Charge one student | Finances → Add Charge tile |
| Record a payment | Finances → Record Payment tile |
| View student statement | Student Accounts tab → eye icon |
| Print statement | Student statement → Export PDF |
| Reverse a transaction | Student statement → undo icon on row |
| Set up bursaries | Finances → Bursaries tile |
| See who owes | Finances → Owing Students tile |

---

## Typical Term Workflow

1. **Start of term**: Initialize accounts (for any new students)
2. **Set up fees**: Create fee structures for the term
3. **Apply bursaries**: Set discounts for scholarship students
4. **Charge fees**: Apply fee structure → charges all students at once
5. **During term**: Record payments as parents pay
6. **As needed**: Add individual charges (transport, books, etc.)
7. **End of term**: Print statements for parents, review outstanding balances
