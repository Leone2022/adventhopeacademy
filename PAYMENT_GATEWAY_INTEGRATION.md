# Payment Gateway Integration Guide

## Overview

This payment gateway integration enables parents to make secure online payments for school fees directly through the parent portal. The system supports multiple payment providers and handles the complete payment lifecycle from initiation to confirmation.

## Features

### ✅ Completed Features

1. **Multi-Gateway Support**
   - Stripe (Credit/Debit Cards) ✓
   - PayPal (Ready for implementation)
   - Paynow Zimbabwe (Ready for implementation)
   - Flutterwave (Ready for implementation)
   - Paystack (Ready for implementation)

2. **Payment Workflow**
   - Secure payment initiation
   - Real-time payment status tracking
   - Automatic balance updates
   - Receipt generation and email delivery
   - Transaction history

3. **Parent Portal Features**
   - View all children's balances
   - Quick pay for outstanding balances
   - Custom amount payments
   - Multiple payment method selection
   - Real-time payment confirmation
   - Download receipts

4. **Security**
   - Webhook signature verification
   - Role-based access control
   - Parent-student relationship verification
   - Encrypted payment processing

## Architecture

### Database Schema

#### PaymentGatewayTransaction
```prisma
model PaymentGatewayTransaction {
  id              String                    @id @default(cuid())
  paymentId       String                    @unique
  gateway         PaymentGateway
  gatewayRef      String?
  amount          Decimal                   @db.Decimal(10, 2)
  currency        String                    @default("USD")
  status          PaymentGatewayStatus      @default(PENDING)
  initiatedAt     DateTime                  @default(now())
  completedAt     DateTime?
  failedAt        DateTime?
  metadata        Json?
  errorMessage    String?
  callbackUrl     String?
  returnUrl       String?
}
```

#### Enums
```prisma
enum PaymentGateway {
  STRIPE
  PAYPAL
  PAYNOW
  FLUTTERWAVE
  PAYSTACK
  MANUAL
}

enum PaymentGatewayStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  EXPIRED
  REFUNDED
}
```

### API Endpoints

#### 1. Initiate Payment
```
POST /api/payments/initiate
```

**Request:**
```json
{
  "studentId": "clh3k4j5m0000356xtv8nqw0f",
  "amount": 500.00,
  "gateway": "STRIPE",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "payment_id",
  "paymentUrl": "https://checkout.stripe.com/...",
  "receiptNumber": "RCP202400123",
  "expiresAt": "2024-02-17T15:30:00Z",
  "message": "Payment initiated successfully"
}
```

#### 2. Payment Callback/Webhook
```
POST /api/payments/callback/[gateway]
Example: /api/payments/callback/stripe
```

Handles webhooks from payment gateways to update payment status.

#### 3. Check Payment Status
```
GET /api/payments/status/[paymentId]
```

**Response:**
```json
{
  "payment": {
    "id": "payment_id",
    "receiptNumber": "RCP202400123",
    "amount": 500.00,
    "paymentMethod": "CARD",
    "status": "Verified",
    "createdAt": "2024-02-17T14:30:00Z"
  },
  "gateway": {
    "gateway": "STRIPE",
    "status": "COMPLETED",
    "gatewayRef": "ch_3abc123xyz",
    "completedAt": "2024-02-17T14:31:00Z"
  },
  "student": {
    "id": "student_id",
    "studentNumber": "AHA20240001",
    "name": "John Doe"
  }
}
```

#### 4. List Available Gateways
```
GET /api/payments/initiate
```

**Response:**
```json
{
  "available": ["STRIPE", "PAYPAL", "PAYNOW"],
  "configured": ["STRIPE"]
}
```

## Setup Instructions

### 1. Install Stripe Package

