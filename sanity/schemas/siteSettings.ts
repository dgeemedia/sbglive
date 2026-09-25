// sanity/schemas/siteSettings.ts
//
// RECONSTRUCTED FILE — no siteSettings schema was present anywhere in the uploaded zip, yet
// src/lib/queries.ts queries `*[_type == "siteSettings"]` and src/app/layout.tsx reads
// introVideo / heroTitle / heroHighlight / heroSubtitle / heroBackgroundImage / address / phone /
// whatsappNumber / socialLinks from it. Field names below match those call sites exactly.
//
// THE VIDEO FIX: the front end does
//     introVideo{ asset->{ url } }                       (queries.ts)
//     videoUrl={settings?.introVideo?.asset?.url}         (layout.tsx)
// That only resolves if `introVideo` is a Sanity `file` field (it has an `asset` reference to
// dereference). If your live schema currently has this field as a plain string/URL, or as some
// other type, the query silently returns nothing and the front end falls back to the bundled
// /videos/intro.mp4 — which looks exactly like "my upload never takes effect." Replace whatever
// you have with the `introVideo` field defined here, restart Studio, and re-upload the video
// through Studio (a schema type change does not retroactively fix an already-saved value of the
// wrong shape — the asset needs to be re-uploaded into the corrected field once the type matches).
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton: only one of these should ever exist. Enforce that in your Studio structure
  // (sanity.config.ts) by routing straight to the single document instead of a list.
  fields: [
    defineField({
      name: 'introVideo',
      title: 'Intro Screen Background Video',
      type: 'file',
      description:
        'The looping background video on the "PRESS START" intro screen. Upload an MP4. ' +
        'If this is left empty, the site falls back to a bundled default video.',
      options: { accept: 'video/*' },
    }),
    defineField({ name: 'heroTitle', title: 'Hero Title', type: 'string' }),
    defineField({ name: 'heroHighlight', title: 'Hero Highlight Word', type: 'string' }),
    defineField({ name: 'heroSubtitle', title: 'Hero Subtitle', type: 'text' }),
    defineField({ name: 'heroBackgroundImage', title: 'Hero Background Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'address', title: 'Store Address', type: 'text' }),
    defineField({ name: 'phone', title: 'Phone Number', type: 'string' }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Number',
      type: 'string',
      description: 'Used for the WhatsApp button/link if different from the main phone number.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [{
        type: 'object',
        name: 'socialLink',
        fields: [
          {
            name: 'platform',
            title: 'Platform',
            type: 'string',
            options: { list: ['instagram', 'tiktok', 'facebook', 'x', 'youtube', 'whatsapp'] },
          },
          { name: 'url', title: 'URL', type: 'url' },
        ],
        preview: { select: { title: 'platform', subtitle: 'url' } },
      }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
