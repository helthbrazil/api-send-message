import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: 'Parameter "text" is required' });
  }

  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apiKey) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const url =
    `https://api.callmebot.com/whatsapp.php` +
    `?phone=${phone}` +
    `&text=${encodeURIComponent(text)}` +
    `&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const result = await response.text();
    res.status(200).send(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}
