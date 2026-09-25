// sanity/lib/client.ts
//
// RECONSTRUCTED FILE — this file was not present in the uploaded zip, but it's required
// (src/lib/queries.ts, the webhook, and the checkout route all import from it). Written to
// match how those files already call it (`sanityClient.fetch(...)`, `sanityClient.withConfig(...)`,
// `sanityWriteClient.getDocument/createIfNotExists/patch/delete`). If your real project already
// has this file, diff against it rather than overwriting blind — the values below (apiVersion,
// perspective) are reasonable defaults, not necessarily what you already had configured.
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set')
}

// Public, read-only client for rendering the storefront. Uses Sanity's CDN for speed;
// pages that need up-to-the-second data (see queries.ts) opt out per-call with .withConfig({ useCdn: false }).
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
  // "published" is the default perspective anyway, but named explicitly: drafts an editor
  // hasn't hit Publish on are never shown on the live site.
  perspective: 'published',
})

// Authenticated client for server-side writes: creating/patching orders, decrementing stock.
// Never import this into anything that runs in the browser.
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published',
})
