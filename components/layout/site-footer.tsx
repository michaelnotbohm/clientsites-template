import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react'
import type { Tenant } from '@/lib/tenant'

interface FooterLink {
  label: string
  href: string
  children?: FooterLink[]
}

interface SiteFooterProps {
  tenant: Tenant
  footerLinks?: FooterLink[]
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
}

export function SiteFooter({ tenant, footerLinks = [] }: SiteFooterProps) {
  const socialLinks = Object.entries(tenant.social_links || {}).filter(([, url]) => url)

  const addressParts = [
    tenant.address_line1,
    tenant.address_line2,
    tenant.city && tenant.state ? tenant.city + ', ' + tenant.state : tenant.city || tenant.state,
    tenant.postal_code,
  ].filter(Boolean)
  const formattedAddress = addressParts.join(', ') || null

  return (
    <footer className="bg-[var(--color-secondary)] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            {/* Company Info */}
            <div>
              <Link href="/" className="inline-block">
                {tenant.logo_url ? (
                  <Image src={tenant.logo_url} alt={tenant.name} width={140} height={40} className="h-8 w-auto brightness-0 invert" />
                ) : (
                  <span className="text-xl font-bold tracking-tight font-[var(--font-heading)]">{tenant.name}</span>
                )}
              </Link>

              <div className="mt-4 space-y-2">
                {tenant.phone && (
                  <a href={'tel:' + tenant.phone} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                    {tenant.phone}
                  </a>
                )}
                {tenant.phone_tollfree && (
                  <a href={'tel:' + tenant.phone_tollfree} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                    {tenant.phone_tollfree} (Toll-Free)
                  </a>
                )}
                {tenant.email && (
                  <a href={'mailto:' + tenant.email} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                    {tenant.email}
                  </a>
                )}
                {formattedAddress && (
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{formattedAddress}</span>
                  </div>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-4 flex gap-4">
                  {socialLinks.map(([platform, url]) => {
                    const Icon = socialIcons[platform]
                    if (!Icon || !url) return null
                    return (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors" aria-label={platform}>
                        <Icon className="h-5 w-5" />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Equal Housing Opportunity — centered */}
            <div className="flex justify-center">
              <div className="flex items-center justify-center rounded-xl bg-white px-6 py-5 shadow-md">
                <Image src="https://toivhpeabwwqilbzbrfb.supabase.co/storage/v1/object/public/Website%20Photos/equal-housing-opportunity.svg" alt="Equal Housing Opportunity" width={220} height={110} className="h-20 w-auto" />
              </div>
            </div>

            {/* Best of South Tampa — right */}
            <div className="flex justify-center md:justify-end">
              <div className="flex items-center justify-center rounded-xl bg-white px-5 py-4 shadow-md">
                <Image src="https://toivhpeabwwqilbzbrfb.supabase.co/storage/v1/object/public/Website%20Photos/2022_Best_of_South_Tampa_Color_Logo.webp" alt="2022 Best of South Tampa" width={120} height={120} className="h-16 w-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-4">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-white/50">
              &copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.
              {tenant.license_label && tenant.license_number && (
                <> {tenant.license_label} #{tenant.license_number}</>
              )}
            </p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-xs text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-white/50 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/licensing" className="text-xs text-white/50 hover:text-white transition-colors">Licensing</Link>
              {tenant.loan_officer_url && (
                <a href={tenant.loan_officer_url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-white transition-colors">
                  Loan Officer Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
