# 🧪 Payment Gateway Integration - Testing Guide

## Quick Start Testing on Localhost

### ✅ Development Server Started
Your Next.js application is running at: **http://localhost:3000**

---

## 🎯 Testing Checklist

### Step 1: Verify Server is Running
- [x] Development server started
- [ ] Open http://localhost:3000 in browser
- [ ] Verify homepage loads

### Step 2: Set Up Test Data (if needed)

You'll need:
1. **Parent account** - A user with role "PARENT"
2. **Student account** - Linked to the parent
3. **Student with balance** - Student should have an outstanding balance

---

## 🔐 Test Accounts Setup

### Option A: Use Existing Accounts
If you already have parent and student accounts, skip to Step 3.

### Option B: Create Test Accounts via Database

**Create a test parent:**
```sql
-- Insert parent user
INSERT INTO users (id, email, password, name, role, status, "schoolId")
VALUES ('test-parent-id', 'parent@test.com', '$2b$10$hashed_password', 'Test Parent', 'PARENT', 'ACTIVE', 'your-school-id');

-- Insert parent profile
INSERT INTO parents (id, "userId", "firstName", "lastName")
VALUES ('parent-profile-id', 'test-parent-id', 'Test', 'Parent');

-- Link to existing student
INSERT INTO parent_student (id, "parentId", "studentId", relationship, "isPrimary")
VALUES ('ps-link-id', 'parent-profile-id', 'your-student-id', 'Parent', true);
```

---

## 🧪 Testing Scenarios

### Scenario 1: View Payment Portal (Basic)

1. **Login as Parent**
   - Navigate to: http://localhost:3000/auth/signin
   - Enter parent email and password
   - Verify login succeeds

2. **Access Payment Portal**
   - Navigate to: http://localhost:3000/parent/payments
   - **Expected:** See payment form with all children listed

3. **Verify UI Elements**
   - [ ] Children list shows correct names
   - [ ] Balance displays correctly (red for owing, green for credit)
   - [ ] Quick Pay buttons visible for students with balances
   - [ ] Payment method dropdown present

---

### Scenario 2: Check Available Payment Gateways

**Test the Gateway API:**
```bash
# Open new terminal and run:
curl http://localhost:3000/api/payments/initiate

# Expected Response:
{
  "available": ["STRIPE", "PAYPAL", "PAYNOW"],
  "configured": []
}
```

**Note:** "configured" will be empty until you add Stripe API keys.

---

### Scenario 3: Configure Stripe Test Mode

1. **Get Stripe Test Keys** (if you don't have them)
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy "Secret key" (starts with `sk_test_`)

2. **Add to Environment Variables**
   ```bash
   # Stop the dev server (Ctrl+C in terminal)
   # Add to .env file:
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret
   
   # Restart dev server:
   npm run dev
   ```

3. **Verify Configuration**
   ```bash
   curl http://localhost:3000/api/payments/initiate
   
   # Expected Response:
   {
     "available": ["STRIPE", "PAYPAL", "PAYNOW"],
     "configured": ["STRIPE"]
   }
   ```

---

### Scenario 4: Test Payment Initiation (Without Gateway)

**Test API Endpoint Directly:**
```bash
# Open new terminal
# Replace with your actual IDs
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "studentId": "your-student-id",
    "amount": 100.00,
    "gateway": "STRIPE",
    "currency": "USD"
  }'
```

**Expected Error (if not configured):**
```json
{
  "error": "Failed to initiate payment",
  "details": "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable."
}
```

---

### Scenario 5: End-to-End Test with Stripe (Full Flow)

**Prerequisites:**
- ✅ Stripe API keys configured
- ✅ Parent logged in
- ✅ Student has balance

**Steps:**

1. **Navigate to Payment Portal**
   - URL: http://localhost:3000/parent/payments

2. **Fill Payment Form**
   - Select student from dropdown
   - Enter amount (e.g., 100.00)
   - Select "Credit/Debit Card (Stripe)" as payment method

3. **Initiate Payment**
   - Click "Proceed to Payment"
   - **Expected:** Redirect to Stripe Checkout page

4. **Complete Test Payment**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/28)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
   - Click "Pay"

5. **Verify Redirect**
   - **Expected:** Redirect back to http://localhost:3000/parent/payments/status?paymentId=xxx
   - **Expected:** See "Processing Payment" message with spinner

6. **Check Payment Status**
   - Page should auto-refresh every 5 seconds
   - **Expected:** Status changes to "Payment Successful" ✓
   - **Expected:** Shows receipt number, amount, student details

7. **Verify Database Updates**
   ```sql
   -- Check payment record
   SELECT * FROM payments ORDER BY "createdAt" DESC LIMIT 1;
   
   -- Check gateway transaction
   SELECT * FROM payment_gateway_transactions ORDER BY "createdAt" DESC LIMIT 1;
   
   -- Check student balance
   SELECT balance FROM student_accounts WHERE "studentId" = 'your-student-id';
   ```

8. **Check Email Receipt**
   - Check email inbox (if email configured)
   - Or check console logs for email content

---

## 🔍 Testing Without Stripe (Simulation Mode)

