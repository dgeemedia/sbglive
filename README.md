# sbglive Storefront — Deployment Guide

## Stack
| Layer | Tool | Cost |
|---|---|---|
| Frontend + API | Next.js 14 | Free on Vercel |
| CMS / Admin | Sanity Studio | Free (up to 3 users) |
| Payments | Flutterwave | 1.4% per txn (capped ₦2,000) |
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

## Step 2 — Create a Flutterwave Account

1. Go to https://dashboard.flutterwave.com and sign up
2. Complete business verification (you'll need your client's BVN/CAC)
3. Dashboard → Settings → API Keys
4. Copy:
   - **Public Key** (starts with `FLWPUBK-...`)
   - **Secret Key** (starts with `FLWSECK-...`)
5. While you're there, scroll to **Webhooks** and set a **Secret Hash** — invent any random string, save it, and copy it too (this is `FLUTTERWAVE_SECRET_HASH` below)
6. **Client payouts:** create a **subaccount** for the client's bank account in the Flutterwave dashboard and copy its id (starts with `RS_`) — this is `FLUTTERWAVE_SUBACCOUNT_ID` below. Payments are split to it, so the client is paid directly. Checkout refuses to run without it. Test-mode and live-mode subaccounts have different ids, so use the one that matches your keys. The subaccount's default split (your commission, if any) is set on the subaccount itself in the dashboard.

> Use the `FLWPUBK_TEST-...` / `FLWSECK_TEST-...` keys shown in **Test Mode** during development — no real money moves, and Flutterwave gives you test card numbers to simulate payments

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

NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxx
FLUTTERWAVE_SECRET_HASH=your_own_random_secret_string
FLUTTERWAVE_SUBACCOUNT_ID=RS_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

RESEND_API_KEY=re_xxxx
EMAIL_FROM=orders@sbgfashion.live

NEXT_PUBLIC_BASE_URL=https://sbgfashion.live
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

## Step 7 — Set Up Flutterwave Webhook

This is **critical** — without it, orders won't be saved after payment.

1. Flutterwave Dashboard → Settings → Webhooks
2. Webhook URL: `https://sbgfashion.live/api/webhook`
3. Secret Hash: the same random string you set in Step 2 — this must match `FLUTTERWAVE_SECRET_HASH` in your env vars exactly
4. Events to listen for: `charge.completed`
5. Save

**Sharing one Flutterwave account with another app:** the Webhooks page holds a single URL and a single secret hash, so both apps use the same secret hash. This store only acts on payments it started (references starting `sbg_`) and ignores the rest. To keep the other app working, point the dashboard URL at this site and set `WEBHOOK_FORWARD_URL` to the other app's webhook URL — non-SBG events are passed on to it unchanged.

**How orders are recorded:** when a customer starts checkout, the order is saved in Studio as **pending** (with the items, sizes and delivery address). When Flutterwave confirms the payment, the webhook flips it to **paid** and sends the confirmation email. Pending orders that never turn paid are customers who didn't finish paying — you can safely delete them from Studio.

---

## Step 8 — Teach Your Client to Use the Admin Panel

Your client logs in at: `https://sbgfashion.live/studio`

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
│   │       ├── checkout/         ← Initializes Flutterwave payment
│   │       │   └── verify/       ← Confirms a transaction after redirect
│   │       ├── webhook/          ← Receives Flutterwave confirmation
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
POST /api/checkout → Flutterwave initializes transaction
        ↓
Customer redirected to Flutterwave payment page
        ↓
Customer pays (card / bank transfer / USSD)
        ↓
Flutterwave redirects back to /order-success?status=...&transaction_id=...
        ↓                                    ↓
Flutterwave sends webhook →         /order-success calls /api/checkout/verify
POST /api/webhook                   to confirm status before showing "confirmed"
        ↓
Webhook verified against Flutterwave → Order saved to Sanity → Email sent to customer
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
| Flutterwave | ✅ No monthly fee | 1.4%/txn (capped ₦2,000) |

**Total fixed cost to launch: ₦0**

---

## Support & Handoff

Built with Next.js, Sanity v3, Flutterwave, Resend, Zustand, TailwindCSS, Framer Motion.

## SEO

Built in: unique title / description / canonical URL on every page, a real `<h1>` on each, `robots.txt`, an automatic `sitemap.xml` (built from Sanity — new products appear within the hour), product / breadcrumb / organisation structured data, share previews for WhatsApp / Instagram / Facebook, and server-rendered product pages.

After deploying to `sbgfashion.live`:

1. In your host, make `sbgfashion.live` the primary domain and set **301 redirects** from `www.sbgfashion.live` and the old `sbgfashion.org` to it.
2. Add the site to [Google Search Console](https://search.google.com/search-console) (verify by DNS, or paste the token into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`) and submit `https://sbgfashion.live/sitemap.xml`. Do the same in Bing Webmaster Tools.
3. Paste a product URL into Google's Rich Results Test to confirm the Product data is read.

Writing tips in Studio (this is what search results show): give every product a real **Description** (1–2 sentences — it becomes the search snippet), a unique name, and alt text on its photos. Categories with no products are kept out of search automatically.
