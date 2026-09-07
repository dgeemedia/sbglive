// src/types/index.ts
export interface Product {
  _id: string
  name: string
  slug: string
  price: number
  images: SanityImage[]
  category: string
  sizes: string[]
  colors: string[]
  description: string
  inStock: boolean
  isSoldOut: boolean
  isNew: boolean
  isComingSoon: boolean
  tags: string[]
}

export interface SanityImage {
  _key: string
  asset: { _ref: string; _type: string }
  alt?: string
}

export interface CartItem {
  _id: string
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
  slug: string
}

export interface SocialLink {
  platform: 'instagram' | 'tiktok' | 'twitter' | 'snapchat' | 'facebook' | 'youtube' | 'linkedin'
  url: string
}

export interface SiteSettings {
  heroTitle?: string
  heroHighlight?: string
  heroSubtitle?: string
  heroBackgroundImage?: SanityImage
  address?: string
  phone?: string
  whatsappNumber?: string
  socialLinks?: SocialLink[]
}

export interface Order {
  _id?: string
  reference: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  items: CartItem[]
  total: number
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'
  createdAt: string
}
