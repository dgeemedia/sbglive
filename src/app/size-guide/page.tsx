// src/app/size-guide/page.tsx
const APPAREL_SIZES = [
  { size: 'XS', chest: '86–91', length: '66' },
  { size: 'S', chest: '92–97', length: '68' },
  { size: 'M', chest: '98–103', length: '70' },
  { size: 'L', chest: '104–109', length: '72' },
  { size: 'XL', chest: '110–115', length: '74' },
  { size: '2XL', chest: '116–121', length: '76' },
  { size: '3XL', chest: '122–127', length: '78' },
]

const WAIST_SIZES = [
  { size: 'W30', waist: '76' },
  { size: 'W32', waist: '81' },
  { size: 'W34', waist: '86' },
  { size: 'W36', waist: '91' },
]

export default function SizeGuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">SIZE GUIDE</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">FIND YOUR FIT — MEASUREMENTS IN CM</p>

      <div className="mb-10">
        <h2 className="font-bebas text-lg tracking-[3px] text-white mb-3">TOPS &amp; JACKETS</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-[#888] text-xs tracking-[2px]">
              <th className="text-left py-2">SIZE</th>
              <th className="text-left py-2">CHEST (CM)</th>
              <th className="text-left py-2">LENGTH (CM)</th>
            </tr>
          </thead>
          <tbody>
            {APPAREL_SIZES.map(row => (
              <tr key={row.size} className="border-b border-[#1a1a1a] text-[#ccc]">
                <td className="py-2 font-bebas tracking-[2px] text-white">{row.size}</td>
                <td className="py-2">{row.chest}</td>
                <td className="py-2">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-10">
        <h2 className="font-bebas text-lg tracking-[3px] text-white mb-3">BOTTOMS</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-[#888] text-xs tracking-[2px]">
              <th className="text-left py-2">SIZE</th>
              <th className="text-left py-2">WAIST (CM)</th>
            </tr>
          </thead>
          <tbody>
            {WAIST_SIZES.map(row => (
              <tr key={row.size} className="border-b border-[#1a1a1a] text-[#ccc]">
                <td className="py-2 font-bebas tracking-[2px] text-white">{row.size}</td>
                <td className="py-2">{row.waist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 text-[#888] text-sm leading-relaxed border-t border-[#2a2a2a] pt-6">
        <p><strong className="text-white">HOW TO MEASURE CHEST:</strong> Measure around the fullest part of your chest, keeping the tape level under your arms.</p>
        <p><strong className="text-white">HOW TO MEASURE WAIST:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</p>
        <p>Between sizes? We recommend sizing up for a relaxed, streetwear fit.</p>
      </div>

      <p className="text-[#555] text-xs tracking-[1px] mt-10">
        Still unsure? <a href="/contact" className="text-[#c8a96e] hover:underline">Message us</a> with your measurements and we'll help you pick.
      </p>
    </div>
  )
}
