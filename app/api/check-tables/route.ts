import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to query each expected table
    const tables = ['tenants', 'pages', 'sections', 'categories', 'posts', 'team_members', 'leads', 'media', 'integrations']
    const results: Record<string, { exists: boolean; count?: number; error?: string }> = {}
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results[table] = { exists: false, error: error.message }
        } else {
          results[table] = { exists: true, count: count ?? 0 }
        }
      } catch (err) {
        results[table] = { exists: false, error: String(err) }
      }
    }
    
    const existingTables = Object.entries(results).filter(([, v]) => v.exists).map(([k]) => k)
    
    return NextResponse.json({
      success: true,
      existingTables,
      totalFound: existingTables.length,
      details: results
    })
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: String(err) 
    }, { status: 500 })
  }
}
