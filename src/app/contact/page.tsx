// src/app/contact/page.tsx
import { getSiteSettings } from '@/lib/queries'
import SocialIcons, { WhatsAppGlyph } from '@/components/layout/SocialIcons'

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const waDigits = (settings?.whatsappNumber || settings?.phone || '').replace(/[^\d]/g, '')

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">CONTACT</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">GET IN TOUCH WITH THE TEAM</p>
      <div className="space-y-4">
        <div>
          <label className="block text-xs tracking-[2px] text-[#888] mb-1.5">NAME</label>
          <input type="text" placeholder="Your name" className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-[#555]" />
        </div>
        <div>
          <label className="block text-xs tracking-[2px] text-[#888] mb-1.5">EMAIL</label>
          <input type="email" placeholder="your@email.com" className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-[#555]" />
        </div>
        <div>
          <label className="block text-xs tracking-[2px] text-[#888] mb-1.5">MESSAGE</label>
          <textarea rows={5} placeholder="Your message..." className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-[#555] resize-none" />
        </div>
        <button className="w-full bg-[#ff2d2d] hover:bg-red-700 text-white py-4 font-bebas text-xl tracking-[4px] transition-colors">
          SEND MESSAGE
        </button>
      </div>

      {waDigits && (
        <a
          href={`https://wa.me/${waDigits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center gap-3 w-full bg-[#25D366] hover:opacity-90 text-white py-4 font-bebas text-xl tracking-[4px] transition-opacity"
        >
          <WhatsAppGlyph className="w-6 h-6" />
          CHAT ON WHATSAPP
        </a>
      )}

      <div className="mt-12 space-y-3 border-t border-[#2a2a2a] pt-8">
        <p className="text-xs tracking-[3px] text-[#555]">EMAIL — <span className="text-[#888]">hello@sbgfashion.org</span></p>
        {settings?.phone && (
          <p className="text-xs tracking-[3px] text-[#555]">PHONE — <span className="text-[#888]">{settings.phone}</span></p>
        )}
        <p className="text-xs tracking-[3px] text-[#555]">LOCATION — <span className="text-[#888]">{settings?.address || 'Lagos, Nigeria'}</span></p>
        <SocialIcons links={settings?.socialLinks} className="pt-2" />
      </div>
    </div>
  )
}
