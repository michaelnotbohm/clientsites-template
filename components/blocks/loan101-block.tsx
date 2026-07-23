'use client'

import { useState } from 'react'
import {
  Home, DollarSign, Shield, FileText, Users, TrendingUp,
  Building, Key, Briefcase, Heart, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlockProps } from './types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home, dollar: DollarSign, shield: Shield, file: FileText,
  users: Users, trending: TrendingUp, building: Building, key: Key,
  briefcase: Briefcase, heart: Heart,
}

interface BenefitItem {
  icon?: string
  title: string
  body: string
}

interface Loan101Content {
  heading?: string
  whoForTitle?: string
  whoForBody?: string
  benefits?: BenefitItem[]
  eligibility?: string[]
}

const TABS = [
  { num: '01', key: 'who', label: "Who It's For" },
  { num: '02', key: 'benefits', label: 'Benefits' },
  { num: '03', key: 'eligibility', label: 'Eligibility' },
] as const

export function Loan101Block({ content: rawContent }: BlockProps<Loan101Content>) {
  const content = rawContent as Loan101Content
  const [active, setActive] = useState<string>('who')

  const { heading, whoForTitle, whoForBody, benefits = [], eligibility = [] } = content

  return (
    <section className="py-16 md:py-24 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center text-[var(--color-secondary)] mb-10 font-[var(--font-heading)]">
              {heading}
            </h2>
          )}

          <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
            {/* Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-[var(--color-border)]">
              {TABS.map((tab) => {
                const isActive = active === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActive(tab.key)}
                    className={cn(
                      'flex items-center gap-3 px-6 py-5 text-left transition-colors border-b sm:border-b-0 sm:border-r last:border-r-0 border-[var(--color-border)]',
                      isActive
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-surface)]'
                    )}
                  >
                    <span
                      className={cn(
                        'text-2xl font-bold font-[var(--font-heading)]',
                        isActive ? 'text-white/80' : 'text-[var(--color-primary)]'
                      )}
                    >
                      {tab.num}
                    </span>
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Panels */}
            <div className="p-6 md:p-10">
              {active === 'who' && (
                <div>
                  {whoForTitle && (
                    <h3 className="text-xl md:text-2xl font-bold text-[var(--color-secondary)] mb-4 font-[var(--font-heading)]">
                      {whoForTitle}
                    </h3>
                  )}
                  {whoForBody && (
                    <p className="text-lg leading-[1.8] text-[var(--color-foreground)]/80">
                      {whoForBody}
                    </p>
                  )}
                </div>
              )}

              {active === 'benefits' && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {benefits.map((b, i) => {
                    const Icon = b.icon ? iconMap[b.icon] : null
                    return (
                      <div key={i} className="flex gap-4">
                        {Icon && (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                            <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-[var(--color-foreground)] mb-1">{b.title}</h4>
                          <p className="text-[var(--color-foreground)]/75 leading-relaxed text-sm">{b.body}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {active === 'eligibility' && (
                <ul className="space-y-3">
                  {eligibility.map((item, i) => (
                    <li key={i} className="flex gap-3 text-lg text-[var(--color-foreground)]/80">
                      <Check className="h-5 w-5 shrink-0 text-[var(--color-primary)] mt-1" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
