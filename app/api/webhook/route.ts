import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/infrastructure/supabase/server';

interface WebhookPayload {
  secret:        string;
  user_id:       string;
  amount:        number;
  type:          'in' | 'out';
  category:      string;
  note?:         string;
  date?:         string;
  // idempotency_key prevents duplicate inserts when n8n retries
  // n8n should send a unique key per bank alert, e.g. the email message-id
  idempotency_key?: string;
}

export async function POST(req: NextRequest) {
  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: WebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── 2. Verify webhook secret — server-only env var, never in browser ───────
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected || body.secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 3. Validate fields ─────────────────────────────────────────────────────
  const { user_id, amount, type, category } = body;

  if (!user_id || !amount || !type || !category) {
    return NextResponse.json(
      { error: 'Missing required fields: user_id, amount, type, category' },
      { status: 422 },
    );
  }
  if (!['in', 'out'].includes(type)) {
    return NextResponse.json({ error: 'type must be "in" or "out"' }, { status: 422 });
  }
  if (typeof amount !== 'number' || amount <= 0 || amount > 500_000_000) {
    return NextResponse.json(
      { error: 'amount must be a positive number ≤ 500,000,000' },
      { status: 422 },
    );
  }

  const supabase = createSupabaseServiceClient();

  // ── 4. Idempotency check — prevents duplicate inserts when n8n retries ─────
  // If n8n sends an idempotency_key, check if we already processed this alert
  if (body.idempotency_key) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user_id)
      .eq('idempotency_key', body.idempotency_key)
      .single();

    if (existing) {
      // Already inserted — return success so n8n stops retrying
      return NextResponse.json(
        { ok: true, duplicate: true, transaction_id: existing.id },
        { status: 200 },
      );
    }
  }

  // ── 5. Insert via service role — bypasses RLS safely (server-to-server) ────
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id,
      amount,
      type,
      category,
      note:            body.note            || null,
      date:            body.date            || new Date().toISOString().split('T')[0],
      idempotency_key: body.idempotency_key || null,
      source:          'auto',
    })
    .select()
    .single();

  if (error) {
    console.error('[webhook] Insert error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, transaction: data }, { status: 201 });
}

// Health check — lets you verify the endpoint is reachable
export async function GET() {
  return NextResponse.json({ status: 'NairaTracker webhook is live' });
}
