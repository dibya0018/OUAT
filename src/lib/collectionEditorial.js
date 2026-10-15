import glasswareHero from '../components/images/glassware-hero.png'
import processReshaped from '../components/images/process-reshaped.png'
import goaSunset from '../components/images/goa-sunset.png'
import processReborn from '../components/images/process-reborn.png'
import processRescued from '../components/images/process-rescued.png'
import jewelleryStory from '../components/images/jewellery-story.png'
import jewelleryPendant from '../components/images/jewellery-pendant.png'
import jewelleryEarrings from '../components/images/jewellery-earrings.png'

/** @typedef {'accent'|'primary'} EditorialAccent */

/**
 * Editorial shop page content — mirrors the jewellery landing structure.
 * @type {Record<string, object>}
 */
export const COLLECTION_EDITORIAL = {
  glassware: {
    pageBg: '#f3ece0',
    bannerSlug: 'glassware',
    piecesId: 'collection-pieces',
    heroEyebrow: 'Drinking Glassware',
    hero: {
      accent: 'Once Upon a Time,',
      rest: 'I Was a Bottle',
      lede: 'Now I’m ready to raise a glass to new beginnings. Every sip celebrates thoughtful design and the beauty of upcycling.',
      primary: 'Shop Glassware',
      secondary: 'Explore All Glassware',
    },
    heroOnDark: false,
    heroPrimaryCta: { label: 'Discover the collection', href: '#collection-pieces' },
    heroSecondaryCta: { label: 'Our story', to: '/story' },
    primaryButtonClass:
      'whitespace-nowrap border-primary bg-white/40 px-8 text-primary backdrop-blur-[2px] hover:border-primary hover:bg-primary hover:text-cream',
    trust: {
      barClass: 'border-y border-primary/10 bg-[#fdfbf7]',
      iconBorder: 'border-primary/25 text-primary/90',
      items: [
        {
          icon: 'sparkle',
          title: 'Hand cut',
          text: 'Every edge ground and polished at our Goa bench.',
        },
        {
          icon: 'gift',
          title: 'Food-safe glass',
          text: 'Ready for everyday pours — no remelting, low energy.',
        },
        {
          icon: 'mail',
          title: 'Ships from Goa',
          text: 'Packed with care; 3–5 working days across India.',
        },
        {
          icon: 'sparkle',
          title: 'Second life',
          text: 'Each piece began as a bottle at a Goan table.',
        },
      ],
    },
    story: {
      eyebrow: 'From bottle to tumbler',
      title: 'Cut, ground and polished — glass with a past.',
      body: 'We rescue bottles from restaurants and celebrations, then reshape them into tumblers, carafes and glasses you will reach for daily. Nothing is remelted; the colour and character stay.',
      image: processReshaped,
      imageAlt: 'Artisan reshaping reclaimed glass at the studio',
      imagePosition: 'object-center lg:object-right',
    },
    categories: {
      eyebrow: 'Shop by piece',
      title: 'Signature styles',
      accentClass: 'text-primary',
      cardBorder: 'border-primary/15 hover:border-primary/40',
      links: [
        {
          label: 'Tumbler sets',
          slug: 'tall-tumbler-set',
          blurb: 'Tall glasses for water, juice and the occasional gin.',
          imageSrc: glasswareHero,
          imageAlt: 'Tall reclaimed glass tumblers',
        },
        {
          label: 'Carafe',
          slug: 'carafe',
          blurb: 'Pour at the table — a bottle reborn as a centrepiece.',
          imageSrc: processReshaped,
          imageAlt: 'Reclaimed glass carafe',
        },
      ],
    },
    grid: {
      eyebrow: 'New & beloved',
      title: 'Our pieces',
      accentClass: 'text-primary',
      borderClass: 'border-primary/15',
    },
    newsletter: {
      id: 'glassware-newsletter',
      eyebrow: 'Stay close',
      title: 'Receive a little of Goa,',
      titleLine2: 'new glassware first.',
    },
  },
  candles: {
    pageBg: '#f3ece0',
    bannerSlug: 'candles',
    piecesId: 'collection-pieces',
    heroEyebrow: 'Candles',
    hero: {
      accent: 'Once Upon a Time,',
      rest: 'I Was a Beer Bottle',
      lede: 'Now I glow with a new purpose, bringing warmth and ambience to your home.',
      primary: 'Shop Candles',
      secondary: 'Explore All Candles',
    },
    heroOnDark: true,
    heroPrimaryCta: { label: 'Discover the collection', href: '#collection-pieces' },
    heroSecondaryCta: { label: 'Our story', to: '/story' },
    primaryButtonClass:
      'whitespace-nowrap border-cream bg-cream/10 px-8 text-cream backdrop-blur-[2px] hover:border-cream hover:bg-cream hover:text-primary',
    secondaryButtonClass: 'justify-center text-cream/90 hover:text-cream sm:justify-start',
    trust: {
      barClass: 'border-y border-accent/15 bg-[#fdfbf7]',
      iconBorder: 'border-accent/25 text-accent/90',
      items: [
        {
          icon: 'sparkle',
          title: '100% soy wax',
          text: 'Clean burn with cotton wicks — poured by hand.',
        },
        {
          icon: 'gift',
          title: 'Keep the glass',
          text: 'When the wax is gone, the bottle stays on your shelf.',
        },
        {
          icon: 'mail',
          title: 'Ships from Goa',
          text: 'Gift-ready packaging; 3–5 working days.',
        },
        {
          icon: 'sparkle',
          title: 'Quiet scents',
          text: 'Cedar, sea salt & sage — or unscented.',
        },
      ],
    },
    story: {
      eyebrow: 'Evening ritual',
      title: 'Light poured into bottles that already hold memories.',
      body: 'Our candles are hand-poured into reclaimed glass — amber, green and clear. They glow through the same walls that once held wine and whisky, then become tumblers when the wax is finished.',
      image: processReborn,
      imageAlt: 'Finished candle in reclaimed glass on a warm surface',
      imagePosition: 'object-[55%_center] lg:object-right',
    },
    categories: {
      eyebrow: 'Shop by piece',
      title: 'Signature styles',
      accentClass: 'text-accent',
      cardBorder: 'border-accent/15 hover:border-accent/40',
      links: [
        {
          label: 'Amber soy',
          slug: 'amber-soy-candle',
          blurb: 'Warm cedar in deep amber glass.',
          imageSrc: processReborn,
          imageAlt: 'Amber soy candle in reclaimed glass',
        },
        {
          label: 'Candle trio',
          slug: 'candle-trio',
          blurb: 'Three scents, three tones — our most-gifted set.',
          imageSrc: goaSunset,
          imageAlt: 'Golden hour — mood for gifting candles',
        },
      ],
    },
    grid: {
      eyebrow: 'New & beloved',
      title: 'Our pieces',
      accentClass: 'text-accent',
      borderClass: 'border-accent/15',
    },
    newsletter: {
      id: 'candles-newsletter',
      eyebrow: 'Stay close',
      title: 'Receive a little of Goa,',
      titleLine2: 'new candles first.',
    },
  },
  'kitchen-storage': {
    pageBg: '#f3ece0',
    bannerSlug: 'kitchen-storage',
    piecesId: 'collection-pieces',
    heroEyebrow: 'Kitchenware',
    hero: {
      accent: 'Once Upon a Time,',
      rest: 'I Was a Wine Bottle',
      lede: 'Now I sprout, sip and store, bringing a little more beauty and purpose to your everyday rituals.',
      primary: 'Shop Kitchenware',
      secondary: 'Explore Sprouters, Sippers & Storage Jars',
    },
    heroOnDark: false,
    heroPrimaryCta: { label: 'Discover the collection', href: '#collection-pieces' },
    heroSecondaryCta: { label: 'B2B & gifting', to: '/gifting-b2b' },
    primaryButtonClass:
      'whitespace-nowrap border-accent bg-white/40 px-8 text-accent backdrop-blur-[2px] hover:border-accent hover:bg-accent hover:text-cream',
    trust: {
      barClass: 'border-y border-primary/10 bg-[#fdfbf7]',
      iconBorder: 'border-primary/25 text-primary/90',
      items: [
        {
          icon: 'sparkle',
          title: 'Pantry ready',
          text: 'Wide-mouth jars with snug cork lids.',
        },
        {
          icon: 'gift',
          title: 'Pour with ease',
          text: 'Oil and vinegar sets with stainless spouts.',
        },
        {
          icon: 'mail',
          title: 'Ships from Goa',
          text: 'Packed for shelves; 3–5 working days.',
        },
        {
          icon: 'sparkle',
          title: 'Shelf beautiful',
          text: 'Practical pieces that quietly elevate the kitchen.',
        },
      ],
    },
    story: {
      eyebrow: 'Rescued & reshaped',
      title: 'Bottles gathered, then made useful for daily rituals.',
      body: 'From storage jars to pourers and planters — we cut and finish rescued glass for the pantry and counter. Stack them on an open shelf and let the colour do the decorating.',
      image: processRescued,
      imageAlt: 'Rescued bottles before reshaping into kitchen vessels',
      imagePosition: 'object-[65%_center] lg:object-right',
    },
    categories: {
      eyebrow: 'Shop by piece',
      title: 'Signature styles',
      accentClass: 'text-primary',
      cardBorder: 'border-primary/15 hover:border-primary/40',
      links: [
        {
          label: 'Storage jar',
          slug: 'storage-jar-cork-lid',
          blurb: 'Cork-lidded jar for dry goods and spices.',
          imageSrc: processRescued,
          imageAlt: 'Cork-lidded storage jar',
        },
        {
          label: 'Pourer set',
          slug: 'oil-vinegar-pourer-set',
          blurb: 'Matching pourers for oil, vinegar and dressings.',
          imageSrc: processReshaped,
          imageAlt: 'Glass oil and vinegar pourers',
        },
      ],
    },
    grid: {
      eyebrow: 'New & beloved',
      title: 'Our pieces',
      accentClass: 'text-primary',
      borderClass: 'border-primary/15',
    },
    newsletter: {
      id: 'kitchen-newsletter',
      eyebrow: 'Stay close',
      title: 'Receive a little of Goa,',
      titleLine2: 'new kitchen pieces first.',
    },
  },
  jewellery: {
    pageBg: '#f3ece0',
    bannerSlug: 'jewellery',
    piecesId: 'jewellery-pieces',
    heroEyebrow: 'Jewellery',
    hero: {
      accent: 'Once Upon a Time,',
      rest: 'I Was a Bottle',
      lede: 'Now I’m a little piece of wearable art. Crafted from upcycled wine, champagne and gin bottles, each piece is transformed into a timeless treasure with its own story to tell.',
      tagline: 'Wear the Change',
      primary: 'Shop Jewellery',
      secondary: 'Explore All Jewellery',
    },
    heroOnDark: false,
    heroPrimaryCta: { label: 'Discover the collection', href: '#jewellery-pieces' },
    heroSecondaryCta: { label: 'Our story', to: '/story' },
    primaryButtonClass:
      'whitespace-nowrap border-accent bg-white/40 px-8 text-accent backdrop-blur-[2px] hover:border-accent hover:bg-accent hover:text-cream',
    trust: {
      barClass: 'border-y border-accent/10 bg-[#fdfbf7]',
      iconBorder: 'border-accent/25 text-accent/90',
      items: [
        {
          icon: 'sparkle',
          title: 'One of a kind',
          text: 'Every sea-glass fragment is unique — shaped by hand in Goa.',
        },
        {
          icon: 'gift',
          title: 'Gift-ready',
          text: 'Cotton pouch and recycled card, with a note if you wish.',
        },
        {
          icon: 'mail',
          title: 'Ships from Goa',
          text: 'Packed with care; delivery in 3–5 working days across India.',
        },
        {
          icon: 'sparkle',
          title: 'Women-led studio',
          text: 'Designed and finished by our team on the coast.',
        },
      ],
    },
    story: {
      eyebrow: 'The essence of Goa',
      title: 'Fragments from the bench, worn close to the skin.',
      body: 'Our glassware leaves beautiful offcuts. We tumble them smooth — like sea glass — and set each piece in brass by hand. No two fragments match; that is the point.',
      image: jewelleryStory,
      imageAlt: 'Woman wearing sea-glass jewellery on a Goa beach at sunset',
      imagePosition: 'object-[72%_center] lg:object-right',
    },
    categories: {
      eyebrow: 'Shop by piece',
      title: 'Signature styles',
      accentClass: 'text-accent',
      cardBorder: 'border-accent/15 hover:border-accent/40',
      links: [
        {
          label: 'Pendants',
          slug: 'sea-glass-pendant',
          blurb: 'A single tumbled fragment on a fine brass chain.',
          imageSrc: jewelleryPendant,
          imageAlt: 'Olive sea-glass pendant on a brass chain',
        },
        {
          label: 'Earrings',
          slug: 'glass-drop-earrings',
          blurb: 'Matched pairs, light on the ear, matte sea glass.',
          imageSrc: jewelleryEarrings,
          imageAlt: 'Pair of olive sea-glass drop earrings',
        },
      ],
    },
    grid: {
      eyebrow: 'New & beloved',
      title: 'Our pieces',
      accentClass: 'text-accent',
      borderClass: 'border-accent/15',
    },
    newsletter: {
      id: 'jewellery-newsletter',
      eyebrow: 'Stay close',
      title: 'Receive a little of Goa,',
      titleLine2: 'new jewellery first.',
    },
  },
}

export function getCollectionEditorial(slug) {
  return COLLECTION_EDITORIAL[slug] ?? null
}
