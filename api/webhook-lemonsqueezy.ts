/**
 * Lemon Squeezy → Firestore Webhook Handler
 *
 * Vercel serverless function:
 *   URL: https://panalelectricianpro.vercel.app/api/webhook/lemonsqueezy
 *
 * Env vars needed (add to Vercel dashboard):
 *   FIREBASE_PROJECT_ID   = panelelectric-d68e4
 *   FIREBASE_CLIENT_EMAIL  = from Firebase service account JSON
 *   FIREBASE_PRIVATE_KEY   = from Firebase service account JSON (use \n literally, not \\n)
 *   LS_WEBHOOK_SECRET      = from LS Settings → API → Webhooks
 *
 * LS webhook events handled:
 *   subscription_created  → write Firestore user with tier
 *   subscription_updated  → update Firestore user tier
 *   subscription_cancelled → set tier=none, status=cancelled
 */

// Allow Firebase to be used in serverless context
export const runtime = 'nodejs';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';
import { getDb } from '../src/lib/firebase-admin';

// ─── Variant ID → Tier mapping ────────────────────────────────────────────
const VARIANT_TIER_MAP: Record<string, string> = {
  'tier-47':   'starter',
  'tier-97':   'pro',
  'tier-197':  'business',
  'tier-297':  'growth',
  'tier-1000': 'dfy',
};

function resolveTier(variantId: string | number): string {
  const key = String(variantId);
  return VARIANT_TIER_MAP[key] ?? 'unknown';
}

// ─── Webhook signature verification ────────────────────────────────────────
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const hmac = createHmac('sha256', secret);
    hmac.update(rawBody, 'utf8');
    const digest = hmac.digest('base64url');

    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const digBuf = Buffer.from(digest);
    if (sigBuf.length !== digBuf.length) return false;
    return timingSafeEqual(sigBuf, digBuf);
  } catch {
    return false;
  }
}

// ─── LS event type extraction ──────────────────────────────────────────────
function getEventName(body: Record<string, unknown>): string {
  const meta = body.meta as Record<string, unknown> | undefined;
  return (meta?.event_name as string) ?? '';
}

// ─── Extract fields from LS subscription_created / subscription_updated ───
function extractSubscriptionData(body: Record<string, unknown>): {
  customerId: string;
  email: string;
  subscriptionId: string;
  variantId: string;
  tier: string;
} | null {
  try {
    const data = body.data as Record<string, unknown>;
    const attributes = data.attributes as Record<string, unknown>;

    const customerId = String(body.meta?.custom_data?.user_id ?? data.id ?? '');
    const email = String(attributes.email ?? '');
    const subscriptionId = String(data.id ?? '');
    const variantId = String(attributes.variant_id ?? '');
    const tier = resolveTier(attributes.variant_id);

    if (!customerId || !email) return null;

    return { customerId, email, subscriptionId, variantId, tier };
  } catch {
    return null;
  }
}

// ─── Main handler ───────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[LS Webhook] LS_WEBHOOK_SECRET env var is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  // Get raw body — Vercel may give us Buffer or string depending on config
  const rawBody =
    typeof req.body === 'string'
      ? req.body
      : req.body instanceof Buffer
      ? req.body.toString('utf8')
      : JSON.stringify(req.body);

  const signature = req.headers['x-signature'] as string | undefined;
  if (!signature || !verifySignature(rawBody, signature, secret)) {
    console.warn('[LS Webhook] Invalid signature — rejecting request');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const eventName = getEventName(parsed);
  console.log(`[LS Webhook] Received event: ${eventName}`);

  try {
    const db = getDb();

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const data = extractSubscriptionData(parsed);
      if (!data) {
        console.error('[LS Webhook] Could not extract subscription data from event');
        res.status(400).json({ error: 'Malformed event body' });
        return;
      }

      const { customerId, email, subscriptionId, variantId, tier } = data;

      await db.doc(`users/${customerId}`).set(
        {
          email,
          tier,
          status: 'active',
          subscriptionId,
          variantId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log(`[LS Webhook] ✅ User ${customerId} set to tier=${tier}, status=active`);

    } else if (eventName === 'subscription_cancelled') {
      const data = extractSubscriptionData(parsed);
      if (!data) {
        console.error('[LS Webhook] Could not extract subscription data from cancellation event');
        res.status(400).json({ error: 'Malformed event body' });
        return;
      }

      const { customerId } = data;

      await db.doc(`users/${customerId}`).set(
        {
          tier: 'none',
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log(`[LS Webhook] ✅ User ${customerId} cancelled — tier=none, status=cancelled`);

    } else {
      // Silently acknowledge unknown events (LS may add new event types later)
      console.log(`[LS Webhook] Ignored event: ${eventName}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[LS Webhook] ❌ Firestore write error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
