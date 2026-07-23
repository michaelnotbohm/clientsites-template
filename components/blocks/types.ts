import type { Tenant } from '@/lib/tenant'
// Block content types
export interface HeroContent {
  headline: string
  subhead?: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  image?: string
  imageAlt?: string
  videoUrl?: string
  iframeUrl?: string
  poster?: string
  size?: 'full' | 'medium' | 'compact'
}
export interface PathCard {
  label: string
  description?: string
  href: string
  image?: string
}
export interface PathCardsContent {
  cards: PathCard[]
}
export interface Stat {
  value: string
  label: string
}
export interface StatStripContent {
  stats: Stat[]
}
export interface RichTextContent {
  markdown: string
}
export interface FeatureItem {
  icon?: string
  title: string
  body: string
  href?: string
}
export interface FeatureGridContent {
  heading?: string
  subheading?: string
  items: FeatureItem[]
}
export interface TestimonialContent {
  quote: string
  attribution: string
  role?: string
  image?: string
}
export interface FaqItem {
  q: string
  a: string
}
export interface FaqContent {
  heading?: string
  items: FaqItem[]
}
export interface LeadFormContent {
  heading?: string
  subheading?: string
  sourceKey: string
  subjectTypes?: string[]
  showMessage?: boolean
}
export interface CtaBandContent {
  headline: string
  subhead?: string
  cta: { label: string; href: string }
}
export interface TeamGridContent {
  heading?: string
  subheading?: string
}
export interface ImageContent {
  src: string
  alt: string
  caption?: string
}
export interface ScrollRevealContent {
  heading: string
  body: string
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  cta?: { label: string; href: string }
}
// A child block embedded inside a layout block (e.g. two_column).
// type/variant map through the same registry; content is that child's content.
export interface ChildBlock {
  type: string
  variant?: string
  content: Record<string, unknown>
}
// Layout block that renders two child blocks side by side. Each child is
// rendered in "embedded" mode (no outer section chrome) so this block owns the
// padding, heading, container, and the two-column grid.
export interface TwoColumnContent {
  heading?: string
  subheading?: string
  left: ChildBlock
  right: ChildBlock
  // Column width ratio on desktop. Defaults to '1:1'.
  ratio?: '1:1' | '5:7' | '7:5' | '4:6' | '6:4'
  // Vertical alignment of the two columns. Defaults to 'stretch'.
  align?: 'start' | 'center' | 'stretch'
}
// Section type from database
export interface Section {
  id: string
  page_id: string
  type: string
  variant: string
  content: Record<string, unknown>
  sort_order: number
}
// Props passed to block components
export interface BlockProps<T = Record<string, unknown>> {
  content: T
  tenant: Tenant
  variant?: string
  // When true, the block renders WITHOUT its outer <section> chrome (no section
  // padding, background, centered heading, or container) so a parent layout
  // block such as two_column can compose it inside a column. Defaults to false.
  embedded?: boolean
}
// Block component type
export type BlockComponent<T = Record<string, unknown>> = React.ComponentType<BlockProps<T>>
