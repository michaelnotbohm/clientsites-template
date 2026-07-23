// =============================================================================
// app/api/cron/fetch-rates/route.ts
//
// Vercel Cron handler. Runs on the schedule in vercel.json. For every tenant
// that has a `rate_table` section, it fetches the latest national-benchmark
// rates from the FRED API (OBMMI daily indices + Freddie Mac PMMS weekly
// averages) and upserts them into public.rate_snapshots.
//
// The public website NEVER calls FRED — it reads rate_snapshots from Supabase.
// FRED also blocks browser CORS and would leak the key client-side, so all
// FRED access MUST be server-side; this cron is that server side.
//
// FRED has no combined "all rates" endpoint and provides no WoW/YoY deltas, so
// per series we fetch a short window of recent observations (sorted newest
// first) and compute:
//   * rate       = newest observation value
//   * wow_change = newest - observation ~7 days earlier
//   * yoy_change = newest - observation ~365 days earlier
// We pull a generous window and pick the closest prior observation to each
// target offset, which is robust to daily (OBMMI) vs weekly (PMMS) frequency
// and to holidays/gaps.
//
// Request budget: 7 series * 1 request = 7 requests per run, once weekly. FRED
// has no hard free-tier cap that this approaches.
//
// Required environment variables:
//   FRED_API_KEY                - your 32-char FRED API key
//   NEXT_PUBLIC_SUPABASE_URL    - https://toivhpeabwwqilbzbrfb.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   - service role key (server-only; NOT anon key)
//   CRON_SECRET                 - random string; also set on the Vercel cron
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

// The series we track. `source` groups attribution for the snapshot row.
const SERIES: { id: string; source: string }[] = [
  { id: 'OBMMIC30YF', source: 'Optimal Blue (OBMMI) via FRED' },
  { id: 'OBMMIFHA30YF', source: 'Optimal Blue (OBMMI) via FRED' },
  { id: 'OBMMIVA30YF', source: 'Optimal Blue (OBMMI) via FRED' },
  { id: 'OBMMIUSDA30YF', source: 'Optimal Blue (OBMMI) via FRED' },
  { id: 'OBMMIJUMBO30YF', source: 'Optimal Blue (OBMMI) via FRED' },
  { id: 'MORTGAGE30US', source: 'Freddie Mac PMMS via FRED' },
  { id: 'MORTGAGE15US', source: 'Freddie Mac PMMS via FRED' },
];

// FRED observation shape: { date: 'YYYY-MM-DD', value: '6.65' } (value string;
// missing values come through as '.').
interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations?: FredObservation[];
}

interface SnapshotRow {
  tenant_id: string;
  rate_type: string;
  rate: number;
  wow_change: number | null;
  yoy_change: number | null;
  survey_date: string;
  source: string;
}

// One computed snapshot for a series, before fan-out across tenants.
interface ComputedRate {
  rate_type: string;
  rate: number;
  wow_change: number | null;
  yoy_change: number | null;
  survey_date: string;
  source: string;
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime();
  return Math.abs(ms) / 86_400_000;
}

// From observations sorted NEWEST-first, find the one closest to `targetDays`
// before the newest date. Returns null if nothing is within tolerance.
function findPrior(
  observations: { date: string; value: number }[],
  newestDate: string,
  targetDays: number,
  toleranceDays: number,
): number | null {
  let best: { value: number; diff: number } | null = null;
  for (const o of observations) {
    const age = daysBetween(newestDate, o.date);
    const diff = Math.abs(age - targetDays);
    if (diff <= toleranceDays && (best === null || diff < best.diff)) {
      best = { value: o.value, diff };
    }
  }
  return best ? best.value : null;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

async function fetchSeries(seriesId: string, apiKey: string): Promise<ComputedRate | null> {
  // Pull ~14 months of daily history (limit covers OBMMI daily density) so both
  // the ~7-day and ~365-day lookbacks are present. Newest first.
  const url =
    `${FRED_BASE}?series_id=${encodeURIComponent(seriesId)}` +
    `&api_key=${encodeURIComponent(apiKey)}` +
    `&file_type=json&sort_order=desc&limit=420`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;

  const payload = (await res.json()) as FredResponse;
  const raw = payload.observations ?? [];

  // Parse + drop FRED's '.' missing-value sentinel.
  const parsed = raw
    .map((o) => ({ date: o.date, value: Number(o.value) }))
    .filter((o) => Number.isFinite(o.value));

  if (parsed.length === 0) return null;

  // parsed[0] is newest (sort_order=desc).
  const newest = parsed[0];
  const meta = SERIES.find((s) => s.id === seriesId);

  const priorWeek = findPrior(parsed, newest.date, 7, 4);
  const priorYear = findPrior(parsed, newest.date, 365, 21);

  return {
    rate_type: seriesId,
    rate: round3(newest.value),
    wow_change: priorWeek === null ? null : round3(newest.value - priorWeek),
    yoy_change: priorYear === null ? null : round3(newest.value - priorYear),
    survey_date: newest.date,
    source: meta ? meta.source : 'FRED',
  };
}

export async function GET(request: Request): Promise<Response> {
  // 1. Authorize the cron call.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const fredKey = getEnv('FRED_API_KEY');

    // 2. Fetch + compute each series (in parallel).
    const settled = await Promise.all(SERIES.map((s) => fetchSeries(s.id, fredKey)));
    const computed = settled.filter((c): c is ComputedRate => c !== null);

    if (computed.length === 0) {
      return NextResponse.json(
        { error: 'FRED returned no usable observations for any series' },
        { status: 502 },
      );
    }

    // 3. Connect to Supabase with the service-role key (bypasses RLS).
    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 4. Find every tenant that actually uses a rate_table block.
    const { data: rateSections, error: sectionsError } = await supabase
      .from('sections')
      .select('tenant_id')
      .eq('type', 'rate_table');

    if (sectionsError) {
      return NextResponse.json(
        { error: 'Failed to query rate_table sections', detail: sectionsError.message },
        { status: 500 },
      );
    }

    const tenantIds = Array.from(
      new Set((rateSections ?? []).map((s: { tenant_id: string }) => s.tenant_id)),
    );

    if (tenantIds.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No tenants currently use a rate_table block. Nothing to write.',
        series: computed.map((c) => c.rate_type),
      });
    }

    // 5. Fan out one row per (tenant, series) and upsert.
    const rows: SnapshotRow[] = [];
    for (const tenantId of tenantIds) {
      for (const c of computed) {
        rows.push({
          tenant_id: tenantId,
          rate_type: c.rate_type,
          rate: c.rate,
          wow_change: c.wow_change,
          yoy_change: c.yoy_change,
          survey_date: c.survey_date,
          source: c.source,
        });
      }
    }

    const { error: upsertError } = await supabase
      .from('rate_snapshots')
      .upsert(rows, { onConflict: 'tenant_id,rate_type,survey_date' });

    if (upsertError) {
      return NextResponse.json(
        { error: 'Failed to upsert rate_snapshots', detail: upsertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      tenants_updated: tenantIds.length,
      series: computed.map((c) => ({
        rate_type: c.rate_type,
        rate: c.rate,
        survey_date: c.survey_date,
        wow_change: c.wow_change,
        yoy_change: c.yoy_change,
      })),
      rows_written: rows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
