import { createClient } from '@/lib/supabase/server'
import type { BlockProps, TeamGridContent } from './types'
import { TeamGridClient } from './team-grid-client'
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
export async function TeamGridBlock({ content, tenant }: BlockProps<TeamGridContent>) {
  const { heading, subheading } = content as TeamGridContent & { applyUrl?: string }
  const applyUrl = (content as { applyUrl?: string }).applyUrl || '/apply'
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('team_members')
    .select('id, name, title, license_no, phone, email, photo_url, bio, photo_position')
    .eq('tenant_id', tenant.id)
    .order('sort_order', { ascending: true })
  const teamMembers = (members || []) as TeamMember[]
  if (teamMembers.length === 0) return null
  return (
    <TeamGridClient
      members={teamMembers}
      heading={heading}
      subheading={subheading}
      applyUrl={applyUrl}
    />
  )
}
