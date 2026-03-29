# PayPal Setup Guide - Connect to Your PayPal Account

This guide will help you connect your PayPal account to receive real payments.

## Step 1: Get Your PayPal Client ID

1. **Go to PayPal Developer Dashboard**
   - Visit: https://developer.paypal.com/
   - Log in with your PayPal business account (or create one if you don't have it)

2. **Create a New App**
   - Click on "My Apps & Credentials" in the dashboard
   - Click "Create App" button
   - Fill in the app details:
     - **App Name**: Your app name (e.g., "Surf Camp Booking")
     - **Merchant**: Select your business account
     - Click "Create App"

3. **Get Your Client ID**
   - After creating the app, you'll see two sets of credentials:
     - **Sandbox** (for testing)
     - **Live** (for production - REAL payments)
   - For production, copy the **Live Client ID**
   - It should look like: `AeA1QIZXiflr1_-xxxxx-xxxxx` (starts with "A" and is longer)

## Step 2: Set Environment Variable

1. **Create/Update `.env.local` file** in your project root:
   ```bash
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id_here
   ```

2. **For Vercel/Production Deployment:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add a new variable:
     - **Name**: `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
     - **Value**: Your Live Client ID from PayPal
     - **Environment**: Production (and Preview if needed)
   - Click "Save"

## Step 3: Verify Setup

1. **Check your `.env.local` file:**
   ```bash
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id_here
   ```

2. **Restart your development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Test the Payment Page:**
   - Go to the payment page (`/checkout/6-payment`)
   - You should see a **green banner** saying "✅ LIVE MODE - Real PayPal Payments"
   - If you see a yellow "TEST MODE" banner, the Client ID is not set correctly

## Important Notes

⚠️ **Before Going Live:**
- Make sure you have a **PayPal Business Account** (not personal)
- Test thoroughly in sandbox mode first
- Ensure your PayPal account is verified
- Set up webhook notifications if needed (for order status updates)

🔒 **Security:**
- Never commit your `.env.local` file to git
- Keep your Client ID and Secret secure
- Use environment variables for all sensitive data

💰 **How Payments Work - Money Goes to YOUR Account:**
- ✅ When you use YOUR Live Client ID, ALL payments automatically go to YOUR PayPal account
- ✅ The Client ID is linked to YOUR PayPal account - no additional setup needed
- ✅ PayPal handles the payment processing securely
- ✅ You'll receive email notifications when payments are received
- ✅ Funds will appear in your PayPal account (may take 1-3 business days to clear)
- ✅ You can see all transactions in your PayPal account dashboard

**Important:** Make sure you're using YOUR PayPal account's Live Client ID. The account you use to create the app in PayPal Developer Dashboard is the account that will receive all payments.

## Testing vs Production

- **Sandbox Mode** (Testing):
  - Client ID starts with "A" but is shorter
  - Or uses "sb" (default)
  - No real money is charged
  - Use PayPal test accounts

- **Production Mode** (Live):
  - Client ID starts with "A" and is longer (30+ characters)
  - Real payments are processed
  - Money goes to your PayPal account
  - Requires a verified PayPal Business account

## Troubleshooting

**Issue: Still showing "TEST MODE"**
- Check that `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set in `.env.local`
- Restart your development server
- Clear browser cache
- Make sure you're using the **Live Client ID**, not Sandbox

**Issue: PayPal buttons not showing**
- Check browser console for errors
- Verify the Client ID is correct
- Make sure you have internet connection
- Check PayPal Developer Dashboard for any app restrictions

**Issue: Payments not received**
- Verify your PayPal Business account is active
- Check PayPal account settings for payment receiving
- Review PayPal transaction history
- Check webhook settings if configured

## Support

- PayPal Developer Documentation: https://developer.paypal.com/docs/
- PayPal Support: https://www.paypal.com/support
- PayPal Developer Community: https://developer.paypal.com/community/

