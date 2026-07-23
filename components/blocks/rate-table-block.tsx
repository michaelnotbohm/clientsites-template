import { createClient } from '@supabase/supabase-js'
import type { BlockProps } from './types'

// =============================================================================
// components/blocks/rate-table-block.tsx
//
// Renderer for (type: 'rate_table'). Reads the latest national-benchmark rates
// for the current tenant from the `latest_rates` view and renders a compliant
// rate table. Server component: fetches at render time so ISR delivers fully
// rendered HTML to crawlers/AI.
//
// Conforms to the platform block convention: BlockProps { content, tenant,
// variant, embedded }. Tailwind + the SAME theme CSS variables the calculator
// uses (--color-primary/secondary/foreground/background/border/surface,
// --font-heading) so the two sit consistently side by side in a two_column block.
//
// embedded=true strips the outer <section> chrome so a parent layout block owns
// padding/heading/container.
//
// Compliance: these are MARKET AVERAGES / indices, not quotes. The disclaimer
// renders unconditionally in both modes; do not remove it.
// =============================================================================

interface RateTableContent {
  heading?: string
  subheading?: string
  rate_types?: string[]
  disclaimer?: string
}

interface LatestRateRow {
  tenant_id: string
  rate_type: string
  rate: number
  wow_change: number | null
  yoy_change: number | null
  survey_date: string
  source: string
}

const RATE_TYPE_LABELS: Record<string, string> = {
  OBMMIC30YF: '30-Year Fixed (Conventional)',
  OBMMIFHA30YF: '30-Year Fixed (FHA)',
  OBMMIVA30YF: '30-Year Fixed (VA)',
  OBMMIUSDA30YF: '30-Year Fixed (USDA)',
  OBMMIJUMBO30YF: '30-Year Fixed (Jumbo)',
  MORTGAGE30US: '30-Year Fixed',
  MORTGAGE15US: '15-Year Fixed',
}

function labelFor(rateType: string): string {
  return RATE_TYPE_LABELS[rateType] ?? rateType
}

const DEFAULT_DISCLAIMER =
  'Rates shown are national benchmark averages (via the Federal Reserve Bank of St. Louis) and are for informational purposes only. They are not an offer, quote, or commitment to lend, and do not reflect any specific borrower scenario, points, fees, or APR. Contact us for a personalized rate quote.'

function formatRate(rate: number): string {
  return `${rate.toFixed(3).replace(/0$/, '')}%`
}

function formatChange(change: number | null): { text: string; cls: string } {
  if (change === null || change === 0) {
    return { text: '—', cls: 'text-[var(--color-foreground)]/50' }
  }
  const up = change > 0
  const arrow = up ? '▲' : '▼'
  // Rates rising = red (bad for borrower), falling = green.
  const cls = up ? 'text-[var(--color-primary)]' : 'text-emerald-600'
  return { text: `${arrow} ${Math.abs(change).toFixed(2)}`, cls }
}

function formatSurveyDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

async function fetchLatestRates(tenantId: string): Promise<LatestRateRow[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return []

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  })

  const { data, error } = await supabase
    .from('latest_rates')
    .select('*')
    .eq('tenant_id', tenantId)

  if (error || !data) return []
  return data as LatestRateRow[]
}

export async function RateTableBlock({ content, tenant, embedded = false }: BlockProps<RateTableContent>) {
  const c = content as RateTableContent
  const rows = await fetchLatestRates(tenant.id)

  const requested = c.rate_types ?? []
  let display: LatestRateRow[]
  if (requested.length > 0) {
    const byType = new Map(rows.map((r) => [r.rate_type, r]))
    display = requested
      .map((t) => byType.get(t))
      .filter((r): r is LatestRateRow => Boolean(r))
  } else {
    display = [...rows].sort((a, b) => a.rate_type.localeCompare(b.rate_type))
  }

  const heading = c.heading ?? "Today's Mortgage Rates"
  const subheading = c.subheading
  const disclaimer =
    c.disclaimer && c.disclaimer.trim().length > 0 ? c.disclaimer : DEFAULT_DISCLAIMER

  const surveyDate = display[0]?.survey_date ?? rows[0]?.survey_date
  const source = display[0]?.source ?? rows[0]?.source ?? 'FRED'
  const hasData = display.length > 0

  const header = (
    <div className="mx-auto max-w-2xl text-center mb-10">
      <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
        {heading}
      </h2>
      {subheading && (
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground)]/70">
          {subheading}
        </p>
      )}
    </div>
  )

  const card = (
    <>
      {hasData ? (
        <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 bg-[var(--color-secondary)] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-white md:px-7">
            <span>Loan Type</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Weekly</span>
            <span className="text-right">Yearly</span>
          </div>
          {display.map((row, i) => {
            const wow = formatChange(row.wow_change)
            const yoy = formatChange(row.yoy_change)
            return (
              <div
                key={row.rate_type}
                className={
                  'grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 px-5 py-4 md:px-7 ' +
                  (i === 0 ? '' : 'border-t border-[var(--color-border)]')
                }
              >
                <span className="font-semibold text-[var(--color-foreground)]">
                  {labelFor(row.rate_type)}
                </span>
                <span className="text-right text-xl font-bold tabular-nums text-[var(--color-primary)]">
                  {formatRate(row.rate)}
                </span>
                <span className={'text-right text-sm tabular-nums ' + wow.cls}>{wow.text}</span>
                <span className={'text-right text-sm tabular-nums ' + yoy.cls}>{yoy.text}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center text-[var(--color-foreground)]/70 shadow-lg">
          Current rates are being updated. Please check back shortly or contact us for today&rsquo;s pricing.
        </div>
      )}

      {hasData && surveyDate && (
        <p className="mt-4 text-center text-xs text-[var(--color-foreground)]/55">
          Source: {source}. As of {formatSurveyDate(surveyDate)}.
        </p>
      )}

      <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-[var(--color-foreground)]/55">
        {disclaimer}
      </p>
    </>
  )

  if (embedded) {
    return (
      <div className="w-full">
        {header}
        {card}
      </div>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        {header}
        <div className="mx-auto max-w-4xl">{card}</div>
      </div>
    </section>
  )
}
