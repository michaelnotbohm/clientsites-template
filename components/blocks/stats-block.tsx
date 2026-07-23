import { StatStrip } from "@/components/stat-strip"
import type { BlockProps } from "./types"

interface StatsContent {
  stats?: Array<{
    value: string
    suffix?: string
    label: string
  }>
}

export function StatsBlock({ content: rawContent }: BlockProps<StatsContent>) {
  const content = rawContent as StatsContent
  const stats = content.stats || []
  
  if (stats.length === 0) return null
  
  return <StatStrip stats={stats} />
}
