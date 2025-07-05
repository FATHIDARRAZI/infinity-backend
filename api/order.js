import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        key: process.env.SMM_API_KEY, // Use environment variable here
        action: 'add',
        service: serviceMap[service],
        link,
        quantity
      })
    });
    const data = await apiRes.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
