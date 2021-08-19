/*
 * This is an example server-side function that generates a meeting token
 * server-side. You could replace this on your own back-end to include
 * custom user authentication, etc.
 */

import { Logger } from 'aws-amplify';

const logger = new Logger('foo');

export default async function handler(req, res) {
  const { roomName, isOwner } = req.body;
  const key = process.env.DAILY_API_KEY;
  logger.info(key);

  if (req.method === 'POST' && roomName) {
    console.log(`Getting token for room '${roomName}' as owner: ${isOwner}`);
    logger.info(`FLASHING KEY: ${key}`);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        properties: { room_name: roomName, is_owner: isOwner },
      }),
    };
    console.log(options);

    const dailyRes = await fetch(
      `${
        process.env.DAILY_REST_DOMAIN || 'https://api.daily.co/v1'
      }/meeting-tokens`,
      options
    );

    const { token, error } = await dailyRes.json();

    if (error) {
      return res.status(500).json({ error });
    }

    return res.status(200).json({ token, domain: process.env.DAILY_DOMAIN });
  }

  return res.status(500);
}
