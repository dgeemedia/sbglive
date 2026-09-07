// src/components/layout/WhatsAppButton.tsx
import { WhatsAppGlyph } from './SocialIcons'

export default function WhatsAppButton({ whatsappNumber }: { whatsappNumber?: string }) {
  if (!whatsappNumber) return null

  const digits = whatsappNumber.replace(/[^\d]/g, '')
  if (!digits) return null

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-black/40 hover:scale-105 transition-transform"
    >
      <WhatsAppGlyph />
    </a>
  )
}
