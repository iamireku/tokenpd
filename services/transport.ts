
import { CLIENT_VERSION, MASTER_UPLINK } from '../constants';
import { generateSignature } from '../utils';

/**
 * TokenPod+ | transport.ts
 * Low-level HMAC Signed Communication Layer
 */

const SYNC_TIMEOUT_MS = 45000;

export const secureFetch = async (
  body: Record<string, any>, 
  signingSecret: string, 
  silent: boolean = false
) => {
  const timestamp = Date.now();
  const basePayload = { ...body, clientVersion: CLIENT_VERSION };
  
  // Strip undefined keys to ensure signature stability
  const cleanPayload = Object.fromEntries(
    Object.entries(basePayload).filter(([_, v]) => v !== undefined)
  );

  const signature = await generateSignature(cleanPayload, signingSecret, timestamp);
  const envelopedPayload = { ...cleanPayload, _sig: signature, _ts: timestamp };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    // MASTER_UPLINK is now "/api/proxy" which is handled by Vite (dev) or Vercel (prod)
    const res = await fetch(MASTER_UPLINK, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(envelopedPayload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    
    const text = await res.text();
    
    // Check if the server returned HTML (common on GAS errors or redirect failures)
    if (text.trim().startsWith('<!DOCTYPE')) {
      throw new Error("SERVER_HTML_RESPONSE");
    }

    const json = JSON.parse(text);
    return json;
  } catch (e: any) {
    clearTimeout(timeoutId);
    const errTag = e.name === 'AbortError' ? "SYNC_TIMEOUT" : "NETWORK_FAILURE";
    if (!silent) console.error(`[Transport Error] ${errTag}:`, e);
    return { success: false, error: errTag };
  }
};
