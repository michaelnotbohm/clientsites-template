'use client'

import { useEffect, useRef, useState } from 'react'
import { Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/lib/data/testimonials'

interface TestimonialBlockProps {
  testimonial: Testimonial
  className?: string
}

export function TestimonialBlock({ testimonial, className }: TestimonialBlockProps) {
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
        threshold: 0.2,
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
      className={cn('py-16 lg:py-24', className)}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'flex flex-col items-center text-center transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <Quote className="h-12 w-12 text-primary/30" />
          <blockquote className="mt-8">
            <p className="text-xl font-medium text-foreground leading-relaxed md:text-2xl lg:text-3xl text-balance">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
          </blockquote>
          <div className="mt-8">
            <p className="font-semibold text-foreground">
              {testimonial.author}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {testimonial.location}
              {testimonial.loanType && ` • ${testimonial.loanType}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