If you want to test the UI without Stripe integration:

1. **Mock Gateway Response**
   - The system will show gateways as "not configured"
   - Form validation still works
   - UI interactions function normally

2. **Test UI Components**
   - [ ] Student selection works
   - [ ] Amount validation works
   - [ ] Quick pay buttons work
   - [ ] Form validation messages display
   - [ ] Error handling works

---

## 🐛 Common Testing Issues

### Issue 1: "No payment methods available"
**Cause:** No payment gateways configured  
**Solution:** Add `STRIPE_SECRET_KEY` to `.env` and restart server

### Issue 2: "Student not found"
**Cause:** Invalid student ID or student doesn't exist  
**Solution:** Verify student exists in database

### Issue 3: "Access denied"
**Cause:** Parent not linked to student  
**Solution:** Check `parent_student` table for relationship

### Issue 4: Payment stuck on "Processing"
**Cause:** Webhook not received or failed  
**Solution:** 
- Check webhook configuration
- Use Stripe CLI for local testing (see below)

---

## 🔥 Advanced Testing: Local Webhook Testing

### Using Stripe CLI

1. **Install Stripe CLI**
   ```bash
   # Download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Localhost**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/callback/stripe
   ```

4. **Copy Webhook Secret**
   - CLI will show: `whsec_xxxxxxxxxxxxx`
   - Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`

5. **Test Webhook Manually**
   ```bash
   # In another terminal
   stripe trigger checkout.session.completed
   ```

6. **Verify in Application**
   - Payment status should update automatically
   - Check console logs for webhook processing

---

## 📊 Test Results Checklist

### API Endpoints
- [ ] GET /api/payments/initiate - Lists available gateways
- [ ] POST /api/payments/initiate - Initiates payment
- [ ] POST /api/payments/callback/stripe - Processes webhook
- [ ] GET /api/payments/status/[id] - Returns payment status

### UI Components
- [ ] Payment form loads correctly
- [ ] Student dropdown populated
- [ ] Amount input validates
- [ ] Gateway selection works
- [ ] Quick pay buttons function
- [ ] Status page displays correctly
- [ ] Success/failure states render

### Database Operations
- [ ] Payment record created
- [ ] Transaction record created
- [ ] Gateway transaction created
- [ ] Student balance updated
- [ ] Receipt number generated

### Security
- [ ] Parent can only pay for their children
- [ ] Invalid amounts rejected
- [ ] Unauthorized access blocked
- [ ] Webhook signature verified

---

## 🎬 Quick Test Script

**Copy and paste this into browser console when on payment page:**

```javascript
// Test form validation
console.log('Testing payment form...');

// Check if student select is populated
const studentSelect = document.querySelector('[id="student"]');
console.log('Students available:', studentSelect ? 'Yes' : 'No');

// Check if payment methods listed
const gatewaySelect = document.querySelector('[id="gateway"]');
console.log('Payment methods available:', gatewaySelect ? 'Yes' : 'No');

// Check if form submits
const form = document.querySelector('form');
console.log('Form found:', form ? 'Yes' : 'No');
```

---

## 📝 Testing Logs to Check

### Server Console (Terminal)
Look for these messages:
```
✔ Compiled successfully
Payment initiated: { studentId: '...', amount: 100, gateway: 'STRIPE' }
Webhook received: { gateway: 'STRIPE', event: 'checkout.session.completed' }
Payment completed: { receiptNumber: 'RCP202400001', amount: 100 }
```

### Browser Console
Open DevTools (F12) and check:
- Network tab for API calls
- Console for any JavaScript errors
- Application tab for session cookies

---

## ✅ Success Criteria

Your testing is successful when:

1. **UI Works**
   - ✓ Payment form loads and displays children
   - ✓ Amount validation works
   - ✓ Gateway selection shows available options

2. **API Works**
   - ✓ Payment initiation returns payment URL
   - ✓ Webhook processes successfully
   - ✓ Status endpoint returns correct data

3. **Data Integrity**
   - ✓ Payment records created correctly
   - ✓ Student balance updated accurately
   - ✓ Transactions recorded properly

4. **User Experience**
   - ✓ Smooth payment flow from start to finish
   - ✓ Clear status messages
   - ✓ Receipt email sent (if configured)

---

## 🚀 Next Steps After Testing

Once testing is successful:

1. **Production Deployment**
   - Switch to live Stripe keys
   - Configure production webhook
   - Deploy to Vercel/hosting platform

2. **Add More Gateways**
   - Implement PayPal
   - Add Paynow for Zimbabwe
   - Configure additional providers

3. **Enhanced Features**
   - Add payment history page
   - Implement refund processing
   - Add payment analytics

---

## 📞 Need Help?

If you encounter issues:

1. Check server console for errors
2. Verify environment variables are set
3. Check database connectivity
4. Review [PAYMENT_GATEWAY_INTEGRATION.md](PAYMENT_GATEWAY_INTEGRATION.md)
5. Test API endpoints individually with curl

---

**Happy Testing! 🎉**

Start with Scenario 1 and work your way through. Most issues can be resolved by checking the console logs and verifying your environment configuration.
