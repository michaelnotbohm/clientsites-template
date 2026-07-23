import Link from 'next/link'
import { ArrowRight, Home, DollarSign, Shield, FileText, Users, TrendingUp, Building, Key, Briefcase, Heart, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  dollar: DollarSign,
  shield: Shield,
  file: FileText,
  users: Users,
  trending: TrendingUp,
  building: Building,
  key: Key,
  briefcase: Briefcase,
  heart: Heart,
}

interface LoanProductCardProps {
  name?: string
  title?: string
  shortDescription?: string
  tagline?: string
  href: string
  icon: LucideIcon | string
  className?: string
}

export function LoanProductCard({
  name,
  title,
  shortDescription,
  tagline,
  href,
  icon,
  className,
}: LoanProductCardProps) {
  const displayTitle = name || title || ''
  const displayTagline = shortDescription || tagline || ''
  const Icon = typeof icon === 'string' ? (iconMap[icon] || Home) : icon
  
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col p-6 rounded-xl border border-border bg-card transition-all duration-300',
        'hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-1" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {displayTitle}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {displayTagline}
      </p>
    </Link>
  )
}
