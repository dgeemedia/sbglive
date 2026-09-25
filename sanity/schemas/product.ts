// sanity/schemas/product.ts
//
// RECONSTRUCTED FILE — the real product.ts wasn't in the uploaded zip either. Fields below are
// reverse-engineered from PRODUCT_FIELDS in src/lib/queries.ts, so names/types match what the
// front end already reads (name, slug, price, images, category, sizes, colors, description,
// inStock, isSoldOut, isNew, isComingSoon, tags, order). If your real product.ts has extra
// fields not used in that query, carry them over from your original file — don't lose them.
//
// WHAT'S NEW HERE: the `stock` array. This is the actual inventory feature — a quantity-in / units-
// sold counter per size+colour combination, kept up to date automatically by the payment webhook
// (see src/app/api/webhook/route.ts) every time an order is marked paid. It's additive and optional:
// a product with no `stock` entries behaves exactly as before, driven only by the `inStock` /
// `isSoldOut` toggles. Add stock lines only to products where you want real quantity tracking.
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'price', title: 'Price (₦)', type: 'number', validation: (Rule) => Rule.required().min(0) }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Alt text', type: 'string' }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['tops', 'bottoms', 'outerwear', 'footwear', 'accessories'] },
    }),
    defineField({ name: 'sizes', title: 'Sizes', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'colors', title: 'Colours', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),

    // --- Availability (existing, manual, boolean) ---
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
      description: 'Untick when this product has none left. Ignored for "Coming Soon" items.',
    }),
    defineField({
      name: 'isSoldOut',
      title: 'Force Sold Out',
      type: 'boolean',
      description: 'Manual override — ticking this always marks the product sold out, regardless of stock below.',
    }),
    defineField({ name: 'isNew', title: 'Mark as New Release', type: 'boolean' }),
    defineField({ name: 'isComingSoon', title: 'Coming Soon', type: 'boolean' }),

    // --- Inventory (new) ---
    defineField({
      name: 'stock',
      title: 'Stock by size / colour',
      type: 'array',
      description:
        'Optional. Add one line per size+colour combination you sell and set how many units you ' +
        'have. "Sold" updates itself automatically whenever an order for that combination is paid — ' +
        'don\'t edit it by hand. Leave this whole list empty if you\'d rather keep using the simple ' +
        '"In Stock" toggle above; the site treats an empty list the old way.',
      of: [{
        type: 'object',
        name: 'stockLine',
        fields: [
          {
            name: 'size',
            title: 'Size',
            type: 'string',
            description: 'Leave blank / use "ONE SIZE" if this product has no size options.',
          },
          {
            name: 'color',
            title: 'Colour',
            type: 'string',
            description: 'Leave blank / use "DEFAULT" if this product has no colour options.',
          },
          {
            name: 'quantity',
            title: 'Units in stock',
            type: 'number',
            initialValue: 0,
            validation: (Rule) => Rule.required().min(0).integer(),
          },
          {
            name: 'sold',
            title: 'Units sold',
            type: 'number',
            initialValue: 0,
            readOnly: true,
            description: 'Updated automatically by the payment webhook. Read-only.',
          },
        ],
        preview: {
          select: { size: 'size', color: 'color', quantity: 'quantity', sold: 'sold' },
          prepare({ size, color, quantity, sold }) {
            return {
              title: `${size || 'ONE SIZE'} / ${color || 'DEFAULT'}`,
              subtitle: `${quantity ?? 0} left · ${sold ?? 0} sold`,
            }
          },
        },
      }],
    }),

    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'order', title: 'Sort Order', type: 'number', description: 'Lower numbers show first.' }),
  ],
  preview: {
    select: { title: 'name', media: 'images.0', subtitle: 'category' },
  },
})
