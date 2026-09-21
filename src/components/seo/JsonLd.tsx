// src/components/seo/JsonLd.tsx
import { safeJson } from '@/lib/seo'

/** Renders structured data for search engines. Server-rendered, so it is in the HTML crawlers download. */
export default function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(data) }} />
}
