// src/components/shop/HeroLabelMarquee.tsx
// The hero label line ("SBGFASHION · LAGOS • ALL PRODUCTS") as a continuously scrolling
// marquee. The words still come from Sanity (heroTitle / heroHighlight / heroSubtitle),
// so the client can edit them in Studio. Pure CSS animation — no client JS needed.

// Labels per copy. One copy needs to be wider than the widest screen (a label is ~600px,
// so 4 ≈ 2600px); the track renders two identical copies and slides left by exactly one.
const LABELS_PER_COPY = 4

export default function HeroLabelMarquee({
  title,
  highlight,
  subtitle,
}: {
  title: string
  highlight: string
  subtitle: string
}) {
  return (
    <div className="label-marquee-mask relative z-10">
      <div className="label-marquee-track">
        {[0, 1].map(copy => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-8 pr-8"
            aria-hidden={copy === 1 ? true : undefined}
            data-dup={copy === 1 ? '' : undefined}
          >
            {Array.from({ length: LABELS_PER_COPY }, (_, i) => {
              const dup = copy === 1 || i > 0 // only the very first label is read by screen readers
              // The first label is the page's <h1> (the homepage had none); the scrolling repeats are plain text
              const Label = dup ? 'p' : 'h1'
              return (
                <div key={i} className="flex shrink-0 items-center gap-8" data-dup={i > 0 ? '' : undefined} aria-hidden={dup ? true : undefined}>
                  <Label className="font-bebas text-sm tracking-[8px] text-[#888] whitespace-nowrap font-normal">
                    {title}
                    <span className="text-[#ff2d2d]">{highlight}</span> · {subtitle}
                  </Label>
                  <span className="h-px w-8 bg-[#2a2a2a]" />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
