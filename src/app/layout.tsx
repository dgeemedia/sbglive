// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Ticker from '@/components/layout/Ticker'
import CartDrawer from '@/components/layout/CartDrawer'
import Footer from '@/components/layout/Footer'
import IntroScreen from '@/components/layout/IntroScreen'
import CartHydrator from '@/components/layout/CartHydrator'
import { Toaster } from 'react-hot-toast'
import { getSiteSettings } from '@/lib/queries'

export const metadata: Metadata = {
  metadataBase: new URL('https://sbgfashion.live'),
  title: 'SBGFASHION – Lagos Streetwear',
  description: 'Pushing the limits of fashion and culture. Lagos-based streetwear brand.',
  openGraph: {
    title: 'SBGFASHION',
    description: 'Lagos streetwear',
    type: 'website',
    siteName: 'SBGFASHION',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'SBGFASHION logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'SBGFASHION',
    description: 'Lagos streetwear',
    images: ['/logo.png'],
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
        <CartHydrator />
        <IntroScreen
          socialLinks={settings?.socialLinks}
          whatsappNumber={settings?.whatsappNumber || settings?.phone}
          videoUrl={settings?.introVideo?.asset?.url}
        />
        <Ticker />
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer settings={settings} />
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
