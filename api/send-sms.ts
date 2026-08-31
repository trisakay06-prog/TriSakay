export default async function handler(req: any, res: any) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { toMobile, message } = body || {};
  const apiKey = process.env.SEMAPHORE_API_KEY || process.env.VITE_SEMAPHORE_API_KEY || 'f6577cb68dc2a20429adb9378cdc9da7';

  if (!apiKey) {
    return res.status(200).json({ 
      success: false, 
      simulated: true, 
      info: 'Semaphore API Key not configured in environment variables.' 
    });
  }

  if (!toMobile || !message) {
    return res.status(400).json({ error: 'toMobile and message are required.' });
  }

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      number: toMobile,
      message: message
    });

    const semaphoreRes = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    const responseText = await semaphoreRes.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    console.log('[TriSakay SMS Backend] Semaphore status:', semaphoreRes.status, responseData);

    return res.status(200).json({
      success: semaphoreRes.ok,
      status: semaphoreRes.status,
      data: responseData
    });
  } catch (error: any) {
    console.error('Vercel Semaphore SMS Gateway Error:', error);
    return res.status(200).json({ 
      success: false, 
      error: error.message || 'SMS dispatch failed' 
    });
  }
}