```bash
npm install stripe
```

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration (for credit card payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# PayPal Configuration (optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production

# Paynow Configuration (optional - for Zimbabwe)
PAYNOW_INTEGRATION_ID=your_integration_id
PAYNOW_INTEGRATION_KEY=your_integration_key

# Application URL
NEXTAUTH_URL=http://localhost:3000  # or your production URL
```

### 3. Run Database Migration

```bash
npx prisma generate
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_payment_gateway
```

### 4. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/payments/callback/stripe`
4. Select events to send:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add to `STRIPE_WEBHOOK_SECRET`

### 5. Test the Integration

#### Using Stripe Test Mode:

Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

**Expiry:** Any future date (e.g., 12/25)  
**CVC:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

## User Journey

### Parent Makes a Payment

1. **Login**: Parent logs into the portal
2. **Navigate**: Goes to `/parent/payments`
3. **Select Student**: Chooses which child to pay for
4. **Enter Amount**: Enters payment amount (or uses "Pay full balance")
5. **Choose Gateway**: Selects payment method (Stripe, PayPal, etc.)
6. **Initiate Payment**: Clicks "Proceed to Payment"
7. **Redirect**: Redirected to Stripe/PayPal checkout page
8. **Complete Payment**: Enters card details and confirms
9. **Return**: Redirected back to `/parent/payments/status?paymentId=xxx`
10. **Confirmation**: Sees payment status and can download receipt
11. **Email**: Receives payment receipt via email

### Behind the Scenes

1. **Initiation**:
   - Creates `Payment` record (status: Pending)
   - Creates `Transaction` record (type: PAYMENT)
   - Creates `PaymentGatewayTransaction` record (status: PENDING)
   - Generates Stripe checkout session
   - Returns payment URL

2. **User Completes Payment at Stripe**

3. **Webhook Received**:
   - Stripe sends webhook to `/api/payments/callback/stripe`
   - Signature verified
   - Gateway transaction updated (status: COMPLETED)
   - Payment verified (status: Verified)
   - Student account balance updated
   - Receipt email sent

4. **Status Check**:
   - User sees real-time status updates
   - Auto-polls every 5 seconds for 2 minutes
   - Shows success/failure/pending status

## Security Best Practices

1. **Environment Variables**
   - Never commit API keys to version control
   - Use different keys for development and production
   - Rotate keys periodically

2. **Webhook Verification**
   - Always verify webhook signatures
   - Reject unsigned webhooks
   - Log all webhook attempts

3. **Access Control**
   - Verify parent-student relationships
   - Check user permissions
   - Validate all input data

4. **HTTPS Required**
   - Use HTTPS in production
   - Configure SSL/TLS certificates
   - Set secure cookie flags

## Extending the Integration

### Adding PayPal Support

1. Implement `PayPalPaymentGateway` class in `/lib/payment-gateway.ts`
2. Use PayPal REST API for payment initiation
3. Handle PayPal IPN (Instant Payment Notification) or webhooks
4. Test with PayPal sandbox

### Adding Paynow (Zimbabwe)

1. Install Paynow SDK: `npm install paynow`
2. Implement `PaynowPaymentGateway` class
3. Handle mobile money integration (EcoCash, OneMoney)
4. Configure return URL and result URL
5. Test with Paynow sandbox

### Adding Custom Gateway

1. Extend `PaymentGatewayProvider` abstract class
2. Implement required methods:
   - `initiatePayment()`
   - `verifyCallback()`
   - `queryPaymentStatus()`
   - `cancelPayment()`
3. Register in `PaymentGatewayFactory`
4. Add to `PaymentGateway` enum in schema

## Monitoring & Logging

### Key Metrics to Track

- Payment success rate
- Average payment amount
- Gateway performance
- Failed payment reasons
- Webhook delivery success

### Logs to Monitor

```typescript
// Payment initiation
console.log('Payment initiated:', { studentId, amount, gateway });

// Webhook received
console.log('Webhook received:', { gateway, event, status });

// Payment completed
console.log('Payment completed:', { receiptNumber, amount });

// Errors
console.error('Payment failed:', { error, details });
```

## Troubleshooting

### Payment not updating after completion

1. Check webhook is configured correctly
2. Verify webhook secret matches
3. Check application logs for webhook errors
4. Test webhook manually using Stripe CLI

### Stripe webhook failing

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/payments/callback/stripe

# Test webhook
stripe trigger checkout.session.completed
```

### Parent can't see payment status

1. Verify parent-student relationship exists
2. Check user session is valid
3. Ensure payment ID is correct
4. Check network requests in browser devtools

## Testing Checklist

- [ ] Payment initiation works
- [ ] Stripe checkout page loads correctly
- [ ] Successful payment updates database
- [ ] Failed payment shows error message
- [ ] Webhook signature verification works
- [ ] Student balance updates correctly
- [ ] Receipt email is sent
- [ ] Payment status polls correctly
- [ ] Parent can only pay for their children
- [ ] Amount validation works
- [ ] Multiple gateways show correctly

## Production Deployment

### Pre-deployment Checklist

1. [ ] Switch to live Stripe keys
2. [ ] Update NEXTAUTH_URL to production domain
3. [ ] Configure production webhook endpoint
4. [ ] Test webhook with Stripe CLI
5. [ ] Enable HTTPS
6. [ ] Set secure environment variables
7. [ ] Test payment flow end-to-end
8. [ ] Monitor error logs
9. [ ] Set up payment failure alerts
10. [ ] Document support procedures

### Monitoring

```typescript
// Add to monitoring service (e.g., Sentry)
import * as Sentry from '@sentry/nextjs';

Sentry.captureMessage('Payment initiated', {
  level: 'info',
  tags: { gateway: 'stripe' },
  extra: { studentId, amount }
});
```

## Support

For issues or questions:

1. Check application logs
2. Review Stripe dashboard for payment details
3. Test webhooks with Stripe CLI
4. Check database for payment records
5. Verify environment variables

## Files Created/Modified

### New Files
- `/lib/payment-gateway.ts` - Payment gateway service layer
- `/app/api/payments/initiate/route.ts` - Payment initiation endpoint
- `/app/api/payments/callback/[gateway]/route.ts` - Webhook handler
- `/app/api/payments/status/[paymentId]/route.ts` - Status check endpoint
- `/app/parent/payments/page.tsx` - Payment portal page
- `/app/parent/payments/client.tsx` - Payment form component
- `/app/parent/payments/status/page.tsx` - Status page
- `/app/parent/payments/status/client.tsx` - Status component
- `PAYMENT_GATEWAY_INTEGRATION.md` - This documentation

### Modified Files
- `/prisma/schema.prisma` - Added payment gateway models and enums
- `/lib/email.ts` - Added sendReceiptEmail function

## Next Steps

1. ✅ **Completed**: Base payment gateway infrastructure
2. **Optional**: Implement PayPal integration
3. **Optional**: Implement Paynow integration
4. **Optional**: Add payment analytics dashboard
5. **Optional**: Implement refund processing
6. **Optional**: Add automated payment plans
7. **Optional**: Integrate SMS notifications for payments
8. **Optional**: Add multi-currency support
9. **Optional**: Implement recurring payments

## License

Copyright © 2024 Advent Hope Academy. All rights reserved.
