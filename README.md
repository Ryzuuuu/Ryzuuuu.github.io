# Neelabja Mukhopadhyay · Portfolio

A one-page portfolio staged around a vintage console on a lacquered plinth. The exhibit stays fixed behind the page and every chapter turns the camera to a different piece of it: the **monitor** for Profile, the **console's mechanism** for Expertise, the **cartridge bay** for each work, and the **receiver** for Correspondence. Drag to turn it, or click a piece to jump to its chapter.

Built with React 19, Vite, React Three Fiber, drei and Tailwind CSS. Set in Cormorant Garamond and Jost.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint
```

## Editing content

All copy lives in **`src/constants.js`**: profile, the "presently building" line, chapters, stats, the expertise list, works and side projects. Section headings and paragraphs are in `src/sections/*`. The monitor's title cards read from the same file, so they stay in sync.

The contact form has no backend. It opens the visitor's mail app with the message filled in and sends it to `profile.email`.

## How the page drives the exhibit

Any element with **`data-shot`** is a scroll anchor. While the middle of the viewport is inside it, the camera holds that shot; near the boundary it cross-fades into the next one.

| Attribute | Effect |
| --- | --- |
| `data-shot="about"` | Camera shot from `src/canvas/shots.js` (target, angle, distance, where it sits on screen) |
| `data-param="2"` | Passed to the shot, e.g. which work, so the camera steps around the island |
| `data-screen="work-2"` | Title card shown on the monitor (`MonitorScreen.jsx`); defaults to the shot name |
| `data-chapter="work"` | On a section: which nav item is active and which piece glows |

To add a section, give it a `data-shot`, add a shot and a caption in `shots.js`, and optionally a monitor card in `MonitorScreen.jsx`.

## Structure

```
src/
├── App.jsx                  # Fixed exhibit + atmosphere layers + scrolling chapters
├── director.js              # Scroll position → shot blend, chapter, monitor screen
├── constants.js             # All editable content
├── index.css                # Tailwind layers, palette helpers, scrims, reveal motion
├── components/
│   ├── Navbar.jsx           # Chapter nav, progress hairline, phone menu
│   ├── ExhibitCaption.jsx   # Museum label for what the camera is studying
│   ├── ExhibitLoader.jsx    # Loading line, drawn where the exhibit will appear
│   ├── SectionHeading.jsx   # Numeral, rule, eyebrow, serif title
│   └── SceneBoundary.jsx    # Hides the 3D scene if WebGL fails
├── hooks/useReveal.js       # Fade-in on first scroll into view
├── sections/                # Hero, Manifesto, About, Expertise, Work, Contact, Colophon
└── canvas/                  # Lazy-loaded 3D chunk (except shots.js / targets.js)
    ├── Stage.jsx            # <Canvas>, lights, follow spot, floating island
    ├── CameraRig.jsx        # Blends shots, damps the camera, lens-shifts the subject aside
    ├── ConsoleModel.jsx     # GLB, palette, chapter glow, machinery, cartridge reseat, picking
    ├── MonitorScreen.jsx    # Amber title cards with a CRT channel change
    ├── Plinth.jsx           # The island: lacquered plinth, gold band, under-glow
    ├── Signal.jsx           # Ripples from the receiver during Correspondence
    ├── shots.js             # Camera shots and captions (no three.js imports)
    └── targets.js           # Which piece opens which chapter; shared drag/focus state
public/
└── console.glb              # Optimized model (~1.2 MB)
```

## Performance notes

- **Scrolling never re-renders React.** The director reads scroll once per frame and writes the camera state and CSS custom properties directly; React only hears when the chapter, monitor screen or hovered piece changes.
- **three.js loads after the text.** The 3D scene is a separate chunk, and devices without WebGL never download it.
- **Pixel ratio is capped at 1.5** and drops to 1 if the frame rate falls. Shadows and the environment map are baked once.
- **Picking uses invisible boxes**, not the 110k-vertex model, so mouse moves cost almost nothing.
- **The model is ~1.2 MB instead of ~20 MB.** The original `scene.gltf` pointed at 32 textures that were never committed, so they 404'd. It was rebuilt as `console.glb` with a flat color palette, no unused UV/tangent data, light simplification, quantization and meshopt compression. drei decodes meshopt out of the box.
- Respects `prefers-reduced-motion`: the camera cuts instead of gliding, and idle motion stops.

## Deploying to GitHub Pages

This is a user site (`Ryzuuuu.github.io`), so Vite's default `base: '/'` is correct. Pages must serve the **built** `dist/` folder, not the repo source. Use a GitHub Actions workflow running `npm ci && npm run build` with `actions/upload-pages-artifact` + `actions/deploy-pages`, and set *Settings → Pages → Source* to **GitHub Actions**.

## Credits

3D model: [Lumen VGS Pack](https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3) by dark_igorek on Sketchfab. Check the model's license on Sketchfab before you publish.
