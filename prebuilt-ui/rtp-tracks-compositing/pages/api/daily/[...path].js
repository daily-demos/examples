// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// This file allows you to make requests to the Daily API using your API token
// from your front-end without having to expose your API token. It is, however,
// EXTREMELY DANGEROUS to use this file as-is in production, since it's only
// marginally more safe than exposing your token directly; anyone that gets to
// this page with a bit of javascript know-how could do anything they wanted
// to your Daily account. It's strongly recommended to create your own API
// endpoints that use this approach internally to prevent someone from deleting
// all your rooms or downloading all your meeting logs.

// To use this, replace "https://api.daily.co/v1" with "/api/daily" in your
// front-end code. For example, to list your rooms, you'd normally use
// fetch('https://api.daily.co/v1/rooms') with your token, but now you can use
// fetch('/api/daily/rooms') instead.

import httpProxyMiddleware from 'next-http-proxy-middleware';
export default async function handler(req, res) {
  const { path } = req.query;
  console.log('Proxying Daily API Request: ', path.join('/'));
  await httpProxyMiddleware(req, res, {
    target: process.env.DAILY_REST_DOMAIN || 'https://api.daily.co/v1',
    headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
    pathRewrite: { '^/api/daily': '' },
  });
  res.end();
}
