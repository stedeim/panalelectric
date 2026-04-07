/**
 * ConvertKit (Kit) Integration
 * Docs: https://developers.convertkit.com/
 */

const CK_API_KEY = 'qmzVWvuTu2Uz2J3v4oig2A';
const CK_API_BASE = 'https://api.convertkit.com/v3';

// The PanelElectric form ID from the API
const CK_FORM_ID = '9254189';

interface KitSubscriber {
  id: number;
  email: string;
  first_name: string;
  state: string;
}

interface KitTag {
  id: number;
  name: string;
}

/**
 * Subscribe a new user to the PanelElectric Kit form
 * Called automatically after Firebase signup
 */
export async function subscribeToKit(
  email: string,
  firstName: string,
  tags: string[] = []
): Promise<KitSubscriber | null> {
  try {
    const url = `${CK_API_BASE}/forms/${CK_FORM_ID}/subscribe`;
    const body = {
      api_key: CK_API_KEY,
      email,
      first_name: firstName,
      tags: tags.join(','),
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
    console.log('[Kit] Subscribed successfully:', data.subscriber?.email);
    return data.subscriber || null;
  } catch (err) {
    console.error('[Kit] Network error:', err);
    return null;
  }
}

/**
 * Add tags to an existing subscriber by email
 */
export async function addKitTags(email: string, tags: string[]): Promise<boolean> {
  try {
    // First get subscriber by email
    const searchRes = await fetch(
      `${CK_API_BASE}/subscribers?api_key=${CK_API_KEY}&email=${encodeURIComponent(email)}`
    );
    const searchData = await searchRes.json();
    const subscriber = searchData.subscribers?.[0];

    if (!subscriber) {
      console.warn('[Kit] Subscriber not found for tagging:', email);
      return false;
    }

    const tagRes = await fetch(
      `${CK_API_BASE}/subscribers/${subscriber.id}/tags`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: CK_API_KEY,
          tag_ids: tags, // Pass tag IDs directly
        }),
      }
    );

    return tagRes.ok;
  } catch (err) {
    console.error('[Kit] Tag error:', err);
    return false;
  }
}

/**
 * Get all available tags for this account
 */
export async function getKitTags(): Promise<KitTag[]> {
  try {
    const res = await fetch(
      `${CK_API_BASE}/tags?api_key=${CK_API_KEY}`
    );
    const data = await res.json();
    return data.tags || [];
  } catch (err) {
    console.error('[Kit] Get tags error:', err);
    return [];
  }
}

/**
 * Unsubscribe a subscriber from Kit
 */
export async function unsubscribeKit(email: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${CK_API_BASE}/subscribers/${encodeURIComponent(email)}/unsubscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: CK_API_KEY }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error('[Kit] Unsubscribe error:', err);
    return false;
  }
}

/**
 * Get Kit subscriber stats for the dashboard
 */
export async function getKitStats(): Promise<{ total: number; active: number }> {
  try {
    const res = await fetch(
      `${CK_API_BASE}/subscribers?api_key=${CK_API_KEY}&per_page=1`
    );
    const data = await res.json();
    return {
      total: data.total || 0,
      active: data.subscribers?.filter((s: any) => s.state === 'active').length || 0,
    };
  } catch (err) {
    console.error('[Kit] Stats error:', err);
    return { total: 0, active: 0 };
  }
}

// Default export with all functions
export default {
  subscribeToKit,
  addKitTags,
  getKitTags,
  unsubscribeKit,
  getKitStats,
  CK_FORM_ID,
};
