# Neelabja Mukhopadhyay · Portfolio

**Live site: https://ryzuuuu.github.io/**

A one-page portfolio built around a 3D retro console standing on a teal island. The console stays fixed behind the page and every chapter does something to it: the **how a project goes** steps rebuild it from wireframe to clay to finished, **About** turns to the monitor, **Tools** opens up the mechanism, each **work** reloads the cartridge and runs that project's instrument on the monitor, and **Contact** sets the antenna broadcasting. Drag to turn it, or click a piece (the monitor, console, controllers, cassettes or antenna) to jump to its chapter.

Built with React 19, Vite, React Three Fiber, drei, Lenis and Tailwind CSS. Set in Bricolage Grotesque, Schibsted Grotesk, Martian Mono and Tiro Bangla.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # production build in dist/
pnpm preview      # serve the production build
pnpm lint
```

## Deployment

Live at **https://ryzuuuu.github.io/**. Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which lints, builds and publishes `dist/` to GitHub Pages. In the repo's Pages settings, the source must be **GitHub Actions**. Pull requests run the same checks without publishing.

## Editing content

All copy lives in **`src/constants.js`**: profile, the intro, chapters, the three process steps, about, tools, projects and side projects. Section layouts are in `src/sections/*`. The monitor reads from the same file, so it stays in sync.

Each project has an `id` that selects its instrument in `src/canvas/instruments.js`. Instruments use the project's real thresholds and formulas where it has them, and anything invented for the picture is marked SIMULATED on screen.

The "last commit" line on the opening screen comes from GitHub's public events API, requested by the visitor's browser and cached for 30 minutes. If GitHub refuses, the line doesn't appear.

## Colour

The palette sits verbatim at the top of **`src/index.css`** (`--bg`, `--text`, `--primary`, `--secondary`, …). Nothing else hard-codes a colour:

- Tailwind classes (`bg-surface`, `text-ink`, `text-muted`, `border-line`, `text-accent`) map to *roles* that point at palette variables.
- Each chapter is `data-tone="light"` or `"dark"`. As you scroll, the director flips `data-tone` on `<html>`, the roles swap, and the whole page cross-fades between mint and deep teal.
- The plinth and the monitor read the same variables through `src/palette.js`. The console keeps its own textures, so the palette doesn't recolour it.

## How the page drives the exhibit

Any element with **`data-shot`** is a scroll anchor. While the middle of the viewport is inside it, the camera holds that shot; near the boundary it cross-fades into the next one. Below 1024 px the console stays in a fixed window over the top half of the screen, and the copy scrolls underneath it.

| Attribute | Effect |
| --- | --- |
| `data-shot="about"` | Camera shot from `src/canvas/shots.js` (target, angle, distance, where it sits on screen) |
| `data-param="2"` | Passed to the shot, e.g. which work or which process step |
| `data-screen="work-2"` | What the monitor runs (`instruments.js`); defaults to the shot name. `process-0`/`process-1` also switch the console to wireframe/clay |
| `data-chapter="work"` | Which nav item is active and which piece glows |
| `data-tone="dark"` | Light or dark page colours while this chapter leads |
| `data-reveal` / `.reveal` | Animate in the first time it scrolls into view |

To add a section, give it a `data-shot`, add a shot and a caption in `shots.js`, and optionally a monitor screen in `instruments.js`.

## Structure

```
src/
├── App.jsx                  # Fixed exhibit + scrims + scrolling chapters
├── director.js              # Lenis, scroll → shot blend, tone, velocity
├── palette.js               # Reads the CSS palette for three.js and canvas
├── constants.js             # All editable content
├── index.css                # Palette, tone roles, type scale, reveal motion
├── components/
│   ├── Navbar.jsx           # Chapter nav, progress line, phone menu
│   ├── Lines.jsx            # Headlines that rise line by line
│   ├── SectionHeading.jsx   # Chapter name, headline, intro
│   ├── ExhibitCaption.jsx   # Placard saying what the monitor is running
│   ├── ExhibitLoader.jsx    # Thin progress line, drawn where the exhibit will appear
│   └── SceneBoundary.jsx    # Hides the 3D scene if WebGL fails
├── hooks/
│   ├── useReveal.js         # Marks elements visible on first scroll into view
│   └── useLastPush.js       # Most recent public push, from GitHub
├── sections/                # Hero, Process, About, Toolbox, Work, Contact, Colophon
└── canvas/                  # Lazy-loaded 3D chunk (except shots.js / targets.js)
    ├── Stage.jsx            # <Canvas>, lights, follow spot, the island leaning into scrolls
    ├── CameraRig.jsx        # Blends shots, damps the camera, reacts to scroll speed
    ├── ConsoleModel.jsx     # GLB, shadows, wireframe/clay/finished, glow, cartridge, picking
    ├── MonitorScreen.jsx    # The tube: bloom, scanlines, CRT channel change, cursor tracking
    ├── instruments.js       # Everything drawn on the tube, one instrument per project
    ├── Plinth.jsx           # The island: teal slab, bright lip, wine inlay, shadow/glow pool
    ├── Signal.jsx           # Ripples from the antenna during Contact
    ├── shots.js             # Camera shots and captions (no three.js imports)
    └── targets.js           # Which piece opens which chapter; shared drag/focus state
public/
├── console.glb              # Optimized model, full textures (~5.4 MB)
└── console-phone.glb        # Same model, quarter-size textures (~3 MB)
```

## Performance notes

- **Scrolling never re-renders React.** One animation loop runs Lenis and writes camera state and CSS custom properties directly; React only hears when the chapter, tone, monitor screen or hovered piece changes.
- **three.js loads after the text.** The 3D scene is a separate chunk, and devices without WebGL never download it.
- **Pixel ratio is capped at 1.5** and drops to 1 if the frame rate falls. The environment map is baked once; the key light casts real-time shadows on desktop only.
- **Picking uses invisible boxes**, not the 110k-vertex model, so mouse moves cost almost nothing.
- **The model keeps all 32 of its original PBR textures at ~5.4 MB, down from ~100 MB.** It's built from the Sketchfab download with WebP textures (2048 px for the main colour maps, smaller for the rest), no tangents, light simplification, quantization and meshopt compression. Phones get `console-phone.glb` with quarter-size textures and no real-time shadows. drei decodes meshopt out of the box.
- Respects `prefers-reduced-motion`: no smooth scrolling, the camera cuts instead of gliding, the monitor shows still frames, and idle motion stops.

## Deploying to GitHub Pages

This is a user site (`Ryzuuuu.github.io`), so Vite's default `base: '/'` is correct. Pages must serve the **built** `dist/` folder, not the repo source. Use a GitHub Actions workflow running `pnpm install --frozen-lockfile && pnpm build` (with `pnpm/action-setup`) with `actions/upload-pages-artifact` + `actions/deploy-pages`, and set *Settings → Pages → Source* to **GitHub Actions**.

## Credits

3D model: [Lumen VGS Pack](https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3) by dark_igorek on Sketchfab. Check the model's license on Sketchfab before you publish.
