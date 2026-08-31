export default async function handler(req: any, res: any) {
  // Enable CORS for API route
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toMobile, message } = req.body || {};
  const apiKey = process.env.SEMAPHORE_API_KEY || process.env.VITE_SEMAPHORE_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Semaphore API key is not configured in Environment Variables.' });
  }

  if (!toMobile || !message) {
    return res.status(400).json({ error: 'toMobile and message are required.' });
  }

  try {
    const semaphoreRes = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        apikey: apiKey,
        number: toMobile,
        message: message,
        sendername: 'TriSakay'
      })
    });

    const data = await semaphoreRes.json();
    return res.status(semaphoreRes.status).json(data);
  } catch (error: any) {
    console.error('Vercel Semaphore SMS Gateway Error:', error);
    return res.status(500).json({ error: error.message || 'SMS dispatch failed' });
  }
}
