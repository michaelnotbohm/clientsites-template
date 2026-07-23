import Image from 'next/image'
import type { BlockProps, ImageContent } from './types'

export function ImageBlock({ content }: BlockProps<ImageContent>) {
  const { src, alt, caption } = content
  
  if (!src) return null
  
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <figure className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
            />
          </div>
          {caption && (
            <figcaption className="text-center text-sm text-[var(--color-muted)] mt-4">
              {caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  )
}
