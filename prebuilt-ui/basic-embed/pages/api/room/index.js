/**
 * Generates a demo room server-side
 */

export default async function handler(req, res) {
  const { roomExp } = req.body.properties;

  if (req.method === 'POST') {
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          enable_prejoin_ui: true,
          enable_network_ui: true,
          enable_screenshare: true,
          enable_chat: true,
          exp: roomExp,
          eject_at_room_exp: true,
        },
      }),
    };

    const dailyRes = await fetch(
      `${process.env.DAILY_REST_DOMAIN}/rooms`,
      options
    );

    const response = await dailyRes.json();

    if (response.error) {
      return res.status(500).json(response.error);
    }

    return res.status(200).json(response);
  }

  return res.status(500);
}
