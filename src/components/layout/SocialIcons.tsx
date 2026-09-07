// src/components/layout/SocialIcons.tsx
import type { ReactElement } from 'react'
import type { SocialLink } from '@/types'

function Instagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4V15.5a4.7 4.7 0 1 1-4.7-4.7c.16 0 .32 0 .48.03v2.36a2.34 2.34 0 1 0 1.94 2.31V2h2.32a4.28 4.28 0 0 0 3.1 4.1v-.28z" />
    </svg>
  )
}

function Twitter() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.9 3H21l-6.6 7.5L22 21h-6.1l-4.8-6.3L5.5 21H3.4l7-8L2.6 3h6.2l4.3 5.8L18.9 3Zm-1 16.2h1.2L7.2 4.7H5.9L17.9 19.2Z" />
    </svg>
  )
}

function Snapchat() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2c2.9 0 4.7 2.2 4.7 4.7v1.6c0 .3.3.4.6.3.4-.1.9.1 1 .5.1.4-.1.9-.6 1.1-.2.1-.3.2-.3.4 0 .5.7 1.6 2.2 2 .3.1.4.4.3.7-.2.6-1.1 1-1.8 1.1-.1 0-.2.1-.2.2 0 .1.1.5.2.8.1.3-.1.5-.4.5-.6.1-1.7.2-2.2.5-.5.4-1.3 1.6-3.5 1.6s-3-1.2-3.5-1.6c-.5-.3-1.6-.4-2.2-.5-.3 0-.5-.2-.4-.5.1-.3.2-.7.2-.8 0-.1-.1-.2-.2-.2-.7-.1-1.6-.5-1.8-1.1-.1-.3 0-.6.3-.7 1.5-.4 2.2-1.5 2.2-2 0-.2-.1-.3-.3-.4-.5-.2-.7-.7-.6-1.1.1-.4.6-.6 1-.5.3.1.6 0 .6-.3V6.7C7.3 4.2 9.1 2 12 2Z" />
    </svg>
  )
}

function Facebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M13.5 21v-8.1h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.6-1.6h1.7V3.2C16.5 3.1 15.4 3 14.2 3c-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.7V21h3.5Z" />
    </svg>
  )
}

function YouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M22 12s0-3.1-.4-4.6a2.9 2.9 0 0 0-2-2C17.9 5 12 5 12 5s-5.9 0-7.6.4a2.9 2.9 0 0 0-2 2C2 8.9 2 12 2 12s0 3.1.4 4.6a2.9 2.9 0 0 0 2 2C6.1 19 12 19 12 19s5.9 0 7.6-.4a2.9 2.9 0 0 0 2-2C22 15.1 22 12 22 12Zm-12 3V9l5.2 3-5.2 3Z" />
    </svg>
  )
}

function LinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.25a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 20h-3.37v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V20h-3.37V8.5h3.24v1.57h.05c.45-.85 1.56-1.75 3.22-1.75 3.44 0 4.08 2.27 4.08 5.21V20Z" />
    </svg>
  )
}

export function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.3 4.8 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.16 8.16 0 0 1 3.8 12c0-4.5 3.7-8.2 8.2-8.2 4.5 0 8.2 3.7 8.2 8.2 0 4.5-3.7 8.2-8.2 8.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.1 0-.3 0-.4 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2.9 2.4.1.2 1.6 2.4 3.9 3.4.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.5-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  )
}

const ICONS: Record<string, () => ReactElement> = {
  instagram: Instagram,
  tiktok: TikTok,
  twitter: Twitter,
  snapchat: Snapchat,
  facebook: Facebook,
  youtube: YouTube,
  linkedin: LinkedIn,
}

export default function SocialIcons({
  links,
  className = '',
  iconClassName = 'border border-[#2a2a2a] hover:border-[#ff2d2d] hover:text-[#ff2d2d] text-[#888] w-8 h-8 flex items-center justify-center transition-colors',
}: {
  links?: SocialLink[]
  className?: string
  iconClassName?: string
}) {
  if (!links || links.length === 0) return null

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {links.map((link) => {
        const Icon = ICONS[link.platform]
        if (!Icon || !link.url) return null
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
            className={iconClassName}
          >
            <Icon />
          </a>
        )
      })}
    </div>
  )
}
