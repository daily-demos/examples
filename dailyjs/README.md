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

## Examples

### [🤙 Basic call](./basic-call)

Simple call demo derived from our prebuilt UI codebase

---

## Coming soon

### [🔌 Device management](./device-management)

Manage media device, handle errors and set initial device mute state

### [🧑‍🤝‍🧑 1-to-1 calls](./examples/1-to-1-calls)

Simple p2p (single partcipant) call demo

### [🎚️ Audio gain monitor](./examples/audio-monitor)

Use AudioContext to create a audio gain meter

### [👱 Hair check](./examples/hair-check)

Check your audio and video before joining a call

### [🚪 Knock for access](./examples/knock-for-access)

Pre-authenticate and request access before joining a call. For owners, approve / deny requests

### [✋ Raise your hand](./examples/knock-for-access)

Use sendAppMessage to raise your hand to speak (stateless)

### [🔥 Reactions](./examples/reactions)

Use sendAppMessage to send emoji reactions during a call

### [💬 Text Chat](./examples/text-chat)

Create a fully featured text chat (stateless)

### [⏭️ Pagination](./examples/pagination)

Optimise call performance by paginating (and pausing / resuming tracks)

### [💯 Large calls](./examples/large-calls)

Optimisations for larger calls (100+ particpants)

### [🎙️ Live streaminng](./examples/live-streaming)

Example for how to broadcast and composite your calls via RTMP

### [⏺️ Cloud recording & composition](./examples/cloud-recording)

Record your call to Daily's cloud and composite the results via the REST API

### [📼 Local recording](./examples/local-recording)

Record calls to your local computer

### [🖥️ Screen sharing](./examples/audio-sharing)

Share your screen with participants during a call

### [🔊 Audio sharing](./examples/audio-sharing)

Share tab audio during a call and allow participants to manage audio mix

### [🎛️ Quality controls](./examples/quality-controls)

Optimise or enhance video and audio quality

## Stateful examples

### [User spotlighting](./examples/user-spotlighting-firebase)

Set a participant to be spotlighted during a call

### [Breakout rooms](./examples/breakout-rooms-firebase)

Allow participants to form or join breakout rooms

---

## Other

### [shared](./examples/shared)

Common components, context, hooks and libraries used across example projects
