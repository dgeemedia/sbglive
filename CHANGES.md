# What's in this folder, and how to merge it

Same relative paths as your project, so files can be dropped straight in — but read this first,
because some of these are **reconstructed**, not edited, and need a careful merge rather than a
blind overwrite.

## Reconstructed (not in your zip at all — I had to infer these)

These files were entirely missing from the upload, so I rebuilt minimal, working versions from
what the rest of the codebase expected of them. **Diff these against your real files before
replacing anything** — if your originals have extra config, plugins, or fields, keep those.

- `sanity/lib/client.ts`
- `sanity.config.ts`
- `sanity/schemas/product.ts`
- `sanity/schemas/siteSettings.ts` (this one plausibly never existed as its own file at all —
  see below)
- `sanity/schemas/index.ts`

## Actually modified (yours, with targeted changes)

- `src/lib/queries.ts`
- `src/lib/checkout.ts`
- `src/app/api/webhook/route.ts`

---

## 1. The video fix

Your front end does:

```
introVideo{ asset->{ url } }                     // queries.ts
videoUrl={settings?.introVideo?.asset?.url}       // layout.tsx
```

That only resolves when `introVideo` is a Sanity **`file`** field — it needs an `asset` reference
to dereference. `sanity/schemas/siteSettings.ts` defines it that way:

```ts
defineField({
  name: 'introVideo',
  title: 'Intro Screen Background Video',
  type: 'file',
  options: { accept: 'video/*' },
})
```

**To apply this for real:**
1. Find wherever `introVideo` is currently defined in your Studio schema (it wasn't in the zip,
   so I can't point at the exact line) and confirm its `type`. If it's anything other than `file`
   — a plain string/URL field is the most common culprit — that mismatch is very likely the whole
   bug: the query silently returns nothing and the front end falls back to the bundled
   `/videos/intro.mp4`.
2. Swap in the `file` field definition above (or replace the whole schema file with mine, once
   you've folded in any other settings fields your real one has that I didn't know about).
3. Restart Studio, open Site Settings, and **re-upload** the video into the corrected field —
   changing the schema type doesn't retroactively fix a value that was already saved under the
   old (wrong) type.
4. Publish. The homepage revalidates every 60 seconds (`export const revalidate = 60` in
   `src/app/page.tsx`), so it should appear within a minute of publishing — no redeploy needed.

If `introVideo` in your real schema is *already* a `file` field and this still doesn't work, the
next things to check are: the document was saved as a draft and never Published, or
`sanity/lib/client.ts`'s `perspective` isn't `'published'`.

---

## 2. The inventory system

Nothing tracked quantities before — `inStock` / `isSoldOut` were whole-product on/off switches,
and the webhook that confirms payment never touched product stock at all. Orders already record
`productId`, `size`, `color`, `quantity` per line, though, so the data needed was there — it just
wasn't being used.

**What's new, additive, optional per product:**

- `product.ts` gets a `stock` array — one line per size+colour combination, each with `quantity`
  (units left, you edit this) and `sold` (units sold, read-only, the webhook updates it).
- Leave a product's `stock` array empty and it behaves exactly as before, driven by the `inStock`
  toggle. Add stock lines only to the products where you want real counts.
- `queries.ts`: `isSoldOut` now also goes `true` when every stock line for a product hits 0
  (skipped for products not using `stock`, and skipped for Coming Soon items).
- `checkout.ts`: rejects an order if the quantity requested exceeds what's left for that specific
  size/colour (only for products using `stock` — untracked products aren't blocked on this).
- `webhook/route.ts`: the moment (and only the moment) an order is confirmed paid, it looks up
  each line's product, finds the matching size/colour stock line, subtracts the quantity from
  `quantity` and adds it to `sold`. This runs inside the same guard that already stops a Flutterwave
  webhook retry from double-processing an order, so it can't double-decrement.

**To see "what's sold and what's left" day to day:** open a product in Studio — each stock line's
preview shows e.g. `M / Black — 4 left · 11 sold` directly, no separate report needed. If you'd
rather have one dashboard listing every product's numbers at a glance instead of opening each
product, that's a reasonable next step (a custom Studio structure view, or a small `/admin`
page reading a GROQ query) — happy to build that next if useful.

**To adopt this for an existing catalogue:** for each product you want tracked, add a `stock` line
per size/colour you currently carry and set today's real count in `quantity`. `sold` starts at 0
by default — it only starts counting orders placed after you turn tracking on for that product.

**One thing to decide:** untracked products (empty `stock`) can currently be oversold — nothing
stops a customer ordering 50 of something with no quantity behind it, same as your original code.
That's unchanged on purpose (so nothing breaks for products you haven't set up yet), but worth
knowing.
