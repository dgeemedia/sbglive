// sanity/schemas/order.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({ name: 'reference', title: 'Paystack Reference', type: 'string' }),
    defineField({ name: 'firstName', title: 'First Name', type: 'string' }),
    defineField({ name: 'lastName', title: 'Last Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'address', title: 'Delivery Address', type: 'text' }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'state', title: 'State', type: 'string' }),
    defineField({
      name: 'status', title: 'Order Status', type: 'string',
      options: { list: ['pending','paid','fulfilled','cancelled'], layout: 'radio' },
      initialValue: 'pending'
    }),
    defineField({ name: 'total', title: 'Total (₦)', type: 'number' }),
    defineField({
      name: 'items', title: 'Order Items', type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'productName', title: 'Product Name', type: 'string' },
          { name: 'productId', title: 'Product ID', type: 'string' },
          { name: 'size', title: 'Size', type: 'string' },
          { name: 'color', title: 'Color', type: 'string' },
          { name: 'quantity', title: 'Qty', type: 'number' },
          { name: 'price', title: 'Unit Price (₦)', type: 'number' },
        ]
      }]
    }),
    defineField({ name: 'createdAt', title: 'Order Date', type: 'datetime' }),
    defineField({ name: 'notes', title: 'Notes', type: 'text' }),
  ],
  preview: {
    select: { title: 'reference', subtitle: 'status', description: 'email' },
    prepare({ title, subtitle, description }) {
      const icons: Record<string, string> = { paid: '✅', pending: '⏳', fulfilled: '📦', cancelled: '❌' }
      return { title, subtitle: `${icons[subtitle] ?? ''} ${subtitle} — ${description}` }
    }
  }
})
