// src/app/contact/page.tsx
import { getSiteSettings } from '@/lib/queries'
import SocialIcons from '@/components/layout/SocialIcons'
import ContactForm from '@/components/shop/ContactForm'

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const waDigits = (settings?.whatsappNumber || settings?.phone || '').replace(/[^\d]/g, '')

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">CONTACT</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">GET IN TOUCH WITH THE TEAM</p>

      <ContactForm waDigits={waDigits} />

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
