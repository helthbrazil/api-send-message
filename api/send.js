export default async function handler(req, res) {
  const { text } = req.query;

  const url =
    `https://api.callmebot.com/whatsapp.php` +
    `?phone=${process.env.CALLMEBOT_PHONE}` +
    `&text=${encodeURIComponent(text)}` +
    `&apikey=${process.env.CALLMEBOT_APIKEY}`;

  const response = await fetch(url);
  const result = await response.text();

  res.status(200).send(result);
}
