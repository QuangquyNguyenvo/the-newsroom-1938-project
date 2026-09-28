# Start here (small context)

## Accepted direction
One-room first-person 3D point-and-click puzzle. Player searches notebooks/documents, compares clues and builds three educational news stories. Each success opens a story/video; final reward is a completed newspaper. Theme must center the Party. Visuals: aged paper, deep red, restrained yellow, contrast, short engaging Vietnamese thoughts without em dashes.
Keep first release small enough for one week. Three.js authorized; user selected GSAP for UI animation on 2026-09-27. No other animation toolkit selected.

## Read only what you need
| Task | Files |
|---|---|
| Add/edit history, puzzle, video | src/content/chapters.js; docs/CONTENT-CONTRACT.md |
| Fix evidence, unlock, save | src/game/state.js; tests/state.test.js |
| Art/layout of 3D room | src/scene/room.jsx; src/scene/materials.js |
| Camera, picking, input | src/scene/engine.js |
| Reader, notebook, answer UI | src/main.js; src/styles.css; src/game/newspaper.js; src/editor.css |
| Vietnamese font faces | src/fonts.css; package.json |
| Shared archival UI / GSAP transitions | src/archival-ui.css; src/ui/motion.js; src/main.js |
| Responsive layout / mobile editing | src/responsive.css; src/game/newspaper.js; src/main.js |
| Continue schedule | plans/mvp/CHECKLIST.md; selected phase only |

## Commands
`npm run dev` · `npm test` · `npm run check:content` · `npm run build`.
Use the installed dependencies. Do not run npm install again unless package files changed.
No backend, account, remote assets at runtime or external font requests. Avoid framework migrations.

## Module contracts
room.jsx exports stations and a declarative Room component. R3F Target groups register camera focus objects and handle pointer events; Drei loads models/images and supplies notebook LOD.
engine.js exposes goTo(id), canvas, setPaused(bool), dispose(); onPick(id) opens UI after prop animation. Rendering owns no puzzle state. It renders on demand, caches shadows and filters invisible LOD levels while picking. #viewport data attributes expose render mode/frame count/calls/triangles/LOD levels for browser inspection.
state.js owns pure verification and versioned local saves; chapter IDs are stable.
content/chapters.js owns source entries, evidence IDs, objects/pages, three slot puzzles and optional media.
main.js translates those records to HTML. No historical content should be duplicated in scene files.
motion.js owns short GSAP dialog/HUD/text transitions, interruption and cleanup. main.js owns native dialog focus/cancel flow. Entrance uses opacity to retain keyboard focus; close uses autoAlpha then native close. MatchMedia handles reduced motion. archival-ui.css loads after the baseline and newspaper CSS and owns the shared print style.
responsive.css is the final layout layer. Below 700px the mission uses a compact grid with a details toggle. Below 900px newspaper and tray are switchable views; choosing a word returns to paper and focuses the next empty slot. Desktop displays both panels. Native-dialog headers/tabs remain reachable when scrolled on compact layouts. Keep selections during breakpoint changes; do not remount the puzzle on resize.

## Known limitations
Room uses local Poly Haven CC0 1K PBR wood/plaster/metal maps; provenance and hashes are in the asset manifest. Box UVs use physical dimensions. Paper props are thin grouped sheets with canvas labels; books have exposed page edges. Notebook retains a far LOD; lamp and printing press now use downloaded models. Props stay still while camera focuses. Texture disposal includes data maps and late loads. Reader uses GSAP page turns, swipe and keyboard arrows; no hinged 3D cover. Photo uses supplied newspaper collage as visual reference, not evidence of the arrest.
Movement is between preset first-person stations with limited drag look, not WASD free roaming.
Video integration uses authored local file paths and controls; actual clips are not supplied. The current completion effect is a CSS expansion, not a camera zoom from an archival photo.
Answer UI is a three-column newspaper reconstruction with a loose-word tray, click/place or drag/drop and evidence cards. src/game/newspaper.js owns placement UI; state.js remains authoritative for validation. Reduced motion disables placement/reveal effects. Fontsource fonts are self-hosted with Vietnamese/Latin unicode ranges and shipped OFL licenses.
The supplied newspaper collage is visual reference only, not evidence of a specific event; provenance is recorded in the asset manifest.
The six objects are mostly conspicuous; harder hidden-item staging is pending. No mystery plot is falsely attributed to actual editors.

## Next work
See CHECKLIST for measured status and gates. Do not claim a phase complete merely because it builds.

## Scene scale
World units are metres. room.jsx places construction coordinates inside a JSX group at scale 0.75: room width 6 m, desk top 0.81 m, shelf height 1.77 m. Station cameras use world coordinates with 1.65 m eye height. Tile UVs use 2/3 construction units, giving 0.5 m per tile in world space (visual design choice, not verified historical size). Document footprints and notebook were reduced individually. LOD distances are world distances; do not multiply camera positions by roomRoot again.

