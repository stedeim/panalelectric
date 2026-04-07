/**
 * ConvertKit (Kit) Integration
 * API Key: qmzVWvuTu2Uz2J3v4oig2A
 * API Secret: ssuuzzDuoq9pL3DGSH2XZOQBaMS7xKLQQoFYo53NnQ
 * Form ID: 9254189 (PanelElectric)
 * Docs: https://developers.convertkit.com/
 */

const CK_API_KEY = 'qmzVWvuTu2Uz2J3v4oig2A';
const CK_API_SECRET = 'ssuuzzDuoq9pL3DGSH2XZOQBaMS7xKLQQoFYo53NnQ';
const CK_API_BASE = 'https://api.convertkit.com/v3';
const CK_FORM_ID = '9254189';

interface KitSubscriber {
  id: number;
  email: string;
  first_name: string;
  state: string;
}

// Tier tag names in Kit
const TIER_TAGS: Record<string, string> = {
  starter: 'panelelectric-starter',
  pro: 'panelelectric-pro',
  business: 'panelelectric-business',
  growth: 'panelelectric-growth',
  dfy: 'panelelectric-dfy',
};

/**
 * Subscribe a new user to PanelElectric form
 * Used in Firebase AuthContext on signup
 */
export async function subscribeToKit(
  email: string,
  firstName: string,
  tier: string = 'starter'
): Promise<KitSubscriber | null> {
  try {
    const tagName = TIER_TAGS[tier] || 'panelelectric-starter';
    
    const url = `${CK_API_BASE}/forms/${CK_FORM_ID}/subscribe`;
    const body = {
      api_key: CK_API_KEY,
      email,
      first_name: firstName || 'Member',
      tags: `new-member,email-sequence,${tagName}`,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Kit] Subscribe error:', err);
      return null;
    }

    const data = await res.json();
    console.log('[Kit] Subscribed:', data.subscriber?.email, '| Tag:', tagName);
    return data.subscriber || null;
  } catch (err) {
    console.error('[Kit] Network error:', err);
    return null;
  }
}

/**
 * Upgrade a subscriber's Kit tag when they upgrade tier
 * Called when LS webhook fires and tier updates in Firestore
 */
export async function updateKitTier(email: string, tier: string): Promise<boolean> {
  try {
    const newTag = TIER_TAGS[tier] || 'panelelectric-starter';
    
    // Get subscriber ID by email
    const searchRes = await fetch(
      `${CK_API_BASE}/subscribers?api_key=${CK_API_KEY}&email=${encodeURIComponent(email)}`
    );
    const searchData = await searchRes.json();
    const subscriber = searchData.subscribers?.[0];

    if (!subscriber) {
      console.warn('[Kit] Subscriber not found:', email);
      return false;
    }

    // Add new tier tag
    const tagRes = await fetch(
      `${CK_API_BASE}/subscribers/${subscriber.id}/tags`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: CK_API_KEY,
          api_secret: CK_API_SECRET,
          tag_ids: [newTag], // In production: map tag name to ID via getKitTags()
        }),
      }
    );

    console.log(`[Kit] Tier updated for ${email} → ${newTag}`);
    return tagRes.ok;
  } catch (err) {
    console.error('[Kit] Tier update error:', err);
    return false;
  }
}

/**
 * Unsubscribe from Kit
 */
export async function unsubscribeKit(email: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${CK_API_BASE}/subscribers/${encodeURIComponent(email)}/unsubscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: CK_API_KEY, api_secret: CK_API_SECRET }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error('[Kit] Unsubscribe error:', err);
    return false;
  }
}

/**
 * Get account stats
 */
export async function getKitStats(): Promise<{ total: number; active: number }> {
  try {
    const res = await fetch(
      `${CK_API_BASE}/subscribers?api_key=${CK_API_KEY}&per_page=1`
    );
    const data = await res.json();
    return { total: data.total || 0, active: data.subscribers?.length || 0 };
  } catch (err) {
    console.error('[Kit] Stats error:', err);
    return { total: 0, active: 0 };
  }
}

export default {
  subscribeToKit,
  updateKitTier,
  unsubscribeKit,
  getKitStats,
  CK_API_KEY,
  CK_FORM_ID,
};
