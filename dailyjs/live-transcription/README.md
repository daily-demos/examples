# Live Transcription

![Live Transcription](./image.png)

### Live example

**[See it in action here ➡️](https://dailyjs-live-transcription.vercel.app)**

---

## What does this demo do?

- Use [sendAppMessage](https://docs.daily.co/reference#%EF%B8%8F-sendappmessage) to send messages
- Listen for incoming messages using the call object `app-message` event
- Extend the basic call demo with a chat provider and aside
- Show a notification bubble on chat tray button when a new message is received
- Demonstrate how to play a sound whenever a message is received

Please note: this demo is not currently mobile optimised

### Getting started

```
# set both DAILY_API_KEY and DAILY_DOMAIN
mv env.example .env.local

yarn
yarn workspace @dailyjs/live-transcription dev
```

## How does this example work?

In this example we extend the [basic call demo](../basic-call) with the ability to generate transcription of the meeting in real time and log that in a side panel.

We pass a custom tray object, a custom app object (wrapping the original in a new `TranscriptionProvider`) as well as add our `TranscriptionAside` panel. We also symlink both the `public` and `pages/api` folders from the basic call.


## Deploy your own on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/daily-co/clone-flow?repository-url=https%3A%2F%2Fgithub.com%2Fdaily-demos%2Fexamples.git&env=DAILY_DOMAIN%2CDAILY_API_KEY&envDescription=Your%20Daily%20domain%20and%20API%20key%20can%20be%20found%20on%20your%20account%20dashboard&envLink=https%3A%2F%2Fdashboard.daily.co&project-name=daily-examples&repo-name=daily-examples)
