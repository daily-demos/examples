# RTP Tracks Recording and Compositing

This demo shows how to automate the process of creating a composite video from an [rtp tracks recording](https://www.daily.co/blog/daily-co-api-server-side-rtp-tracks-recording/). The compositing happens on Daily servers, but this demo polls our REST APIs to track the status of the compositing job and wait for the result.

## Getting Started

Start by cloning the repo, then going to the `rtp-tracks-compositing` directory. Copy the `env.example` file to `.env.local` and add values to the empty variables.

Open `public/index.html` and change the call URL from its current value of `'YOUR_ROOM_URL_HERE'`.

Then, you can run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the page. You can add other people to the call by linking them directly to your Daily call URL.

To start recording the presenter's video, click the "Start Session" button. To stop recording, click "Stop Session".

After you've clicked "Stop Session", you can open your browser's web inspector to watch the polling process. When your video is ready, you'll see a "Download Video" link at the top of the page.

## Customizing

In a production app, it probably makes more sense to do the post-processing on a server. You can use the polling logic as-is in a node.js app or serverless function, then add your own code to upload the finished video to your CDN or notify you that it's ready.
