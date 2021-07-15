export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log(`Creating room on domain ${process.env.DAILY_DOMAIN}`);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          exp: Math.round(Date.now() / 1000) + 5 * 60, // expire in 5 minutes
          eject_at_room_exp: true,
        },
      }),
    };

    const dailyRes = await fetch(
      `${process.env.DAILY_REST_DOMAIN || 'https://api.daily.co/v1'}/rooms`,
      options
    );

    const { name, url, error } = await dailyRes.json();

    if (error) {
      return res.status(500).json({ error });
    }

    return res
      .status(200)
      .json({ name, url, domain: process.env.DAILY_DOMAIN });
  }

  return res.status(500);
}
