import GlasswareEditorialLayout from './collection/GlasswareEditorialLayout'
import CandlesEditorialLayout from './collection/CandlesEditorialLayout'
import KitchenEditorialLayout from './collection/KitchenEditorialLayout'
import JewelleryEditorialLayout from './collection/JewelleryEditorialLayout'

const LAYOUT_BY_SLUG = {
  glassware: GlasswareEditorialLayout,
  candles: CandlesEditorialLayout,
  'kitchen-storage': KitchenEditorialLayout,
  jewellery: JewelleryEditorialLayout,
}

/** Routes each collection to its own page structure (shared components, different order & sections). */
export default function EditorialCollectionLayout(props) {
  const Layout = LAYOUT_BY_SLUG[props.collectionSlug] ?? JewelleryEditorialLayout
  return <Layout {...props} />
}
