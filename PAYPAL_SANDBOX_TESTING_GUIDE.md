# PayPal Sandbox Testing Guide

## 🧪 Testing with PayPal Sandbox

PayPal Sandbox allows you to test the complete payment flow **without using real money**. This is perfect for testing before going live!

---

## ✅ What You Can Test in Sandbox

- ✅ Complete payment flow (customer clicks → payment → booking created)
- ✅ Verify payments go to YOUR sandbox account
- ✅ Test different payment scenarios (success, failure, cancellation)
- ✅ Verify booking creation in database
- ✅ Test confirmation page
- ✅ See payment in YOUR sandbox PayPal account

**Important:** Sandbox uses **TEST MONEY** only - no real money is involved.

---

## 📋 Step-by-Step Setup

### Step 1: Create PayPal Sandbox Account

1. **Go to PayPal Developer Dashboard**
   - Visit: https://developer.paypal.com/
   - Log in with your PayPal account (or create one)

2. **Navigate to Sandbox**
   - Click on "Sandbox" in the top menu
   - Or go to: https://developer.paypal.com/dashboard/accounts

3. **Create Sandbox Business Account** (This will be YOUR account that receives payments)
   - Click "Create Account" button
   - Select "Business" account type
   - Fill in account details:
     - Email: `your-business-sandbox@example.com` (use a test email)
     - Password: (create a password - you'll use this to log in)
     - Country: Select your country
     - Click "Create Account"

4. **Create Sandbox Personal Account** (This will be the customer account for testing)
   - Click "Create Account" again
   - Select "Personal" account type
   - Fill in account details:
     - Email: `customer-test@example.com`
     - Password: (create a password)
     - Click "Create Account"

### Step 2: Create PayPal App

1. **Go to "My Apps & Credentials"**
   - Click on "My Apps & Credentials" in the dashboard
   - Or go to: https://developer.paypal.com/dashboard/applications/sandbox

2. **Create New App**
   - Click "Create App" button
   - Fill in:
     - **App Name**: "Surf Camp Booking - Sandbox"
     - **Merchant**: Select your **Sandbox Business Account** (the one that receives payments)
     - Click "Create App"

3. **Get Sandbox Client ID**
   - After creating the app, you'll see "Sandbox" credentials
   - Copy the **Client ID** (starts with "A", shorter than live Client ID)
   - Example: `AeA1QIZXiflr1_-xxxxx`

### Step 3: Configure Your Website for Sandbox

1. **Add Sandbox Client ID to `.env.local`**
   ```bash
   # .env.local
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here
   ```

2. **Restart Your Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Verify Sandbox Mode**
   - Go to your payment page (`/checkout/6-payment`)
   - You should see a **yellow banner**: "🧪 TEST MODE - PayPal Sandbox"
   - This confirms you're in sandbox mode

### Step 4: Test the Payment Flow

#### Test 1: Complete Payment Flow

1. **Start a Booking**
   - Go through the booking flow (dates, rooms, travellers, etc.)
   - Go to payment page

2. **Click "Pay with PayPal"**
   - PayPal button should appear
   - Click the button

3. **Log in with Sandbox Personal Account** (Customer Account)
   - You'll be redirected to PayPal Sandbox
   - Use your **Sandbox Personal Account** credentials:
     - Email: `customer-test@example.com`
     - Password: (the password you created)
   - Click "Log In"

4. **Approve Payment**
   - Review payment details
   - Click "Pay Now"
   - You'll be redirected back to your website

5. **Verify Booking Created**
   - You should see the confirmation page
   - Booking should be created in your database

6. **Check Sandbox Business Account** (YOUR Account)
   - Go to: https://www.sandbox.paypal.com/
   - Log in with your **Sandbox Business Account**:
     - Email: `your-business-sandbox@example.com`
     - Password: (the password you created)
   - Go to "Activity" or "Transactions"
   - **You should see the payment!** ✅
   - This confirms payments go to YOUR account

#### Test 2: Verify Payment Details

In your Sandbox Business Account, you'll see:
- ✅ Payment amount
- ✅ Customer email (sandbox personal account)
- ✅ Transaction ID
- ✅ Order ID
- ✅ Date and time
- ✅ Status: "Completed"

---

## 🔍 How to Verify Payments Go to YOUR Account

### Method 1: Check Sandbox PayPal Account

1. **Log in to Sandbox PayPal**
   - Go to: https://www.sandbox.paypal.com/
   - Log in with your **Sandbox Business Account** credentials

2. **Check Transactions**
   - Click "Activity" or "Transactions"
   - You'll see all test payments
   - This confirms payments go to YOUR account

### Method 2: Check Email Notifications

1. **Check Your Email**
   - PayPal Sandbox sends email notifications
   - Check the email associated with your Sandbox Business Account
   - You'll receive payment notifications

### Method 3: Check Database

1. **Check Your Database**
   - Check your `Booking` table
   - You should see bookings created after payments
   - This confirms the payment → booking flow works

---

## 🎯 Testing Scenarios

### Scenario 1: Successful Payment ✅
- Customer completes payment
- Booking is created
- Payment appears in YOUR sandbox account
- Customer sees confirmation page

### Scenario 2: Payment Cancellation ❌
- Customer clicks "Pay with PayPal"
- Customer cancels on PayPal page
- No booking is created
- No payment in YOUR account
- Customer returns to payment page

### Scenario 3: Payment Failure ❌
- Customer tries to pay with invalid card
- Payment fails
- No booking is created
- No payment in YOUR account
- Error message shown to customer

---

## 🔄 Switching from Sandbox to Live

When you're ready to go live:

1. **Get Live Client ID**
   - Go to PayPal Developer Dashboard
   - Switch from "Sandbox" to "Live" mode
   - Create a new app (or use existing)
   - Copy the **Live Client ID**

2. **Update `.env.local`**
   ```bash
   # Change from sandbox to live
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id_here
   ```

3. **Restart Server**
   ```bash
   npm run dev
   ```

4. **Verify Live Mode**
   - Go to payment page
   - You should see **green banner**: "✅ LIVE MODE - Payments Go to YOUR PayPal Account"
   - This confirms you're in live mode

---

## 📊 Sandbox vs Live Comparison

| Feature | Sandbox | Live |
|---------|---------|------|
| Money | Test money only | Real money |
| Account | Sandbox account | Real PayPal account |
| Client ID | Shorter (20-25 chars) | Longer (30+ chars) |
| URL | sandbox.paypal.com | paypal.com |
| Purpose | Testing | Production |
| Payments | Test payments | Real payments |

---

## ⚠️ Important Notes

### Sandbox Limitations
- ⚠️ Uses **test money only** - no real money
- ⚠️ Sandbox accounts are separate from live accounts
- ⚠️ Payments in sandbox don't appear in live account
- ⚠️ Sandbox is for testing only

### Before Going Live
- ✅ Test thoroughly in sandbox first
- ✅ Verify payments go to YOUR sandbox account
- ✅ Test all payment scenarios
- ✅ Verify booking creation works
- ✅ Test confirmation page
- ✅ Only switch to live when everything works

### Security
- ✅ Never commit `.env.local` to git
- ✅ Keep your Client IDs secure
- ✅ Use different Client IDs for sandbox and live
- ✅ Test in sandbox before going live

---

## 🐛 Troubleshooting

### Issue: Can't log in to Sandbox PayPal
- Make sure you're using: https://www.sandbox.paypal.com/
- Use your Sandbox Business Account credentials
- Not your regular PayPal account

### Issue: Payments not appearing in Sandbox account
- Check you're using the correct Sandbox Business Account
- Verify the Client ID is linked to the correct account
- Check Sandbox account activity page

### Issue: Still seeing "TEST MODE" banner
- Check `.env.local` has the sandbox Client ID
- Restart your server
- Clear browser cache

### Issue: Payment works but booking not created
- Check browser console for errors
- Check server logs
- Verify database connection
- Check API endpoint `/api/booking`

---

## ✅ Checklist for Sandbox Testing

- [ ] Created Sandbox Business Account (receives payments)
- [ ] Created Sandbox Personal Account (customer for testing)
- [ ] Created PayPal app in Sandbox
- [ ] Got Sandbox Client ID
- [ ] Added Client ID to `.env.local`
- [ ] Restarted server
- [ ] Verified "TEST MODE" banner appears
- [ ] Tested complete payment flow
- [ ] Verified payment appears in Sandbox Business Account
- [ ] Verified booking created in database
- [ ] Tested payment cancellation
- [ ] Tested payment failure
- [ ] Ready to switch to live mode

---

## 📞 Support

- PayPal Developer Dashboard: https://developer.paypal.com/
- Sandbox PayPal: https://www.sandbox.paypal.com/
- PayPal Sandbox Documentation: https://developer.paypal.com/docs/api-basics/sandbox/

---

## 🎯 Summary

1. **Create Sandbox Accounts**: Business (receives) + Personal (customer)
2. **Create PayPal App**: Get Sandbox Client ID
3. **Add to Website**: Set Client ID in `.env.local`
4. **Test Payment Flow**: Complete payment and verify in Sandbox account
5. **Verify Payments**: Check Sandbox Business Account for payments
6. **Switch to Live**: When ready, use Live Client ID

**Key Point:** In sandbox, you can test the complete flow and verify payments go to YOUR sandbox account. This confirms the setup works before going live!




