// src/components/layout/Footer.tsx
import Link from 'next/link'
import Image from 'next/image'
import SocialIcons, { WhatsAppGlyph } from './SocialIcons'
import type { SiteSettings } from '@/types'
import { waDigitsFromSettings } from '@/lib/phone'

export default function Footer({ settings }: { settings?: SiteSettings | null }) {
  const waDigits = waDigitsFromSettings(settings)

  return (
    <footer className="bg-[#111] border-t border-[#2a2a2a] mt-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-12">
        <div>
          <Image src="/sbg-logo.png" alt="SBGFASHION" width={92} height={72} className="h-16 w-auto mb-4 logo-spin" />
          <p className="text-[#888] text-sm leading-relaxed">Lagos-based streetwear pushing the limits of fashion and culture.</p>
          {settings?.address && (
            <p className="text-[#888] text-sm leading-relaxed mt-3">{settings.address}</p>
          )}
          {settings?.phone && (
            <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="block text-[#888] hover:text-white text-sm mt-1 transition-colors">
              {settings.phone}
            </a>
          )}
          <div className="flex gap-2 mt-4 flex-wrap items-center">
            <SocialIcons links={settings?.socialLinks} />
            {waDigits && (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center"
              >
                <WhatsAppGlyph className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-bebas text-lg tracking-[4px] text-white mb-4">SHOP</h4>
          {[
            { label: 'New Release', href: '/category/new' },
            { label: 'Tops', href: '/category/tops' },
            { label: 'Bottoms', href: '/category/bottoms' },
            { label: 'Accessories', href: '/category/accessories' },
            { label: 'Pre-Order', href: '/category/pre-order' },
          ].map(l => (
            <Link key={l.label} href={l.href} className="block text-[#888] hover:text-white text-sm mb-2 transition-colors">{l.label}</Link>
          ))}
        </div>
        <div>
          <h4 className="font-bebas text-lg tracking-[4px] text-white mb-4">INFO</h4>
          {[
            { label: 'Contact', href: '/contact' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'Shipping Policy', href: '/shipping-policy' },
            { label: 'Returns', href: '/returns' },
            { label: 'Terms of Service', href: '/terms-of-service' },
          ].map(l => (
            <Link key={l.label} href={l.href} className="block text-[#888] hover:text-white text-sm mb-2 transition-colors">{l.label}</Link>
          ))}
        </div>
        <div>
          <h4 className="font-bebas text-lg tracking-[4px] text-white mb-4">ACCOUNT</h4>
          {[
            { label: 'Track Order', href: '/track-order' },
            { label: 'Size Guide', href: '/size-guide' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Privacy Policy', href: '/privacy-policy' },
          ].map(l => (
            <Link key={l.label} href={l.href} className="block text-[#888] hover:text-white text-sm mb-2 transition-colors">{l.label}</Link>
          ))}
        </div>
      </div>
      <div className="border-t border-[#2a2a2a] px-6 py-4 text-center text-[#555] text-xs tracking-[2px]">
        © {new Date().getFullYear()} SBGFASHION — ALL RIGHTS RESERVED — LAGOS, NIGERIA
      </div>
      {/* Fixed credit — intentionally not sourced from Sanity, do not make editable */}
      <div className="border-t border-[#2a2a2a] px-6 py-3 text-center text-[#444] text-[10px] tracking-[2px] font-mono">
        WEBSITE BY ELORGE TECHNOLOGIES LIMITED
      </div>
    </footer>
  )
}
