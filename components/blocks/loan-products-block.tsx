import { LoanProductCard } from "@/components/loan-product-card"
import type { BlockProps } from "./types"

interface LoanProduct {
  slug: string
  name: string
  shortDescription: string
  icon: string
}

interface LoanProductsContent {
  heading?: string
  subheading?: string
  products?: LoanProduct[]
}

export function LoanProductsBlock({ content: rawContent }: BlockProps<LoanProductsContent>) {
  const content = rawContent as LoanProductsContent
  const products = content.products || []
  
  if (products.length === 0) return null
  
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.heading && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{content.heading}</h2>
            {content.subheading && (
              <p className="mt-4 text-lg text-muted-foreground">{content.subheading}</p>
            )}
          </div>
        )}
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <LoanProductCard
              key={product.slug}
              name={product.name}
              shortDescription={product.shortDescription}
              href={`/loan-options/${product.slug}`}
              icon={product.icon}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
