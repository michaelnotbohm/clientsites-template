'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { stats as defaultStats, type Stat } from '@/lib/data/stats'

interface StatStripProps {
  stats?: Stat[]
  className?: string
}

export function StatStrip({ stats = defaultStats, className }: StatStripProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.3,
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={cn('bg-muted py-12 lg:py-16', className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'flex flex-col items-center text-center transition-all duration-700',
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              )}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                {isVisible ? (
                  <CountUp value={stat.value} suffix={stat.suffix} />
                ) : (
                  <span className="opacity-0">{stat.value}</span>
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CountUp({ value, suffix }: { value: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState('0')
  const numericValue = parseFloat(value.replace(/,/g, ''))
  const hasDecimal = value.includes('.')
  const hasComma = value.includes(',')

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = numericValue * easeOut

      let formatted: string
      if (hasDecimal) {
        formatted = currentValue.toFixed(1)
      } else if (hasComma) {
        formatted = Math.round(currentValue).toLocaleString()
      } else {
        formatted = Math.round(currentValue).toString()
      }

      setDisplayValue(formatted)

      if (currentStep >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, numericValue, hasDecimal, hasComma])

  return (
    <>
      {displayValue}
      {suffix && <span className="text-primary">{suffix}</span>}
    </>
  )
}
