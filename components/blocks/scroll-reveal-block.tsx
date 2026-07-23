'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BlockProps, ScrollRevealContent } from './types'
import { cn } from '@/lib/utils'

export function ScrollRevealBlock({ content }: BlockProps<ScrollRevealContent>) {
  const { heading, body, image, imageAlt, imagePosition = 'right', cta } = content
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
      { threshold: 0.2 }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  const isLeft = imagePosition === 'left'
  
  return (
    <section ref={ref} className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className={cn(
          "grid lg:grid-cols-2 gap-12 items-center",
          isLeft && "lg:flex-row-reverse"
        )}>
          {/* Text content */}
          <div 
            className={cn(
              "transition-all duration-700",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0",
              isLeft ? (isVisible ? "" : "translate-x-8") : (isVisible ? "" : "-translate-x-8"),
              isLeft && "lg:order-2"
            )}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-[var(--font-heading)] text-[var(--color-foreground)]">
              {heading}
            </h2>
            <p className="text-lg text-[var(--color-muted)] mb-8 leading-relaxed">
              {body}
            </p>
            {cta && (
              <Button
                asChild
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
              >
                <Link href={cta.href}>
                  {cta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          
          {/* Image */}
          {image && (
            <div 
              className={cn(
                "relative aspect-[4/3] rounded-lg overflow-hidden transition-all duration-700 delay-200",
                isVisible ? "opacity-100 translate-x-0" : "opacity-0",
                isLeft ? (isVisible ? "" : "-translate-x-8") : (isVisible ? "" : "translate-x-8"),
                isLeft && "lg:order-1"
              )}
            >
              <Image
                src={image}
                alt={imageAlt || heading}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
