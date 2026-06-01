'use client'

import { useEffect, useState } from 'react'

export default function StudioPage() {
  const [Studio, setStudio] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    Promise.all([
      import('next-sanity/studio'),
      import('../../../../sanity.config'),
    ]).then(([{ NextStudio }, { default: config }]) => {
      setStudio(() => () => <NextStudio config={config} />)
    })
  }, [])

  if (!Studio) {
    return (
      <div style={{ background: '#101010', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'monospace', letterSpacing: '3px' }}>
        LOADING STUDIO...
      </div>
    )
  }

  return <Studio />
}