// src/components/layout/Footer.tsx
import Link from 'next/link'
import SocialIcons, { WhatsAppGlyph } from './SocialIcons'
import type { SiteSettings } from '@/types'

function whatsappDigits(settings?: SiteSettings | null) {
  const source = settings?.whatsappNumber || settings?.phone
  return source ? source.replace(/[^\d]/g, '') : ''
}

export default function Footer({ settings }: { settings?: SiteSettings | null }) {
  const waDigits = whatsappDigits(settings)

  return (
    <footer className="bg-[#111] border-t border-[#2a2a2a] mt-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-12">
        <div>
          <h4 className="font-bebas text-lg tracking-[4px] text-white mb-4">SBG<span className="text-[#ff2d2d]">FASHION</span></h4>
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
          {['New Release','Tops','Bottoms','Accessories','Pre-Order'].map(l => (
            <Link key={l} href="/" className="block text-[#888] hover:text-white text-sm mb-2 transition-colors">{l}</Link>
          ))}
        </div>
        <div>
          <h4 className="font-bebas text-lg tracking-[4px] text-white mb-4">INFO</h4>
          {['Contact','Gallery','Shipping Policy','Returns','Terms of Service'].map(l => (
            <Link key={l} href="/" className="block text-[#888] hover:text-white text-sm mb-2 transition-colors">{l}</Link>
          ))}
        </div>
        <div>
          <h4 className="font-bebas text-lg tracking-[4px] text-white mb-4">ACCOUNT</h4>
          {['Track Order','Size Guide','FAQ','Privacy Policy'].map(l => (
            <Link key={l} href="/" className="block text-[#888] hover:text-white text-sm mb-2 transition-colors">{l}</Link>
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
