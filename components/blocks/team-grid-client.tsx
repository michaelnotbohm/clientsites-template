'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, X, ArrowRight } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  title: string | null
  license_no: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  bio: string | null
  photo_position: string | null
}

interface TeamGridClientProps {
  members: TeamMember[]
  heading?: string
  subheading?: string
  applyUrl: string
}

export function TeamGridClient({ members, heading, subheading, applyUrl }: TeamGridClientProps) {
  const [selected, setSelected] = useState<TeamMember | null>(null)

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [selected])

  const linkClass = 'flex items-center gap-2 text-[var(--color-primary)] hover:underline'

  return (
    <section className="py-16 md:py-24 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        {(heading || subheading) && (
          <div className="text-center mb-12">
            {heading && <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] text-[var(--color-secondary)]">{heading}</h2>}
            {subheading && <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">{subheading}</p>}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <button key={member.id} onClick={() => setSelected(member)} className="group text-left overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm transition-shadow hover:shadow-md">
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-surface)]">
                {member.photo_url && <Image src={member.photo_url} alt={member.name} fill style={{ objectPosition: member.photo_position || 'top' }} className="object-cover transition-transform duration-500 group-hover:scale-105" />}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[var(--color-secondary)] font-[var(--font-heading)]">{member.name}</h3>
                {member.title && <p className="text-sm text-[var(--color-muted)]">{member.title}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--color-background)] shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelected(null)} aria-label="Close" className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
              <X className="h-5 w-5" />
            </button>
            {selected.photo_url && (
              <div className="relative aspect-[3/2] w-full bg-[var(--color-surface)]">
                <Image src={selected.photo_url} alt={selected.name} fill style={{ objectPosition: selected.photo_position || 'top' }} className="object-cover" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold text-[var(--color-secondary)] font-[var(--font-heading)]">{selected.name}</h3>
              {selected.title && <p className="text-[var(--color-muted)] mb-1">{selected.title}</p>}
              {selected.license_no && <p className="text-xs text-[var(--color-muted)] mb-4">NMLS# {selected.license_no}</p>}
              {selected.bio && <p className="text-[var(--color-foreground)]/80 leading-relaxed mb-6">{selected.bio}</p>}
              <div className="space-y-2 mb-6">
                {selected.phone && <Link href={"tel:" + selected.phone} className={linkClass}><Phone className="h-4 w-4" />{selected.phone}</Link>}
                {selected.email && <Link href={"mailto:" + selected.email} className={linkClass}><Mail className="h-4 w-4" />{selected.email}</Link>}
              </div>
              <Link href={applyUrl} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary)]/90 transition-colors">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
