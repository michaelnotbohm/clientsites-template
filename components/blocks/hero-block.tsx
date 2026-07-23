import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BlockProps, HeroContent } from './types'
import { cn } from '@/lib/utils'

export function HeroBlock({ content, variant = 'centered' }: BlockProps<HeroContent>) {
  const {
    headline,
    subhead,
    primaryCta,
    secondaryCta,
    image,
    imageAlt,
    videoUrl,
    iframeUrl,
    poster,
    size = 'full',
  } = content

  const isSplitImage = variant === 'split-image'
  const isFullBleed = variant === 'full-bleed'
  const isMinimal = variant === 'minimal'
  const isVideo = variant === 'video-fullbleed'
  const isVideo169 = variant === 'video-16x9'
  const isVideoContained = variant === 'video-contained'
  const isSolid = variant === 'solid'

  const heightClass =
    size === 'compact'
      ? 'min-h-[40vh]'
      : size === 'medium'
        ? 'min-h-[55vh]'
        : 'min-h-[88vh]'

  if (isVideoContained) {
    return (
      <section className="bg-[var(--color-secondary)] px-3 py-3 md:px-4 md:py-4">
        <div className="relative mx-auto max-h-[72vh] aspect-[16/10] w-full overflow-hidden rounded-3xl shadow-2xl md:aspect-[16/9]">
          {videoUrl ? (
            <video
              className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={poster || image || undefined}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : iframeUrl ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-video w-full min-w-[177.78vh] min-h-full">
              <iframe
                src={iframeUrl}
                loading="lazy"
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : null}

          {(poster || image) && (
            <Image
              src={poster || image || ''}
              alt={imageAlt || ''}
              fill
              priority
              className={cn('object-cover', videoUrl ? 'hidden motion-reduce:block' : 'block')}
            />
          )}

          <div className="absolute inset-0 bg-black/40" />

          {/* Headline pinned near the top — clears the logo animation below it */}
          <div className="absolute inset-x-0 top-[6%] hidden px-6 text-center text-white md:block">
            <h1 className="mx-auto max-w-3xl font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
              {headline}
            </h1>
          </div>

          {/* Subhead + CTAs anchored to the bottom */}
          {(subhead || primaryCta || secondaryCta) && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-8 text-center md:pb-12">
              <div className="mx-auto max-w-3xl px-6 text-white">
                {subhead && (
                  <p className="mx-auto hidden max-w-xl text-lg leading-relaxed text-white/90 drop-shadow md:block md:text-xl">
                    {subhead}
                  </p>
                )}
                {(primaryCta || secondaryCta) && (
                  <div className="mt-6 flex flex-wrap justify-center gap-4">
                    {primaryCta && (
                      <Button
                        asChild
                        size="lg"
                        className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                      >
                        <Link href={primaryCta.href}>
                          {primaryCta.label}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {secondaryCta && (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="bg-transparent border border-white/60 text-white hover:bg-white/10 hover:text-white"
                      >
                        <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  if (isSolid) {
    return (
      <section className="relative overflow-hidden bg-[var(--color-secondary)]">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background:
              'linear-gradient(135deg, var(--color-secondary) 0%, color-mix(in srgb, var(--color-secondary) 80%, black) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 85% 15%, color-mix(in srgb, var(--color-primary) 45%, transparent) 0%, transparent 55%)',
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

        <div className="container relative z-10 mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex justify-center">
              <Image
                src="https://toivhpeabwwqilbzbrfb.supabase.co/storage/v1/object/public/Website%20Photos/bridge.png"
                alt=""
                width={120}
                height={48}
                className="h-12 w-auto opacity-90"
              />
            </div>
            <h1 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              {headline}
            </h1>
            {subhead && (
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
                {subhead}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {primaryCta && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                  >
                    <Link href={primaryCta.href}>
                      {primaryCta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-transparent border border-white/60 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (isVideo169) {
    return (
      <section className="bg-[var(--color-secondary)]">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              loading="lazy"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : videoUrl ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={poster || image || undefined}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : null}
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-5 font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              {headline}
            </h1>
            {subhead && (
              <p className="mb-8 text-lg leading-relaxed text-white/85 md:text-xl">
                {subhead}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap justify-center gap-4">
                {primaryCta && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                  >
                    <Link href={primaryCta.href}>
                      {primaryCta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-transparent border border-white/60 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (isVideo) {
    const posterSrc = poster || image || undefined

    return (
      <section className={cn('relative flex items-center justify-center overflow-hidden', heightClass)}>
        <div className="absolute inset-0 z-0 overflow-hidden bg-[var(--color-secondary)]">
          {iframeUrl ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-video w-full min-w-[177.78vh] min-h-full">
              <iframe
                src={iframeUrl}
                loading="lazy"
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : videoUrl ? (
            <video
              className="h-full w-full object-cover motion-reduce:hidden"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={posterSrc}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : null}

          {!iframeUrl && posterSrc && (
            <Image
              src={posterSrc}
              alt={imageAlt || ''}
              fill
              priority
              className={cn('object-cover', videoUrl ? 'hidden motion-reduce:block' : 'block')}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center pointer-events-none">
          <div className="mx-auto max-w-3xl text-white">
            <h1 className="mb-6 font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-7xl">
              {headline}
            </h1>

            {subhead && (
              <p className="mb-8 text-lg leading-relaxed text-white/90 md:text-xl">
                {subhead}
              </p>
            )}

            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
                {primaryCta && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                  >
                    <Link href={primaryCta.href}>
                      {primaryCta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-transparent border border-white/60 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        isFullBleed ? heightClass : 'py-16 md:py-24 lg:py-32',
        isFullBleed && 'flex items-center',
        isMinimal && 'py-12 md:py-16'
      )}
    >
      {isFullBleed && image && (
        <div className="absolute inset-0 z-0">
          <Image src={image} alt={imageAlt || ''} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-[var(--color-secondary)]/70" />
        </div>
      )}

      <div
        className={cn(
          'container mx-auto px-4 relative z-10 w-full',
          isSplitImage && 'grid lg:grid-cols-2 gap-12 items-center'
        )}
      >
        <div
          className={cn(
            'max-w-3xl',
            !isSplitImage && 'mx-auto text-center',
            isFullBleed && 'text-white'
          )}
        >
          <h1
            className={cn(
              'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6',
              'font-[var(--font-heading)]',
              isFullBleed ? 'text-white' : 'text-[var(--color-foreground)]'
            )}
          >
            {headline}
          </h1>

          {subhead && (
            <p
              className={cn(
                'text-lg md:text-xl mb-8 leading-relaxed',
                isFullBleed ? 'text-white/90' : 'text-[var(--color-muted)]'
              )}
            >
              {subhead}
            </p>
          )}

          {(primaryCta || secondaryCta) && (
            <div className={cn('flex flex-wrap gap-4', !isSplitImage && 'justify-center')}>
              {primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
                >
                  <Link href={primaryCta.href}>
                    {primaryCta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {secondaryCta && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    isFullBleed
                      ? 'bg-transparent border border-white/60 text-white hover:bg-white/10 hover:text-white'
                      : 'border-[var(--color-border)]'
                  )}
                >
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {isSplitImage && image && (
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image src={image} alt={imageAlt || ''} fill className="object-cover" priority />
          </div>
        )}
      </div>
    </section>
  )
}
