import fetch from 'node-fetch';

const orderTimestamps = {}; // In-memory store (reset on redeploy)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Get user IP (works for Vercel serverless)
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  // Check last order time
  const now = Date.now();
  const lastOrder = orderTimestamps[ip] || 0;
  const threeHours = 3 * 60 * 60 * 1000;

  if (now - lastOrder < threeHours) {
    const minutesLeft = Math.ceil((threeHours - (now - lastOrder)) / 60000);
    return res.status(429).json({ error: `يمكنك إرسال طلب جديد بعد ${minutesLeft} دقيقة.` });
  }

  // ...existing order code...
  const { service, link, quantity } = req.body;
  const serviceMap = {
    like: '1192',
    view: '2235',
    tiktok_view: '3099',
    tiktok_like: '2736'
  };
  if (!serviceMap[service] || !link || !quantity) {
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  try {
    const apiRes = await fetch('https://bestsmmprovider.com/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: process.env.SMM_API_KEY,
        action: 'add',
        service: serviceMap[service],
        link,
        quantity
      })
    });
    const data = await apiRes.json();
    if (data.order) {
      orderTimestamps[ip] = now; // Save last order time
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
