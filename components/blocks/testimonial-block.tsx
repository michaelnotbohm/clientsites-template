import Image from 'next/image'
import { Quote } from 'lucide-react'
import type { BlockProps, TestimonialContent } from './types'

export function TestimonialBlock({ content }: BlockProps<TestimonialContent>) {
  const { quote, attribution, role, image } = content
  
  if (!quote) return null
  
  return (
    <section className="py-16 md:py-24 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="h-12 w-12 text-[var(--color-primary)]/20 mx-auto mb-6" />
          <blockquote className="text-xl md:text-2xl text-[var(--color-foreground)] mb-8 leading-relaxed italic">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            {image && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src={image} alt={attribution} fill className="object-cover" />
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-[var(--color-foreground)]">{attribution}</p>
              {role && <p className="text-sm text-[var(--color-muted)]">{role}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
