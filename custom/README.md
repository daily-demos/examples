# Custom Examples (Daily JS)

### [🤙 Basic call](./basic-call)

The basic call demo (derived from our prebuilt UI codebase) demonstrates how to create a video and audio call using Call Object mode.

### [💬 Text chat](./text-chat)

Send messages to other participants using sendAppMessage

### [📺 Live streaming](./live-streaming)

Broadcast call to a custom RTMP endpoint using a variety of different layout modes

### [📺 Live transcription](./live-transcription)

Transcribe audio from call participants and view transcript alongside video

### [⏺️ Recording](./recording)

Record a call video and audio using both cloud and local modes

### [🔥 Flying emojis](./flying-emojis)

Send emoji reactions to all clients using sendAppMessage

### [📃 Pagination](./pagination)

Demonstrates using manual track management to support larger call sizes

---

## Getting started

We recommend starting with the [basic call](./basic-call) example, showcasing the common flow of a call Daily call, device management and error handling.

Run an examples with `yarn workspace @custom/[demo-name] dev` (replacing `[demo-name]` with the name of the demo you'd like to run e.g. `basic-call`.

- Please ensure your Daily rooms are setup to use [web sockets](https://docs.daily.co/reference#domain-configuration)
- Follow the instructions within each demo first, making sure to set all the necassary local environment variables etc
- Examples are served using [nextjs](https://nextjs.org/)

## Shared code

These examples re-use some common components, contexts, hooks and libraries. These can be found in the [shared](./shared) folder.

## Deploy your own on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/daily-co/clone-flow?repository-url=https%3A%2F%2Fgithub.com%2Fdaily-demos%2Fexamples.git&env=DAILY_DOMAIN%2CDAILY_API_KEY&envDescription=Your%20Daily%20domain%20and%20API%20key%20can%20be%20found%20on%20your%20account%20dashboard&envLink=https%3A%2F%2Fdashboard.daily.co&project-name=daily-examples&repo-name=daily-examples)
