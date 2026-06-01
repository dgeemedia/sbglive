import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="font-bebas text-[120px] leading-none text-[#1a1a1a]">404</h1>
        <p className="font-bebas text-2xl tracking-[6px] text-white mb-4">PAGE NOT FOUND</p>
        <Link href="/" className="inline-block bg-[#ff2d2d] text-white px-8 py-3 font-bebas text-lg tracking-[4px] hover:bg-red-700 transition-colors">GO HOME</Link>
      </div>
    </div>
  )
}
