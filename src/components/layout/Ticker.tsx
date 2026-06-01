export default function Ticker() {
  const msg = 'NEW DROP AVAILABLE • FREE DELIVERY IN LAGOS • HOLY FURY NOW LIVE • LIMITED EDITIONS • '
  const repeated = msg.repeat(6)
  return (
    <div className="bg-[#ff2d2d] overflow-hidden whitespace-nowrap py-2">
      <div className="ticker-inner inline-flex">
        <span className="font-bebas text-white text-sm tracking-[3px] px-4">{repeated}</span>
        <span className="font-bebas text-white text-sm tracking-[3px] px-4">{repeated}</span>
      </div>
    </div>
  )
}
