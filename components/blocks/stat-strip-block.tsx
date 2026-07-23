'use client'
import { useEffect, useRef, useState } from 'react'
import type { BlockProps, StatStripContent } from './types'
export function StatStripBlock({ content }: BlockProps<StatStripContent>) {
  const { stats } = content

  if (!stats || stats.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-[var(--color-secondary)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-8">
          {stats.map((stat, index) => (
            <StatItem key={index} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  )
}
function StatItem({ value, label }: { value: string; label: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="min-w-0 text-center">
      <div
        className={
          'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 font-[var(--font-heading)] leading-tight break-words transition-all duration-700 ' +
          (isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')
        }
      >
        {value}
      </div>
      <div className="text-white/70 text-xs sm:text-sm uppercase tracking-wide">
        {label}
      </div>
    </div>
  )
}
