import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { FAQ } from '@/lib/data/faqs'

interface FaqAccordionProps {
  faqs: FAQ[]
  heading?: string
  subheading?: string
  className?: string
}

export function FaqAccordion({
  faqs,
  heading = 'Frequently Asked Questions',
  subheading,
  className,
}: FaqAccordionProps) {
  return (
    <section className={cn('py-16 lg:py-24', className)}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {heading}
          </h2>
          {subheading && (
            <p className="mt-4 text-lg text-muted-foreground">
              {subheading}
            </p>
          )}
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
