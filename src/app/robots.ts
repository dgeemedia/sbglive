// src/app/robots.ts  →  served at /robots.txt
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Not for search results: the API, the CMS Studio, and private / one-off pages
        disallow: ['/api/', '/studio', '/checkout', '/order-success', '/track-order', '/search'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
