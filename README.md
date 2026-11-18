# George Town XR
Interactive mobile alpha

## Open
Double-click `index.html` for illustrations; no build or login. Optional camera needs HTTPS or localhost. Desktop: run `python -m http.server 8000 --bind 127.0.0.1` from this folder, open http://localhost:8000. Phones need HTTPS hosting (for example GitHub Pages), not a desktop's plain HTTP LAN address.
Open `screenshots.html` for the six labelled, full-length mobile screenshots.

## Six connected screens
1. Explore: three-stop selection, English/Bahasa Melayu, On-site/Remote, five experience entries.
2. Historical Streetscape Overlay: aligned photo/line-study comparison, site context, optional live marker AR.
3. Artifact Explorer: site photos, optional live marker AR, and a separate camera-free 3D viewer with rotate, zoom and hotspots.
4. Virtual Heritage Tour: site-specific viewpoint navigation, draggable panoramic scene, directional controls, sourced context.
5. Community Story: direct/marker opening, physical-detail highlight, device speech play/pause, transcript, educational-paraphrase attribution.
6. Discovery Trail: three stops, evidence inspection, question feedback, progress, remote completion, save/leave/resume.

## Assignment scenario
Three real George Town locations: Cheong Fatt Tze · Blue Mansion (Chinese/Western craftsmanship), Leong San Tong Khoo Kongsi (clanhouse, stage and square), Pinang Peranakan Mansion (museum interpretation). Each has its own original SVG, English/BM story, schematic object study, two tour viewpoints, evidence and question. Official source links appear in every experience; see `SOURCES.md`. Licensed site photos are bundled in `assets/photos/`. Compare pairs an exterior photograph with an aligned line study of that same image, not a historical before/after. Objects and Tour open on site photos, with rotation and 360° simulations available separately. The photo views are not 360° panoramas. Credits and licenses appear in the app and `SOURCES.md`. Run `node photo-check.cjs` for offline photo checks. All original SVGs dedicated to CC0; schematic, not measured reconstructions, archival photographs or authentic collection-object scans.

## Prototype boundaries
Camera is opt-in in On-site mode. Compare and Objects track printed/displayed markers; Stories and My trail only preview video. Frames are processed locally, not recorded or uploaded. Remote never requests camera. Navigation, hiding the page, switching modes or Stop terminates tracking and camera tracks. Objects renders depth-buffered, photo-referenced 3D building geometry with orbit, zoom and projected hotspots. Tour turns a 3D camera in place at two illustrative exterior viewpoints. Run `node depth-check.cjs` to verify the Pinang façade across 25 angles. Neither 3D scene uses scans, surveyed dimensions or photographic panoramas; live AR renders the same illustrative building meshes using a pose estimated from the stop marker. A 2D illustration is available if canvas rendering is unavailable. Speech uses browser/device voices; availability and pronunciation vary. Play/pause is supported; visual sample timing is 30 seconds. Transcript always available. Interface works offline using Georgia/Arial fallbacks; optional Google Fonts require internet.

Completed trail stops, current evidence/answer, selected stop, language and mode persist in localStorage on the same browser/device. Restart requires confirmation and can be undone during the session. Private mode or browser storage restrictions can prevent persistence. No data leaves the app.

## Verification
`verification.json` records the real Edge/Playwright browser check. Re-run from this folder:

    npm install --no-save playwright
    node check.cjs

Requires Microsoft Edge installed. `check.cjs` exercises all 15 Explore entries, both languages, distinct site content and official source links, content-version migration,, both tracking recovery paths, object controls/hotspots, tour drag/navigation, story controls, wrong/right trail answers, leave/resume across reload, remote completion, language and narrow/desktop layouts. It regenerates all six PNG screenshots plus two desktop captures and resets its own browser profile afterward.

## Available stops
All three real locations are directly selectable. Complete stops in any order; each preserves its own evidence/answer and can be revisited. Content version 2 resets obsolete app progress keys only, retaining language/mode and unrelated browser data. Old answers cannot complete new locations.

## Mobile app presentation
Fixed app header and bottom tabs; independently scrolling content; thumb-sized controls; compact Explore catalogue; immersive viewers; bottom-sheet dialogs on phones. Desktop opens in a phone-sized frame. `mobile.css` contains the presentation refinement. Six labelled screenshots regenerated after verification.

## Usability
`NIELSEN-HEURISTICS.md` maps all ten Nielsen heuristics to implemented UI behaviour. Help is available on every screen.

## Files
- index.html, styles.css, app.js: editable prototype
- screenshots/: six labelled PNGs, captured at 390 CSS pixels / 2× resolution
- screenshots.html: screenshot gallery
- check.cjs: repeatable browser check
- verification.json: actual verification result

## Try marker AR
1. Open the app on HTTPS or localhost. Select On-site and a stop, then Compare or Objects.
2. Choose **Open live marker AR**, then **Open marker**. Print the marker or show it on a second screen. Keep the white border visible.
3. Choose **Start camera**. Put the marker on a flat surface, point the in-app camera down at it at an angle, and keep the complete square in the frame. The 3D building moves with the marker and hides when it is lost.

Both Compare and Objects render the stop’s hand-built 3D mesh over the live camera. Pose uses approximate camera intrinsics, not device calibration, building recognition or markerless world tracking. Objects also retains its camera-free orbit viewer. Run `node ar-check.cjs` for real detector coverage using synthetic video frames, and `node camera-check.cjs` for camera lifecycle/permission coverage. Physical phones not tested.
