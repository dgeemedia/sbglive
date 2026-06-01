import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#111] border-t border-[#2a2a2a] mt-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-12">
        <div>
          <h4 className="font-bebas text-lg tracking-[4px] text-white mb-4">sbglive</h4>
          <p className="text-[#888] text-sm leading-relaxed">Lagos-based streetwear pushing the limits of fashion and culture.</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {['TW','IG','TT','SC'].map(s => (
              <a key={s} href="#" className="border border-[#2a2a2a] hover:border-[#ff2d2d] hover:text-[#ff2d2d] text-[#888] px-3 py-1 text-xs tracking-[2px] transition-colors">{s}</a>
            ))}
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
        © {new Date().getFullYear()} sbglive.LIVE — ALL RIGHTS RESERVED — LAGOS, NIGERIA
      </div>
    </footer>
  )
}
