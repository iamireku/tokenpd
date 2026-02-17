
export default async function handler(req, res) {
  // Use GAS_SCRIPT_URL from Vercel Env Vars, fallback to VITE_ version for consistency
  const target = process.env.GAS_SCRIPT_URL || process.env.VITE_GAS_SCRIPT_URL;

  if (!target) {
    console.error('Proxy Error: GAS_SCRIPT_URL environment variable is not set.');
    return res.status(500).json({ 
      success: false, 
      error: 'UPLINK_UNCONFIGURED',
      message: 'Backend URL missing in environment variables.' 
    });
  }

  // Only allow POST requests for the Ledger protocol
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    // Forward the request to Google Apps Script
    // We send as text/plain to avoid CORS preflight issues with GAS
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`Uplink returned status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Execution Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'PROXY_UPLINK_FAILURE',
      message: error.message 
    });
  }
}
