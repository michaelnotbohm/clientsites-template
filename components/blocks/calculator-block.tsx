'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BlockProps } from './types'

interface CalculatorContent {
  heading?: string
  intro?: string
  defaultPrice?: number
  defaultDownPct?: number
  defaultRate?: number
  defaultTerm?: number
  ctaLabel?: string
  ctaHref?: string
}

function fmtCurrency(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '$0'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export function CalculatorBlock({ content, embedded = false }: BlockProps<CalculatorContent>) {
  const c = content as CalculatorContent
  const [price, setPrice] = useState(c.defaultPrice ?? 400000)
  const [downPct, setDownPct] = useState(c.defaultDownPct ?? 20)
  const [rate, setRate] = useState(c.defaultRate ?? 6.5)
  const [term, setTerm] = useState(c.defaultTerm ?? 30)
  const [taxPct, setTaxPct] = useState(1.0)
  const [insurance, setInsurance] = useState(1800)
  const [hoa, setHoa] = useState(0)

  const result = useMemo(() => {
    const down = price * (downPct / 100)
    const principal = Math.max(price - down, 0)
    const monthlyRate = rate / 100 / 12
    const n = term * 12
    let pi = 0
    if (monthlyRate > 0) {
      pi = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    } else if (n > 0) {
      pi = principal / n
    }
    const monthlyTax = (price * (taxPct / 100)) / 12
    const monthlyIns = insurance / 12
    const monthlyHoa = hoa
    const total = pi + monthlyTax + monthlyIns + monthlyHoa
    return { down, principal, pi, monthlyTax, monthlyIns, monthlyHoa, total }
  }, [price, downPct, rate, term, taxPct, insurance, hoa])

  const ctaLabel = c.ctaLabel || 'Get Your Real Rate'
  const ctaHref = c.ctaHref || '/apply'

  // The interactive card + disclaimer. Shared by both standalone and embedded
  // modes so the calculation logic and disclaimer are identical in both.
  const card = (
    <>
      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg">
        <div className="grid md:grid-cols-2">
          <div className="p-6 md:p-8 space-y-6">
            <Field label="Home Price" value={fmtCurrency(price)}>
              <input type="range" min={50000} max={2000000} step={10000} value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
            </Field>
            <Field label="Down Payment" value={`${downPct}%  (${fmtCurrency(price * downPct / 100)})`}>
              <input type="range" min={0} max={50} step={1} value={downPct}
                onChange={(e) => setDownPct(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
            </Field>
            <Field label="Interest Rate" value={`${rate.toFixed(2)}%`}>
              <input type="range" min={2} max={12} step={0.125} value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
            </Field>
            <Field label="Loan Term" value={`${term} years`}>
              <div className="flex gap-2">
                {[15, 20, 30].map((t) => (
                  <button key={t} onClick={() => setTerm(t)}
                    className={
                      'flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ' +
                      (term === t
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                        : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface)]')
                    }>
                    {t} yr
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Property Tax (annual %)" value={`${taxPct.toFixed(2)}%`}>
              <input type="range" min={0} max={3} step={0.05} value={taxPct}
                onChange={(e) => setTaxPct(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
            </Field>
            <Field label="Home Insurance (annual)" value={fmtCurrency(insurance)}>
              <input type="range" min={0} max={6000} step={100} value={insurance}
                onChange={(e) => setInsurance(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
            </Field>
            <Field label="HOA (monthly)" value={fmtCurrency(hoa)}>
              <input type="range" min={0} max={1000} step={25} value={hoa}
                onChange={(e) => setHoa(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
            </Field>
          </div>

          <div className="flex flex-col justify-center bg-[var(--color-secondary)] p-6 md:p-8 text-white">
            <div className="text-sm font-medium text-white/70">Estimated Monthly Payment</div>
            <div className="mt-1 font-[var(--font-heading)] text-5xl font-bold text-white">
              {fmtCurrency(result.total)}
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <Row label="Principal & Interest" value={fmtCurrency(result.pi)} />
              <Row label="Property Tax" value={fmtCurrency(result.monthlyTax)} />
              <Row label="Home Insurance" value={fmtCurrency(result.monthlyIns)} />
              {result.monthlyHoa > 0 && <Row label="HOA" value={fmtCurrency(result.monthlyHoa)} />}
              <div className="h-px bg-white/15 my-2" />
              <Row label="Loan Amount" value={fmtCurrency(result.principal)} />
              <Row label="Down Payment" value={fmtCurrency(result.down)} />
            </div>
            <Button asChild size="lg"
              className="mt-7 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90">
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-[var(--color-foreground)]/55">
        This is an estimate for planning purposes only — not a rate quote, loan offer, or commitment to lend.
        Your actual rate and payment depend on your full application. Contact us for a personalized quote.
      </p>
    </>
  )

  const header = (c.heading || c.intro) ? (
    <div className={'mx-auto max-w-2xl text-center mb-10' + (embedded ? '' : '')}>
      <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] text-[var(--color-secondary)]">
        {c.heading || 'Mortgage Payment Calculator'}
      </h2>
      {c.intro && (
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground)]/70">
          {c.intro}
        </p>
      )}
    </div>
  ) : null

  // Embedded: no outer <section>, no section padding/background, no max-w-4xl
  // centering — the parent layout block owns all of that. Heading still renders
  // (the parent can omit it via content if desired).
  if (embedded) {
    return (
      <div className="w-full">
        {header}
        {card}
      </div>
    )
  }

  // Standalone (original behavior, unchanged).
  return (
    <section className="py-16 md:py-24 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        {header}
        <div className="mx-auto max-w-4xl">
          {card}
        </div>
      </div>
    </section>
  )
}

function Field({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-[var(--color-foreground)]">{label}</label>
        <span className="text-sm font-bold text-[var(--color-primary)]">{value}</span>
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}
