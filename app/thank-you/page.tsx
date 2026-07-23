import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Thank you for reaching out to Bay to Bay Lending. A member of our team will be in touch with you shortly.',
  robots: { index: false, follow: false },
}

const steps = [
  {
    title: 'We review your request',
    body: 'A licensed loan officer on our team personally looks over what you sent — no call center, no runaround.',
  },
  {
    title: 'We reach out — usually same day',
    body: 'Expect a friendly call, text, or email shortly. We will introduce ourselves and learn what you are hoping to accomplish.',
  },
  {
    title: 'We map out your next step',
    body: 'Whether it is a pre-approval, a rate conversation, or simply answering questions, we meet you exactly where you are.',
  },
]

export default function ThankYouPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-secondary)] px-4 py-20">
      {/* Layered brand background: gradient, radial teal glow, faint grid, red top rule */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, var(--color-secondary) 0%, color-mix(in srgb, var(--color-secondary) 80%, black) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--color-primary) 40%, transparent) 0%, transparent 55%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="absolute left-0 top-0 h-1 w-full bg-[#C8102E]" />

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* Animated confirmation mark */}
        <div className="ty-pop mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-2xl shadow-black/30">
          <svg
            className="h-10 w-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="ty-check" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="ty-rise ty-d1 font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          Thank you — we&apos;ve got it from here.
        </h1>

        <p className="ty-rise ty-d2 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
          Your request is in, and a member of the Bay to Bay Lending team will be reaching out
          to you shortly. Real people, real answers — that is the promise, and it starts now.
        </p>

        {/* Steps */}
        <div className="ty-rise ty-d3 mt-12 grid gap-4 text-left sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] font-[var(--font-heading)] text-sm font-bold text-[var(--color-secondary)]">
                {i + 1}
              </div>
              <h2 className="font-[var(--font-heading)] text-base font-semibold text-white">
                {step.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{step.body}</p>
            </div>
          ))}
        </div>

        {/* Reassurance + CTA */}
        <div className="ty-rise ty-d4 mt-12">
          <p className="text-sm text-white/60">
            In the meantime, feel free to keep exploring.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary)]/90"
            >
              Back to Home
            </Link>
            <Link
              href="/loan-originators"
              className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Meet Our Team
            </Link>
          </div>
        </div>

        {/* Logo lockup */}
        <div className="ty-rise ty-d5 mt-14 flex items-center justify-center gap-3 opacity-80">
          <Image
            src="https://toivhpeabwwqilbzbrfb.supabase.co/storage/v1/object/public/Website%20Photos/bridge.png"
            alt=""
            width={80}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-[var(--font-heading)] text-sm font-semibold tracking-wide text-white/70">
            Bay to Bay Lending
          </span>
        </div>
      </div>
    </main>
  )
}
