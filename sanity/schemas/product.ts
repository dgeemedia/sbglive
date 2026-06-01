import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Product Name', type: 'string', validation: R => R.required() }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: R => R.required()
    }),
    defineField({ name: 'price', title: 'Price (₦)', type: 'number', validation: R => R.required().positive() }),
    defineField({
      name: 'images', title: 'Product Images', type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alt text' }] }],
      validation: R => R.required().min(1)
    }),
    defineField({
      name: 'category', title: 'Category', type: 'string',
      options: { list: ['tops', 'bottoms', 'accessories', 'footwear', 'headwear'] },
      validation: R => R.required()
    }),
    defineField({ name: 'sizes', title: 'Available Sizes', type: 'array', of: [{ type: 'string' }], options: { list: ['XS','S','M','L','XL','2XL','3XL','W30','W32','W34','W36','One Size'] } }),
    defineField({ name: 'colors', title: 'Available Colors', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'inStock', title: 'In Stock', type: 'boolean', initialValue: true }),
    defineField({ name: 'isSoldOut', title: 'Mark as Sold Out', type: 'boolean', initialValue: false }),
    defineField({ name: 'isNew', title: 'Mark as New Release', type: 'boolean', initialValue: false }),
    defineField({ name: 'isComingSoon', title: 'Coming Soon', type: 'boolean', initialValue: false }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', initialValue: 0 }),
  ],
  orderings: [
    { title: 'Newest', name: 'createdAtDesc', by: [{ field: '_createdAt', direction: 'desc' }] },
    { title: 'Display Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Price: Low to High', name: 'priceAsc', by: [{ field: 'price', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'price', media: 'images.0' },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: `₦${subtitle?.toLocaleString()}`, media }
    }
  }
})
