// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'sbglive-studio',
  title: 'SBGLive Admin',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('SBGLive CMS')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Site Settings')
              ),
            S.divider(),
            S.listItem().title('Products').schemaType('product').child(
              S.documentList().title('Products').filter('_type == "product"').defaultOrdering([{ field: 'order', direction: 'asc' }])
            ),
            S.divider(),
            S.listItem().title('Orders').schemaType('order').child(
              S.documentList().title('All Orders').filter('_type == "order"').defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
            ),
            S.listItem().title('Paid Orders').schemaType('order').child(
              S.documentList().title('Paid Orders').filter('_type == "order" && status == "paid"')
            ),
            S.listItem().title('Fulfilled Orders').schemaType('order').child(
              S.documentList().title('Fulfilled Orders').filter('_type == "order" && status == "fulfilled"')
            ),
          ])
    }),
  ],
  schema: { types: schemaTypes },
})