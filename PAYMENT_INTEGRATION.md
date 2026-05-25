# Payment Integration Guide

FarmDirect supports multiple payment methods. This guide explains the payment flow and how to integrate real payment gateways.

## Current Status

Currently, payment methods are **placeholders**:
- `pay_later` - Orders placed with payment due on delivery
- `gcash` - Payment via GCash (proof of payment required)
- `paymaya` - Payment via PayMaya (proof of payment required)
- `cash_on_delivery` - Cash payment on delivery

## Payment Flow

1. **Buyer initiates checkout** with cart items and delivery address
2. **Buyer selects payment method** (pay_later, gcash, paymaya, cash_on_delivery)
3. **Order created** with `payment_method` and optional `payment_reference`
4. **For online methods (GCash/PayMaya)**:
   - Order status: `pending`
   - Buyer uploads proof of payment
   - Admin verifies payment
   - Order status: `process` (ready to pack)
5. **For cash/later payments**:
   - Order status: `process` (ready to pack)
   - Payment collected at delivery or later

## Database Schema

### Orders Table
```sql
payment_method ENUM('pay_later','gcash','paymaya','cash_on_delivery')
```

### Payments Table
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  buyer_id INT NOT NULL,
  method VARCHAR(50) NOT NULL,
  reference_no VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','verified','rejected'),
  receipt_photo VARCHAR(255),
  created_at TIMESTAMP
);
```

## Integration Steps

### 1. GCash Integration (Example)

**Option A: Manual verification (Current)**
- Buyer uploads proof via UI (not yet implemented)
- Admin reviews and verifies

**Option B: GCash API Integration**
```javascript
// Example: Using GCash API
const gcashAPI = require('gcash-api-sdk')

const gcash = new gcashAPI({
  merchantId: process.env.GCASH_MERCHANT_ID,
  apiKey: process.env.GCASH_API_KEY,
})

// Verify payment
const verified = await gcash.verifyPayment(referenceNo)
```

### 2. PayMaya Integration (Example)

```javascript
// Example: Using PayMaya API
const paymaya = require('paymaya-sdk')

const client = new paymaya.Client({
  publicKey: process.env.PAYMAYA_PUBLIC_KEY,
  secretKey: process.env.PAYMAYA_SECRET_KEY,
})

// Process payment
const payment = await client.payment.create({
  requestReferenceNumber: orderId,
  amount: {
    value: grandTotal,
  },
})
```

### 3. Stripe Integration (Alternative)

```bash
npm install stripe
```

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(grandTotal * 100), // in cents
  currency: 'php',
  metadata: { orderId },
})
```

### 4. PayPal Integration (Alternative)

```bash
npm install @paypal/checkout-server-sdk
```

```javascript
const paypalClient = require('@paypal/checkout-server-sdk')

const environment = new paypalClient.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
)

const client = new paypalClient.PayPalHttpClient(environment)
```

## Payment Status Flow

```
Order Created
    ↓
Payment Method Selected
    ↓
┌─────────────────────────────────────────┐
│ Payment Method                          │
├─────────────────────────────────────────┤
│ pay_later / cash_on_delivery            │
│ → Status: process (ready to pack)       │
│                                         │
│ gcash / paymaya / stripe / paypal       │
│ → Status: pending                       │
│ → Waiting for payment verification      │
│ → Admin reviews → Status: process       │
└─────────────────────────────────────────┘
    ↓
Order Processing (packed, in_transit)
    ↓
Order Delivered
    ↓
Payment Collected (if pay_later)
```

## Environment Variables Required

```bash
# GCash (if integrating)
GCASH_MERCHANT_ID=
GCASH_API_KEY=

# PayMaya (if integrating)
PAYMAYA_PUBLIC_KEY=
PAYMAYA_SECRET_KEY=

# Stripe (if integrating)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# PayPal (if integrating)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## Recommended Next Steps

1. **Start with GCash/PayMaya**: Most popular in Philippines
2. **Add manual verification first**: Upload proof of payment
3. **Automate verification**: Integrate official APIs
4. **Add Stripe/PayPal**: For international buyers

## Testing Payment Flow

```javascript
// Test endpoint (development only)
POST /api/payments/test
{
  "orderId": 1,
  "method": "gcash",
  "referenceNo": "TEST123"
}
```

## Security Considerations

- Never store card details (PCI DSS compliance)
- Use HTTPS for all payment endpoints
- Validate amounts server-side
- Log all payment transactions
- Use webhooks for payment confirmation
- Implement rate limiting on payment endpoints
