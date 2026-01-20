const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10;

// Estrutura:
// ip -> { count, windowStart }
const rateLimitMap = new Map();

export default async function handler(req, res) {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: 'Parameter "text" is required' });
  }

  // 📍 IP real (Vercel)
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    // primeira requisição do IP
    rateLimitMap.set(ip, { count: 1, windowStart: now });
  } else {
    const elapsed = now - entry.windowStart;

    if (elapsed > WINDOW_MS) {
      // nova janela
      rateLimitMap.set(ip, { count: 1, windowStart: now });
    } else {
      // mesma janela
      if (entry.count >= MAX_REQUESTS) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Max 10 messages per minute.'
        });
      }

      entry.count += 1;
      rateLimitMap.set(ip, entry);
    }
  }

  // 🚀 Chamada ao CallMeBot
  const url =
    `https://api.callmebot.com/whatsapp.php` +
    `?phone=${process.env.CALLMEBOT_PHONE}` +
    `&text=${encodeURIComponent(text)}` +
    `&apikey=${process.env.CALLMEBOT_APIKEY}`;

  try {
    const response = await fetch(url);
    const result = await response.text();
    res.status(200).send(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}
