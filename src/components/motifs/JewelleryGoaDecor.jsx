import { FloralBloom, FloralVine } from './Florals'

/** Floral corners and blooms on jewellery pages. Decorative only. */
export default function JewelleryGoaDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <FloralVine
        size={220}
        className="absolute -top-4 -left-6 opacity-90 md:-left-2 md:opacity-100"
      />
      <FloralVine
        size={200}
        flip
        className="absolute -top-2 -right-8 opacity-85 md:-right-2"
      />
      <FloralBloom
        size={100}
        className="absolute top-[38%] -right-2 hidden opacity-80 md:block"
      />
      <FloralBloom
        size={88}
        tone="sage"
        className="absolute bottom-[18%] -left-3 opacity-75 md:left-2"
      />
      <FloralBloom
        size={72}
        className="absolute right-[12%] bottom-8 opacity-70 md:bottom-12"
      />
    </div>
  )
}
