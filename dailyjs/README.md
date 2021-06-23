# Daily JS Examples

Run an examples via `yarn workspace @dailyjs/basic-call dev` (replacing `basic-call` with the name of the demo) from the project root

Note: please ensure your rooms are setup to use [web sockets](https://docs.daily.co/reference#domain-configuration)

Note: examples are served using [nextjs](https://nextjs.org/)

---

## Getting started

```
// run locally, from project root
yarn
yarn workspace @dailyjs/[example-to-run] dev
```

We recommend starting with the [basic call](./basic-call) example, showcasing the common flow of a call Daily call, device management and error handling.

## Shared code

These examples re-use some common components, contexts, hooks and libraries. These can be found in the [shared](./shared) folder.

---

## Where to get started?

### [🤙 Basic call](./basic-call)

The basic call demo (derived from our prebuilt UI codebase) demonstrates how to create a video and audio call using Call Object mode.

### [💬 Text chat](./text-chat)

Send messages to other participants using sendAppMessage
