import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CTABand } from '@/components/layout/cta-band'
import { FaqAccordion } from '@/components/faq-accordion'
import type { LoanProduct } from '@/lib/data/loan-products'
import { cn } from '@/lib/utils'

interface LoanProductLayoutProps {
  product: LoanProduct
}

export function LoanProductLayout({ product }: LoanProductLayoutProps) {
  const Icon = product.icon

  return (
    <>
      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/loan-options"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            All Loan Options
          </Link>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                <Icon className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                {product.title}
              </h1>
              <p className="mt-4 text-xl text-primary font-medium">
                {product.tagline}
              </p>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {product.overview}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="rounded-full px-8" asChild>
                  <Link href="/apply">Apply Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                  <Link href="/connect">Talk to an Expert</Link>
                </Button>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="rounded-2xl border border-border bg-muted/30 p-8">
              <h2 className="text-xl font-semibold text-foreground">
                Key Benefits
              </h2>
              <ul className="mt-6 space-y-4">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Is This Loan Right for You?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {product.whoFor}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqAccordion
        faqs={product.faqs}
        heading={`${product.title} FAQ`}
        subheading="Common questions about this loan type"
      />

      {/* CTA */}
      <CTABand
        heading={`Ready to explore ${product.title}?`}
        subheading="Get pre-approved in as little as 24 hours. Our loan officers are standing by."
      />
    </>
  )
}
