# Text Chat

![Text Chat](./image.png)

## What does this demo do?

- Use [sendAppMessage](https://docs.daily.co/reference#%EF%B8%8F-sendappmessage) to send messages
- Listen for incoming messages using the call object `app-message` event
- Extend the basic call demo with a chat provider and aside
- Demonstrate how to play a sound whenever a message is received

Please note: this demo is not currently mobile optimised

### Getting started

```
# set both DAILY_API_KEY and DAILY_DOMAIN
mv env.example .env.local

yarn
yarn workspace @dailyjs/text-chat dev
```

## How does this example work?

In this example we extend the [basic call demo](../basic-call) with the ability to send chat messages.

We pass a custom tray object, a custom app object (wrapping the original in a new `ChatProvider`) as well as add our `ChatAside` panel. We also symlink both the `public` and `pages/api` folders from the basic call.

In a real world use case you would likely want to implement serverside logic so that participants joining a call can retrieve previously sent messages. This round trip could be done inside of the Chat context.
