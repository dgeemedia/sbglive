// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Ticker from '@/components/layout/Ticker'
import CartDrawer from '@/components/layout/CartDrawer'
import Footer from '@/components/layout/Footer'
import IntroScreen from '@/components/layout/IntroScreen'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import { Toaster } from 'react-hot-toast'
import { getSiteSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'sbglive – Lagos Streetwear',
  description: 'Pushing the limits of fashion and culture. Lagos-based streetwear brand.',
  openGraph: {
    title: 'sbglive',
    description: 'Lagos streetwear',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Space+Mono&display=swap" rel="stylesheet" />
      </head>
      <body>
        <IntroScreen socialLinks={settings?.socialLinks} />
        <Ticker />
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer settings={settings} />
        <WhatsAppButton whatsappNumber={settings?.whatsappNumber} phone={settings?.phone} />
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
