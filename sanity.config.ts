// sanity.config.ts
//
// RECONSTRUCTED FILE — not present in the uploaded zip. Merge with your real one if it has
// plugins/settings beyond the basics (this is deliberately minimal). The one thing worth keeping
// even if you restore your original file: the custom "Site Settings" structure item below, which
// routes straight into the single settings document instead of showing a list — since only one
// should ever exist, this stops an editor from accidentally creating a second one.
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'sbglive Studio',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('product').title('Products'),
            S.documentTypeListItem('order').title('Orders'),
            S.divider(),
            // Singleton: skip the list view, go straight to the one document.
            S.listItem()
              .title('Site Settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})
