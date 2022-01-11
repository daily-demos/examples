# Active Speaker

![Active Speaker](./image.png)

### Live example

**[See it in action here ➡️](https://custom-active-speaker.vercel.app)**

---

## What does this demo do?

- Uses an active speaker view mode that shows the currently talking participant (or active screen share) in a larger tile
- Introduces the `ParticipantBar` column that virtually scrolls through all call participants
- Uses manual subscriptions to paginate between tiles that are currently in view. For more information about how this works, please refer to the [pagination demo](../pagination)

Please note: this demo is not currently mobile optimised

### Getting started

```
# set both DAILY_API_KEY and DAILY_DOMAIN
mv env.example .env.local

yarn
yarn workspace @custom/active-speaker dev
```

## Deploy your own on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/daily-co/clone-flow?repository-url=https%3A%2F%2Fgithub.com%2Fdaily-demos%2Fexamples.git&env=DAILY_DOMAIN%2CDAILY_API_KEY&envDescription=Your%20Daily%20domain%20and%20API%20key%20can%20be%20found%20on%20your%20account%20dashboard&envLink=https%3A%2F%2Fdashboard.daily.co&project-name=daily-examples&repo-name=daily-examples)
