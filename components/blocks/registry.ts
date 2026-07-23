import dynamic from 'next/dynamic'
import type { BlockProps } from './types'

// =============================================================================
// components/blocks/registry.ts
//
// Single source of truth mapping section `type` -> block component. Both the
// top-level BlockRenderer and layout blocks (e.g. two_column) resolve children
// through this one registry, so there is never a second, drifting copy.
//
// - getBlockComponent(type):      used by BlockRenderer for top-level sections.
// - getEmbeddableComponent(type): used by layout blocks to render a child in
//                                 embedded mode. Same map; named separately so
//                                 we can later restrict which blocks may nest.
//
// All components are dynamically imported (code-split). Adding a new block type
// = add its import + one registry entry here. Nothing else changes.
// =============================================================================

const HeroBlock = dynamic(() => import('./hero-block').then(m => m.HeroBlock))
const PathCardsBlock = dynamic(() => import('./path-cards-block').then(m => m.PathCardsBlock))
const StatStripBlock = dynamic(() => import('./stat-strip-block').then(m => m.StatStripBlock))
const RichTextBlock = dynamic(() => import('./rich-text-block').then(m => m.RichTextBlock))
const FeatureGridBlock = dynamic(() => import('./feature-grid-block').then(m => m.FeatureGridBlock))
const FaqBlock = dynamic(() => import('./faq-block').then(m => m.FaqBlock))
const LeadFormBlock = dynamic(() => import('./lead-form-block').then(m => m.LeadFormBlock))
const CtaBandBlock = dynamic(() => import('./cta-band-block').then(m => m.CtaBandBlock))
const TeamGridBlock = dynamic(() => import('./team-grid-block').then(m => m.TeamGridBlock))
const ImageBlock = dynamic(() => import('./image-block').then(m => m.ImageBlock))
const ScrollRevealBlock = dynamic(() => import('./scroll-reveal-block').then(m => m.ScrollRevealBlock))
const StatsBlock = dynamic(() => import('./stats-block').then(m => m.StatsBlock))
const TestimonialsBlock = dynamic(() => import('./testimonials-block').then(m => m.TestimonialsBlock))
const QuickFactsBlock = dynamic(() => import('./quick-facts-block').then(m => m.QuickFactsBlock))
const ProcessTimelineBlock = dynamic(() => import('./process-timeline-block').then(m => m.ProcessTimelineBlock))
const CalculatorBlock = dynamic(() => import('./calculator-block').then(m => m.CalculatorBlock))
const ClarkyFormBlock = dynamic(() => import('./clarky-form-block').then(m => m.ClarkyFormBlock))
const RateTableBlock = dynamic(() => import('./rate-table-block').then(m => m.RateTableBlock))
const TwoColumnBlock = dynamic(() => import('./two-column-block').then(m => m.TwoColumnBlock))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBlockComponent = React.ComponentType<BlockProps<any>>

// Registry mapping type -> component.
const registry: Record<string, AnyBlockComponent> = {
  hero: HeroBlock as AnyBlockComponent,
  path_cards: PathCardsBlock as AnyBlockComponent,
  stat_strip: StatStripBlock as AnyBlockComponent,
  stats: StatsBlock as AnyBlockComponent,
  rich_text: RichTextBlock as AnyBlockComponent,
  feature_grid: FeatureGridBlock as AnyBlockComponent,
  testimonial: TestimonialsBlock as AnyBlockComponent,
  testimonials: TestimonialsBlock as AnyBlockComponent,
  faq: FaqBlock as AnyBlockComponent,
  lead_form: LeadFormBlock as AnyBlockComponent,
  cta_band: CtaBandBlock as AnyBlockComponent,
  team_grid: TeamGridBlock as AnyBlockComponent,
  image: ImageBlock as AnyBlockComponent,
  scroll_reveal: ScrollRevealBlock as AnyBlockComponent,
  quick_facts: QuickFactsBlock as AnyBlockComponent,
  process_timeline: ProcessTimelineBlock as AnyBlockComponent,
  calculator: CalculatorBlock as AnyBlockComponent,
  clarky_form: ClarkyFormBlock as AnyBlockComponent,
  rate_table: RateTableBlock as AnyBlockComponent,
  two_column: TwoColumnBlock as AnyBlockComponent,
}

/**
 * Resolve a top-level section type to its block component.
 * Returns null for unknown types so the renderer can skip silently.
 */
export function getBlockComponent(type: string): AnyBlockComponent | null {
  return registry[type] || null
}

/**
 * Resolve a child block type for embedding inside a layout block.
 * Currently the same map as top-level; kept separate so nesting rules can be
 * tightened later without touching call sites.
 */
export function getEmbeddableComponent(type: string): AnyBlockComponent | null {
  return registry[type] || null
}
