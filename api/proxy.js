
import webpush from 'web-push';

/**
 * TokenPod | Secure Proxy & Push Dispatcher
 * Handles HMAC bridging and ES256 Web Push signing
 */
export default async function handler(req, res) {
  const target = process.env.GAS_SCRIPT_URL || process.env.VITE_GAS_SCRIPT_URL;
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'chopdata1@gmail.com';

  if (!target) {
    return res.status(500).json({ success: false, error: 'UPLINK_UNCONFIGURED' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // SPECIAL ACTION: DISPATCH_PUSH
  // This is called by the GAS backend to trigger native signing
  if (payload.action === 'DISPATCH_PUSH') {
    if (!vapidPublic || !vapidPrivate) {
      return res.status(500).json({ success: false, error: 'VAPID_KEYS_MISSING' });
    }

    webpush.setVapidDetails(`mailto:${adminEmail}`, vapidPublic, vapidPrivate);

    try {
      const results = await Promise.all(payload.subscriptions.map(sub => 
        webpush.sendNotification(sub, JSON.stringify({ 
          title: 'TokenPod Signal', 
          body: 'A harvest window is open!' 
        })).catch(err => ({ error: err.message, endpoint: sub.endpoint }))
      ));

      return res.status(200).json({ success: true, results });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'PUSH_DISPATCH_FAILED' });
    }
  }

  // STANDARD ACTION: Forward to Google Apps Script
  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'PROXY_UPLINK_FAILURE' });
  }
}
