// src/components/layout/IntroScreen.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import SocialIcons, { WhatsAppGlyph } from './SocialIcons'
import type { SocialLink } from '@/types'

const SESSION_KEY = 'sbg_intro_seen'

export default function IntroScreen({
  socialLinks,
  whatsappNumber,
  videoUrl,
}: {
  socialLinks?: SocialLink[]
  whatsappNumber?: string
  videoUrl?: string
}) {
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  // Only show once per browser session, and only on the homepage.
  useEffect(() => {
    setMounted(true)
    if (pathname !== '/') return
    const alreadySeen = sessionStorage.getItem(SESSION_KEY)
    if (!alreadySeen) setVisible(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted || pathname !== '/' || !visible) return null

  const handlePressStart = () => {
    setClosing(true)
    sessionStorage.setItem(SESSION_KEY, '1')
    // Let the fade-out finish before unmounting, then hand off to the site underneath.
    setTimeout(() => setVisible(false), 500)
  }

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between overflow-hidden transition-opacity duration-500 ${
        closing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background video — always muted, no audio */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={videoUrl || '/videos/intro.mp4'}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Press start */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <button
          onClick={handlePressStart}
          className="font-mono text-white text-lg md:text-2xl tracking-[4px] animate-pulse hover:text-[#ff2d2d] transition-colors"
        >
          &gt; PRESS START &lt;
        </button>
      </div>

      {/* Socials + credit */}
      <div className="relative z-10 pb-8 flex flex-col items-center gap-4">
        <div className="flex gap-2 flex-wrap justify-center items-center">
          <SocialIcons
            links={socialLinks}
            iconClassName="border border-white/30 hover:border-[#ff2d2d] hover:text-[#ff2d2d] text-white w-9 h-9 flex items-center justify-center transition-colors rounded-full"
          />
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center"
            >
              <WhatsAppGlyph className="w-4 h-4" />
            </a>
          )}
        </div>
        <p className="font-mono text-[10px] tracking-[2px] text-white/50 text-center">
          WEBSITE BY
          <br />
          <span className="text-white/70">ELORGE TECHNOLOGIES LIMITED</span>
        </p>
      </div>
    </div>
  )
}
