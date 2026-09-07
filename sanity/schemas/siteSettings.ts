// sanity/schemas/siteSettings.ts
export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // This is a singleton — only one document of this type should ever exist.
  // The Studio structure (sanity.config.ts) locks editors into that one document.
  fields: [
    {
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Main hero heading, e.g. "SBG"',
    },
    {
      name: 'heroHighlight',
      title: 'Hero Highlight',
      type: 'string',
      description: 'The accent-colored part of the heading, e.g. "live"',
    },
    {
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
      description: 'Small tagline under the heading, e.g. "LAGOS • ALL PRODUCTS"',
    },
    {
      name: 'heroBackgroundImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. If left empty, the default dark background is used.',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      description: 'Displayed phone number, e.g. +234 801 234 5678',
    },
    {
      name: 'whatsappNumber',
      title: 'WhatsApp Number',
      type: 'string',
      description: 'Digits only with country code, no + or spaces, e.g. 2348012345678. Used for the WhatsApp chat button.',
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'Twitter / X', value: 'twitter' },
                  { title: 'Snapchat', value: 'snapchat' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'YouTube', value: 'youtube' },
                ],
              },
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        },
      ],
    },
  ],
}
