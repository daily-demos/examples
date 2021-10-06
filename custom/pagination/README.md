# Pagination, Sorting & Track Management

![Pagination](./image.png)

### Live example

**[See it in action here ➡️](https://custom-pagination.vercel.app)**

---

## What does this demo do?

- Switches to [manual track subscriptions](https://docs.daily.co/reference#%EF%B8%8F-setsubscribetotracksautomatically) to pause / resume video tracks as they are paged in and out of view
- Introduces a new video grid component that manages pagination and sorts participant tiles based on their active speaker status

Please note: this demo is not currently mobile optimised

### Getting started

```
# set both DAILY_API_KEY and DAILY_DOMAIN
mv env.example .env.local

yarn
yarn workspace @custom/live-streaming dev
```

Note: this example uses an additional env `MANUAL_TRACK_SUBS=1` that will disable [automatic track management](https://docs.daily.co/reference#%EF%B8%8F-setsubscribetotracksautomatically).

## How does this example work?

When call sizes exceed a certain volume (~12 or more participants) it's important to start optimising for both bandwidth and CPU. Using manual track subscriptions allows each client to specify which participants they want to receive video and/or audio from, reducing how much data needs to be downloaded as well as the number of connections our servers maintain (subsequently supporting increased participant counts.)

This demo introduces a new paginated grid component that subscribes to any tiles that are in view. Our subscription API allows for the subscribing, pausing, resuming and unsubscribing of tracks. The grid component will:

1. Subscribe to all participants on the current and adjacent pages.
2. Pause participants video if they are not in view (i.e. on the current page.) Pausing is optimal over unsubscribing in this particular use case since unsubscribing a track results in a full teardown of the data stream. Re-subscribing to a track is perceivably slower than pausing and resuming.
3. Play / resume participant's video when they are on the current page.
4. Unsubscribe from a participant's video if they are not on an adjacent page (explained below.)

When you pause a track, you are keeping the connection for that track open and connected to the SFU but stopping any bytes from flowing across that connection. Therefore, this simple approach of pausing a track when it is offscreen rather than completely unsubscribing (and tearing down that connection) speeds up the process of showing/hiding participant videos while also cutting out the processing and bandwidth required for those tracks.

It is important to note that a subscription and the underlying connections it entails does still result in some overhead and this approach breaks down once you get to even larger calls (e.g. ~50 or more depending on device, bandwidth, geolocation etc). In those scenarios it is best to take advantage of both pausing and unsubscribing to maximize both quickly showing videos and minimizing connections/processing/cpu. This example showcases how to do this by subscribing to the current page's videos (all videos resumed) as well as the adjacent pages' videos (all videos paused) and unsubscribing to any other pages' videos. This has the affect of minimizing the overall number of subscriptions while still having any video which may be displayed shortly, subscribed with their connections ready to be resumed as soon as the user pages over.

## Deploy your own on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/daily-co/clone-flow?repository-url=https%3A%2F%2Fgithub.com%2Fdaily-demos%2Fexamples.git&env=DAILY_DOMAIN%2CDAILY_API_KEY&envDescription=Your%20Daily%20domain%20and%20API%20key%20can%20be%20found%20on%20your%20account%20dashboard&envLink=https%3A%2F%2Fdashboard.daily.co&project-name=daily-examples&repo-name=daily-examples)
