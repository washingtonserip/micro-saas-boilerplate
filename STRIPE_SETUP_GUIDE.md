# Stripe Integration Setup Guide

## 📋 Step 1: Create Stripe Account & Products

### 1.1 Create/Login to Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account (or login)
2. Switch to **Test Mode** (toggle in the top right)

### 1.2 Create Products and Prices

#### Starter Plan

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add Product**
3. Fill in:
   - **Name**: Starter
   - **Description**: Perfect for small teams getting started
   - **Pricing**: Recurring
4. Add two prices:
   - **Monthly**: $19/month → Copy Price ID (starts with `price_`)
   - **Yearly**: $190/year → Copy Price ID

#### Pro Plan

1. Click **+ Add Product** again
2. Fill in:
   - **Name**: Pro
   - **Description**: For teams that need advanced features
   - **Pricing**: Recurring
3. Add two prices:
   - **Monthly**: $49/month → Copy Price ID
   - **Yearly**: $490/year → Copy Price ID

---

## 🔑 Step 2: Get API Keys

1. Go to **Developers** → **API Keys** in Stripe Dashboard
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Click **Reveal test key** and copy **Secret Key** (starts with `sk_test_`)

---

## 🎯 Step 3: Update Environment Variables

Open `apps/web/.env.local` and fill in:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Stripe Price IDs (from Step 1.2)
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_STARTER_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
```

**Note**: Leave `STRIPE_WEBHOOK_SECRET` empty for now - we'll set it in Step 4.

---

## 🌐 Step 4: Set Up Webhooks (Local Development)

1. **Install Stripe CLI**:

   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows (with Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe

   # Linux
   # See: https://stripe.com/docs/stripe-cli#install
   ```

2. **Login to Stripe**:

   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:

   ```bash
   stripe listen --forward-to http://localhost:3000/api/auth/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) and add to `.env.local`:

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **Keep this terminal running** while developing

---

## 🚀 Step 5: Start Development Server

1. **Make sure Docker PostgreSQL is running**:

   ```bash
   docker compose up -d
   ```

2. **Start the dev server**:

   ```bash
   pnpm dev
   ```

3. **Visit the app**:
   - Main app: http://localhost:3000
   - Pricing page: http://localhost:3000/pricing
   - Subscription page: http://localhost:3000/dashboard/subscription

---

## 🧪 Step 6: Test the Integration

### Test Cards (Stripe Test Mode)

Use these test cards for testing:

| Card Number         | Scenario                |
| ------------------- | ----------------------- |
| 4242 4242 4242 4242 | Successful payment      |
| 4000 0025 0000 3155 | Requires authentication |
| 4000 0000 0000 9995 | Declined                |

**Other details** (use any values):

- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Testing Flow

1. **Sign Up** for an account at http://localhost:3000/sign-up
2. **Go to Pricing** page: http://localhost:3000/pricing
3. **Click "Upgrade Now"** on Starter or Pro plan
4. **Complete checkout** with test card `4242 4242 4242 4242`
5. **Verify** you're redirected to success page
6. **Check** subscription page shows active subscription
7. **Test billing portal** by clicking "Manage Billing"

### Verify Webhooks

If using Stripe CLI, you should see webhook events in the terminal:

```
✓ checkout.session.completed [200]
✓ customer.subscription.created [200]
```

---

## 📦 What Was Implemented

### Backend

- ✅ Better Auth Stripe plugin configured
- ✅ Database schema with subscription tables
- ✅ tRPC procedures for subscription management
- ✅ Stripe helper utilities
- ✅ Webhook handling (automatic via Better Auth)

### Frontend

- ✅ Pricing page with plan selection
- ✅ Subscription management dashboard
- ✅ Payment success page
- ✅ Subscription status badges
- ✅ Subscription guards/hooks for feature gating

### Features

- ✅ Multiple pricing tiers (Free, Starter, Pro)
- ✅ Monthly and annual billing
- ✅ 14-day free trials
- ✅ Stripe Customer Portal integration
- ✅ Subscription lifecycle hooks
- ✅ Trial abuse prevention

---

## 🎨 Usage Examples

### Protect a Feature by Plan

```tsx
import { RequireSubscription } from "@/lib/stripe/subscription-guards";

export function PremiumFeature() {
  return (
    <RequireSubscription requiredPlan="starter">
      <div>This is only visible to Starter+ users</div>
    </RequireSubscription>
  );
}
```

### Check Access in Component

```tsx
import { useHasAccess } from "@/lib/stripe/subscription-guards";

export function MyComponent() {
  const { hasAccess, plan } = useHasAccess("pro");

  return (
    <div>
      {hasAccess ? (
        <button>Pro Feature</button>
      ) : (
        <button onClick={() => router.push("/pricing")}>Upgrade to Pro</button>
      )}
    </div>
  );
}
```

### Get Subscription Status

```tsx
import { useSubscriptionStatus } from "@/lib/stripe/subscription-guards";

export function Header() {
  const { plan, hasSubscription } = useSubscriptionStatus();

  return (
    <div>
      Current Plan: {plan}
      {!hasSubscription && <a href="/pricing">Upgrade</a>}
    </div>
  );
}
```

## 📚 Additional Resources

- [Better Auth Stripe Plugin Docs](https://www.better-auth.com/docs/plugins/stripe)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
