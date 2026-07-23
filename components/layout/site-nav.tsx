'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, ChevronDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { Tenant } from '@/lib/tenant'

export interface NavLink {
  label: string
  href: string
  children?: NavLink[]
}

interface SiteNavProps {
  tenant: Tenant
  navLinks?: NavLink[]
  applyUrl?: string
}

export function SiteNav({ tenant, navLinks = [], applyUrl = '/apply' }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-[var(--color-background)]/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {tenant.logo_url ? (
              <Image
                src={tenant.logo_url}
                alt={tenant.name}
                width={224}
                height={64}
                className="h-16 w-auto"
              />
            ) : (
              <>
                <span className="text-xl font-bold tracking-tight text-[var(--color-foreground)] font-[var(--font-heading)]">
                  {tenant.name.split(' ').slice(0, -1).join(' ')}
                </span>
                <span className="text-sm font-medium text-[var(--color-muted)]">
                  {tenant.name.split(' ').slice(-1)[0]}
                </span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              <NavItem
                key={link.href}
                link={link}
                pathname={pathname}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <Button
              size="sm"
              className="rounded-full px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
              asChild
            >
              <Link href={applyUrl}>Apply Now</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-sm flex flex-col p-0"
            >
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
                <SheetTitle className="text-left text-[var(--color-foreground)]">
                  {tenant.name}
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="flex flex-col">
                  {navLinks.map((link) => (
                    <MobileNavItem key={link.href} link={link} pathname={pathname} />
                  ))}
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-[var(--color-border)]">
                <Button
                  asChild
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
                >
                  <Link href={applyUrl}>Apply Now</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

function NavItem({
  link,
  pathname,
  openDropdown,
  setOpenDropdown,
}: {
  link: NavLink
  pathname: string
  openDropdown: string | null
  setOpenDropdown: (v: string | null) => void
}) {
  const hasChildren = link.children && link.children.length > 0
  const isOpen = openDropdown === link.href

  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className={cn(
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          pathname === link.href
            ? 'text-[var(--color-foreground)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/10'
        )}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenDropdown(link.href)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <Link
        href={link.href}
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/10',
          pathname.startsWith(link.href) && 'text-[var(--color-foreground)]'
        )}
      >
        {link.label}
        <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')} />
      </Link>
      <div
        className={cn(
          'absolute left-0 top-full pt-2 transition-all duration-200',
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-md p-2 shadow-lg">
          <Link
            href={link.href}
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-[var(--color-foreground)] rounded-md hover:bg-[var(--color-muted)]/10 mb-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="h-px bg-[var(--color-border)] my-1" />
          {link.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                'block px-3 py-2 text-sm rounded-md transition-colors',
                pathname === child.href
                  ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/10'
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileNavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const hasChildren = link.children && link.children.length > 0
  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className={cn(
          'py-3 text-base font-medium border-b border-[var(--color-border)] transition-colors',
          pathname === link.href
            ? 'text-[var(--color-primary)]'
            : 'text-[var(--color-foreground)] hover:text-[var(--color-primary)]'
        )}
      >
        {link.label}
      </Link>
    )
  }
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={link.href} className="border-b border-[var(--color-border)]">
        <AccordionTrigger className="py-3 text-base font-medium text-[var(--color-foreground)] hover:no-underline">
          {link.label}
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col pl-4">
            <Link
              href={link.href}
              className="py-2 text-sm font-medium text-[var(--color-primary)]"
            >
              View All
            </Link>
            {link.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'py-2 text-sm transition-colors',
                  pathname === child.href
                    ? 'text-[var(--color-primary)] font-medium'
                    : 'text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)]'
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
