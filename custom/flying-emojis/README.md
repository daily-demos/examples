# Flying Emojis

![Flying Emojis](./image.png)

### Live example

**[See it in action here ➡️](https://custom-flying-emojis.vercel.app)**

---

## What does this demo do?

- Use [sendAppMessage](https://docs.daily.co/reference#%EF%B8%8F-sendappmessage) to send flying emojis to all clients
- Implements a custom `<App />` that adds `<FlyingEmojisOverlay />` component that listens for incoming emoji events and appends a new node to the DOM
- Todo: pool emoji DOM nodes to optimise on DOM mutations

Please note: this demo is not currently mobile optimised

### Getting started

```
# set both DAILY_API_KEY and DAILY_DOMAIN
mv env.example .env.local

yarn
yarn workspace @custom/flying-emojis dev
```

## Deploy your own on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/daily-co/clone-flow?repository-url=https%3A%2F%2Fgithub.com%2Fdaily-demos%2Fexamples.git&env=DAILY_DOMAIN%2CDAILY_API_KEY&envDescription=Your%20Daily%20domain%20and%20API%20key%20can%20be%20found%20on%20your%20account%20dashboard&envLink=https%3A%2F%2Fdashboard.daily.co&project-name=daily-examples&repo-name=daily-examples)
