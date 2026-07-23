import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { BlockProps } from "./types"

interface ImageTextContent {
  imageSrc?: string
  imageAlt?: string
  imagePosition?: "left" | "right"
  heading?: string
  text?: string
  cta?: { label: string; href: string }
}

export function ImageTextBlock({ content: rawContent }: BlockProps<ImageTextContent>) {
  const content = rawContent as ImageTextContent
  
  if (!content.imageSrc && !content.heading) return null
  
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-8 lg:grid-cols-2 lg:gap-16 items-center ${
          content.imagePosition === "right" ? "lg:[&>*:first-child]:order-2" : ""
        }`}>
          {content.imageSrc && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={content.imageSrc}
                alt={content.imageAlt || ""}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
          
          <div className="flex flex-col">
            {content.heading && (
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {content.heading}
              </h2>
            )}
            {content.text && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {content.text}
              </p>
            )}
            {content.cta && (
              <div className="mt-6">
                <Button asChild>
                  <Link href={content.cta.href}>{content.cta.label}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
