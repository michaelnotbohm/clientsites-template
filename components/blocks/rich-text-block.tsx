import ReactMarkdown from 'react-markdown'
import type { BlockProps, RichTextContent } from './types'

export function RichTextBlock({ content }: BlockProps<RichTextContent>) {
  const { markdown } = content

  if (!markdown) return null

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mb-8 text-center font-[var(--font-heading)] text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-secondary)]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-4 mt-10 font-[var(--font-heading)] text-2xl font-semibold tracking-tight text-[var(--color-secondary)]">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-6 text-lg leading-[1.8] text-[var(--color-foreground)]/85">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-[var(--color-foreground)]">
                  {children}
                </strong>
              ),
              a: ({ children, href }) => (
                <a href={href} className="font-medium text-[var(--color-primary)] underline underline-offset-2">
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="mb-6 list-disc space-y-2 pl-6 text-lg leading-[1.8] text-[var(--color-foreground)]/85">
                  {children}
                </ul>
              ),
              li: ({ children }) => <li>{children}</li>,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  )
}
