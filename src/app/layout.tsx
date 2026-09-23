// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Ticker from '@/components/layout/Ticker'
import CartDrawer from '@/components/layout/CartDrawer'
import Footer from '@/components/layout/Footer'
import IntroScreen from '@/components/layout/IntroScreen'
import CartHydrator from '@/components/layout/CartHydrator'
import { Toaster } from 'react-hot-toast'
import { getSiteSettings } from '@/lib/queries'
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, DEFAULT_OG_IMAGE, DEFAULT_TITLE, SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages give just their own name ("Tops"); the template adds the brand, so no page repeats it by hand.
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  // NOTE: no canonical here on purpose — a canonical on the root layout is inherited by every page and
  // would tell Google the whole site is a copy of the homepage. Each page sets its own (see lib/seo.ts).
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_NG',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    // let Google show large product images in results
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  category: 'fashion',
  // Optional: paste the token Google Search Console gives you into NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }),
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="en-NG">
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
