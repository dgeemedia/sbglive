# sbglive Storefront — Deployment Guide

## Stack
| Layer | Tool | Cost |
|---|---|---|
| Frontend + API | Next.js 14 | Free on Vercel |
| CMS / Admin | Sanity Studio | Free (up to 3 users) |
| Payments | Paystack | 1.5% + ₦100 per txn |
| Emails | Resend | Free (3k emails/mo) |
| Hosting | Vercel | Free hobby plan |

---

## Step 1 — Create a Sanity Project

1. Go to https://sanity.io and sign up / log in
2. Run in terminal (or visit sanity.io/manage):
   ```
   npx sanity init
   ```
3. Choose: "Create new project"
4. Name it: `sbglive-store`
5. Dataset: `production`
6. Copy your **Project ID** — you'll need it in Step 3

Then create an API token:
- Sanity dashboard → your project → API → Tokens
- Click **Add API Token**
- Name: `sbglive-write-token`
- Permissions: **Editor**
- Copy the token

---

## Step 2 — Create a Paystack Account

1. Go to https://paystack.com and sign up
2. Complete business verification (you'll need your client's BVN/CAC)
3. Dashboard → Settings → API Keys
4. Copy:
   - **Public Key** (starts with `pk_live_...`)
   - **Secret Key** (starts with `sk_live_...`)

> Use `pk_test_` / `sk_test_` keys during development — no real money moves

---

## Step 3 — Create a Resend Account (emails)

1. Go to https://resend.com and sign up (free)
2. Add your domain or use the sandbox for testing
3. Dashboard → API Keys → Create API Key
4. Copy the key (starts with `re_...`)

---

## Step 4 — Set Up Environment Variables

Copy the example env file:
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx
PAYSTACK_SECRET_KEY=sk_live_xxxx

RESEND_API_KEY=re_xxxx
EMAIL_FROM=orders@yourdomain.com

NEXT_PUBLIC_BASE_URL=https://yourdomain.vercel.app
```

---

## Step 5 — Run Locally

```bash
npm install
npm run dev
```

- Storefront: http://localhost:3000
- Admin Studio: http://localhost:3000/studio

---

## Step 6 — Deploy to Vercel (Free)

### Option A — Vercel CLI (recommended)
```bash
npm install -g vercel
vercel
```
Follow the prompts. When asked "Link to existing project?" → No → create new.

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import your repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy**

### Add Environment Variables on Vercel
Vercel Dashboard → Your Project → Settings → Environment Variables

Add every variable from your `.env.local` file. Then redeploy:
```bash
vercel --prod
```

---

## Step 7 — Set Up Paystack Webhook

This is **critical** — without it, orders won't be saved after payment.

1. Paystack Dashboard → Settings → API Keys & Webhooks
2. Webhook URL: `https://yourdomain.vercel.app/api/webhook`
3. Events to listen for: `charge.success`
4. Save

---

## Step 8 — Teach Your Client to Use the Admin Panel

Your client logs in at: `https://yourdomain.vercel.app/studio`

**To add a product:**
1. Click "Products" in the left sidebar
2. Click the **+** (New Product) button
3. Fill in: Name, Price (in ₦), Images, Category, Sizes, Colors, Description
4. Toggle "Mark as New Release" if it's a new drop
5. Click **Publish** — it goes live instantly

**To view orders:**
- Click "Orders" → all paid orders appear here
- Change status from "paid" → "fulfilled" when shipped

---

## File Structure

```
sbglive-store/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Homepage (product grid)
│   │   ├── products/[slug]/      ← Product detail page
│   │   ├── checkout/             ← Checkout form
│   │   ├── order-success/        ← Post-payment page
│   │   ├── contact/              ← Contact page
│   │   ├── studio/               ← Sanity admin panel
│   │   └── api/
│   │       ├── checkout/         ← Initializes Paystack payment
│   │       ├── webhook/          ← Receives Paystack confirmation
│   │       └── products/         ← Products REST endpoint
│   ├── components/
│   │   ├── layout/               ← Navbar, Footer, Ticker, CartDrawer
│   │   └── shop/                 ← ProductCard, ProductGrid
│   ├── hooks/useCart.ts          ← Cart state (Zustand)
│   ├── lib/queries.ts            ← GROQ queries to Sanity
│   └── types/index.ts            ← TypeScript types
├── sanity/
│   ├── schemas/product.ts        ← Product schema
│   ├── schemas/order.ts          ← Order schema
│   └── lib/client.ts             ← Sanity client config
├── sanity.config.ts              ← Studio configuration
├── .env.example                  ← Environment variable template
└── README.md                     ← This file
```

---

## Payment Flow (How It Works)

```
Customer fills checkout form
        ↓
POST /api/checkout → Paystack initializes transaction
        ↓
Customer redirected to Paystack payment page
        ↓
Customer pays (card / bank transfer / USSD)
        ↓
Paystack sends webhook → POST /api/webhook
        ↓
Webhook verified → Order saved to Sanity → Email sent to customer
        ↓
Customer redirected to /order-success
```

---

## Customisation Tips

| What | Where |
|---|---|
| Brand name / colors | `src/app/globals.css` and Tailwind classes |
| Ticker text | `src/components/layout/Ticker.tsx` |
| Nav links | `src/components/layout/Navbar.tsx` |
| Email template | `src/app/api/webhook/route.ts` → `buildOrderEmail()` |
| Delivery fee logic | `src/app/checkout/page.tsx` |
| Social media links | `src/components/layout/Footer.tsx` |

---

## Costs Summary

| Service | Free Tier | Paid |
|---|---|---|
| Vercel | ✅ Unlimited deploys | $20/mo Pro |
| Sanity | ✅ 3 users, 100k req/mo | $15/mo Growth |
| Resend | ✅ 3,000 emails/mo | $20/mo |
| Paystack | ✅ No monthly fee | 1.5% + ₦100/txn |

**Total fixed cost to launch: ₦0**

---

## Support & Handoff

Built with Next.js 14, Sanity v3, Paystack, Resend, Zustand, TailwindCSS.