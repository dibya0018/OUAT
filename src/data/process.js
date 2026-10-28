import processRescued from '../components/images/process-rescued.webp'
import processReshaped from '../components/images/process-reshaped.webp'
import processReborn from '../components/images/process-reborn.webp'

/** The three-step "Bottle to Product" story, shared by Home and Our Story. */
export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Collected',
    text: 'Bottles are collected from restaurants, bars and homes across Goa, sorted by colour and washed.',
    image: {
      src: processRescued,
      alt: 'Three empty glass bottles standing in the sand on a Goa beach at sunset',
      tone: 'sand',
    },
  },
  {
    step: '02',
    title: 'Hand-cut',
    text: 'Each bottle is scored, cut and ground by hand. No remelting, so the glass keeps its original character.',
    image: {
      src: processReshaped,
      alt: 'Hands sanding the cut edge of a green bottle on driftwood by the sea',
      tone: 'olive',
    },
  },
  {
    step: '03',
    title: 'Finished',
    text: 'Rims are polished, candles poured, lids fitted. The bottle leaves the studio as something new.',
    image: {
      src: processReborn,
      alt: 'Olive-green tumbler and lit candle on stone at the beach at golden hour',
      tone: 'sand',
    },
  },
]
