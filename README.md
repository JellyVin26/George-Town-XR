# George Town XR
Interactive mobile alpha

## Open
[Play George Town XR](https://jellyvin26.github.io/George-Town-XR/)
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
Three real George Town locations: Cheong Fatt Tze · Blue Mansion (Chinese/Western craftsmanship), Leong San Tong Khoo Kongsi (clanhouse, stage and square), Pinang Peranakan Mansion (museum interpretation). Each has its own original SVG, English/BM story, schematic object study, two tour viewpoints, evidence and question. Official source links appear in every experience. Licensed site photos are bundled in `assets/photos/`. Compare pairs an exterior photograph with an aligned line study of that same image, not a historical before/after. Objects and Tour open on site photos, with rotation and 360° simulations available separately. The photo views are not 360° panoramas. Credits and licenses appear in the app and below. All original SVGs dedicated to CC0; schematic, not measured reconstructions, archival photographs or authentic collection-object scans.

## Prototype boundaries
Camera is opt-in in On-site mode. Compare and Objects track printed/displayed markers; Stories and My trail only preview video. Frames are processed locally, not recorded or uploaded. Remote never requests camera. Navigation, hiding the page, switching modes or Stop terminates tracking and camera tracks. Objects renders depth-buffered, photo-referenced 3D building geometry with orbit, zoom and projected hotspots. Tour turns a 3D camera in place at two illustrative exterior viewpoints. Neither 3D scene uses scans, surveyed dimensions or photographic panoramas; live AR renders the same illustrative building meshes using a pose estimated from the stop marker. A 2D illustration is available if canvas rendering is unavailable. Speech uses browser/device voices; availability and pronunciation vary. Play/pause is supported; visual sample timing is 30 seconds. Transcript always available. Interface works offline using Georgia/Arial fallbacks; optional Google Fonts require internet.

Completed trail stops, current evidence/answer, selected stop, language and mode persist in localStorage on the same browser/device. Restart requires confirmation and can be undone during the session. Private mode or browser storage restrictions can prevent persistence. No data leaves the app.

## Available stops
All three real locations are directly selectable. Complete stops in any order; each preserves its own evidence/answer and can be revisited. Content version 2 resets obsolete app progress keys only, retaining language/mode and unrelated browser data. Old answers cannot complete new locations.

## Mobile app presentation
Fixed app header and bottom tabs; independently scrolling content; thumb-sized controls; compact Explore catalogue; immersive viewers; bottom-sheet dialogs on phones. Desktop opens in a phone-sized frame. `mobile.css` contains the presentation refinement. Six labelled screenshots regenerated after verification.

## Usability
Help is available on every screen.

## Files
- index.html, styles.css, app.js: editable prototype
- screenshots/: six labelled PNGs, captured at 390 CSS pixels / 2× resolution
- screenshots.html: screenshot gallery

## Try marker AR
1. Open the app on HTTPS or localhost. Select On-site and a stop, then Compare or Objects.
2. Choose **Open live marker AR**, then **Open marker**. Print the marker or show it on a second screen. Keep the white border visible.
3. Choose **Start camera**. Put the marker on a flat surface, point the in-app camera down at it at an angle, and keep the complete square in the frame. The 3D building moves with the marker and hides when it is lost.

Both Compare and Objects render the stop’s hand-built 3D mesh over the live camera. Pose uses approximate camera intrinsics, not device calibration, building recognition or markerless world tracking. Objects also retains its camera-free orbit viewer. Physical phones not tested.

## Photo credits

Photos were resized and re-encoded. Explore crops them; the `-study.jpg` files are grayscale, edge-enhanced adaptations under the same license as the corresponding exterior photo.

| Photo | Photographer and source | License |
|---|---|---|
| `blue-mansion.jpg` | [Graystravels](https://commons.wikimedia.org/wiki/File:Blue_Mansion_-_front_face_-_Penang.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `khoo-kongsi.jpg` | [Photo by CEphoto, Uwe Aranas](https://commons.wikimedia.org/wiki/File:Penang_Malaysia_Leong-San-Tong-Khoo-Kongsi-02.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `pinang-mansion.jpg` | [Supanut Arunoprayote](https://commons.wikimedia.org/wiki/File:Pinang_Peranakan_Mansion_(I).jpg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `blue-mansion-tour.jpg` | [Adam Jones](https://commons.wikimedia.org/wiki/File:Cheong_Fatt_Tze_-_The_Blue_Mansion_-_George_Town_-_Penang_-_Malaysia_-_01_(35076715810).jpg) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| `khoo-kongsi-tour.jpg` | [Supanut Arunoprayote](https://commons.wikimedia.org/wiki/File:Khoo_Kongsi_(II).jpg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `pinang-mansion-tour.jpg` | [Supanut Arunoprayote](https://commons.wikimedia.org/wiki/File:Pinang_Peranakan_Mansion_(III).jpg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
