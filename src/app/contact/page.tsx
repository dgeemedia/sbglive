export default function ContactPage() {
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
      <div className="mt-12 space-y-3 border-t border-[#2a2a2a] pt-8">
        <p className="text-xs tracking-[3px] text-[#555]">EMAIL — <span className="text-[#888]">hello@sbglive.live</span></p>
        <p className="text-xs tracking-[3px] text-[#555]">INSTAGRAM — <span className="text-[#888]">@sbglive.live</span></p>
        <p className="text-xs tracking-[3px] text-[#555]">LOCATION — <span className="text-[#888]">Lagos, Nigeria</span></p>
      </div>
    </div>
  )
}
