# Present Hunt

A mobile-first scavenger hunt app built with Next.js for simple Vercel deployment and no server-side database in v1.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## How V1 Works

- Hunt content lives in [`src/content/hunt.json`](/Users/aaron/Development/present-hunt/src/content/hunt.json)
- Each hidden QR code links directly to the next clue page
- No cookies, sessions, or server-side database are required

## Customising The Hunt

Edit [`src/content/hunt.json`](/Users/aaron/Development/present-hunt/src/content/hunt.json):

- intro copy and finish copy
- theme colors
- ordered steps
- clue type, body, hint, and step order
- image paths and video embed URLs

Add any local clue images to `public/` and reference them with paths like `/media/my-clue.jpg`.

## Routes

- `/` intro and start page
- `/hunt` redirects to the first clue
- `/hunt/[stepId]` clue pages
- `/done` completion page
- `/dev/qrs` printable QR sheet
