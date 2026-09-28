# Giữ tiếng nói

Vietnamese 3D point-and-click puzzle about the Party's revolutionary press, using Dân Chúng (1938–1939) as a documented historical anchor.

## Run
Node.js 22.12+ or a supported newer release. Tested locally on Node 26.4.0.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Local server is bound to 127.0.0.1.

```sh
npm test
npm run check:content
npm run build
```

## Play
Start → choose a station → click/inspect objects → turn pages or view the reverse → record evidence → edit the story → choose text and supporting evidence → check → open the story → advance.
Drag to look around; station buttons or keys 1/2/3 move the first-person viewpoint. Escape closes the reader. The object list supports keyboard/touch and a non-WebGL fallback.
Progress is stored locally when available. Use the final page's replay button to reset.

## Current scope
Playable foundation: room, six evidence objects, three data-driven puzzles, notebook, feedback, hint tiers, progress, story overlays and final page.
This is a prototype, not the finished art direction. Videos and historical posters are pending. Educational headlines and the room are labeled reconstructions.

## Continue efficiently
Start with [docs/START-HERE.md](docs/START-HERE.md). One canonical progress file: [plans/mvp/CHECKLIST.md](plans/mvp/CHECKLIST.md).

## Media
Generated paper texture: `public/assets/textures/archival-paper.png`.
Put local MP4s in `public/assets/videos/`, posters in `public/assets/posters/`, then update the chapter `video`/`poster` paths. Register origin, rights, verification and any generation prompts in `public/assets/manifest.json`.
The current story fallback is text; no placeholder is represented as a real video.