## Downloaded props and inspection
room.jsx uses Drei useGLTF for local Poly Haven CC0 models: wooden_table_02 (both tables), wooden_bookshelf_worn, painted_wooden_cabinet and vintage_oil_lamp. Models are normalized by bounds, placed in the JSX room group and cast shadows. Suspense loads them through Drei; cloned instance resources are released on unmount. drawer_cabinet and vintage_cabinet_01 were researched/downloaded candidates, not used. Generic vintage models are not documented original equipment. Shelf items match measured mesh shelf heights.
engine.activate focuses the camera over 850 ms, leaves props still, then opens the reader; closing returns the saved station view. Reduced motion skips travel. focusObject(id) supports object-list selection. Inspection is separate from puzzle state.
period-redesign.css is the final styling layer after responsive.css: material-specific generated newsprint/folder backgrounds, asymmetric newspaper columns and compact expandable HUD. Room lighting uses exposure .85, hemisphere .9, daylight 1.45; generated limewash texture is matte illustration. Preview for this session runs at http://127.0.0.1:5174/ because 5173 belongs to another app; saves are origin-specific.

## Room layout and audio update
Desk and all desk props now sit near centered window; chair faces working edge, proof press on shared desk (not a typewriter). Ceiling owns generated ceiling-lime.png and beams; wall shelf carries mantel_clock_01. Station IDs preserved. Object reader data-kind chooses notebook cloth/ruled page, paper or folder skins in period-redesign.css; openPanel resets kind. ui/sound.js owns local Kenney CC0 OGG one-shots and persisted mute, playing events appear on #app dataset for inspection. No loops/autoplay. Camera focus and return remain engine-owned; GSAP reader entrance is fade, no paper jump.

## Reader and clearance update
Compact previous/next arrows plus horizontal swipe and keyboard turn pages in place via motion.turnPage. Back arrow replaces modal X. reader-stage allows vertical scrolling. Cabinet now stands beside desk at x2.55 rather than under it; wall sign and clock have separate vertical bounds. Red cloth is not multiplied by a dark red tint.

## Physical reader and downloaded context
Object readers use a portrait B5 aspect (176:250); motion.turnPage overlays a two-sided leaf rotating 180 degrees above the next page with shadow, no fade swap. Manuscript clue requires highlighting three inline demands; proof opens editor, other clues have distinct record actions. Sources collapse under a disclosure. Intro owns reconstruction notice; transient thoughts hide after 5.5 seconds and do not reveal object answers. Obsolete optional draft evidence is filtered on load.
Clock uses uniform scale; wall labels retain source-canvas aspect. Loose papers are B5 world dimensions. Original supplied collage remains unchanged; scene shader keys white surround. Downloaded public-domain Saigon 1930 street is window backdrop. proofing-press local CC0 GLB replaces procedural machine, placed separately beside desk. Audio maps door/paper/book/drawer/print to downloaded recordings; icon mute remains persisted. Brave private check tab avoids IAB user interaction during testing.

## Ambient interactions and entrance
content/room-props.js owns six non-evidence props (window, lamp, chair, ink, clock, calendar). Room.interact owns visual mutations; R3F pointer events route ambient picks immediately without inspection lock. GSAP object tweens invalidate on demand and are disposed; reduced motion sets final transforms. Drawer cabinet moved to construction [-2.1,0,-.8] beside left of desk. Added calendar, ink bottle and pencils.
main.enterRoom waits for actual door recording ended; motion.enterDoor runs panels for loaded audio duration (5.57 s), Escape skips. Muted/failed playback uses 2.4 s visual fallback. ui/sound.js returns completion promises, owns WebAudio type/clock ticks and audio cleanup. Thoughts type at 28 ms per glyph with throttled ticks, aria-busy during writing; reduced motion shows full text. Panel reader hides native scrollbar visuals and locks body overflow during page turns.

## React Three Fiber availability
User authorized R3F and Drei. React 19, React DOM 19, Fiber 9 and Drei 10 are pinned in package.json. The Canvas, room hierarchy, pointer events and model loading now use R3F/Drei. Puzzle UI and camera inspection remain game-specific.


## R3F renderer migration
2026-09-28: Drei installed and React Three Fiber Canvas now owns WebGL context, scene, camera, resize and demand-mode frame loop in src/scene/engine.js. The room hierarchy and pointer events are declarative in room.jsx. Drei useGLTF/useTexture/Detailed handle models, photos and notebook LOD. The HTML puzzle UI and camera inspection controller remain intentionally separate. Browser confirmed desk rendering, object-list drawer camera/reader, return and press-station move. Production JS rose from about 742 kB to 1300 kB minified; optimization and measured FPS are not claimed. Final gates pass. The old imperative room.js was removed after visual and interaction checks.




