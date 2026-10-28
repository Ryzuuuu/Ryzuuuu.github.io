# Neelabja Mukhopadhyay · Portfolio

A one-page portfolio built around a 3D retro console standing on a teal island. The console stays fixed behind the page and every chapter does something to it: the **how I work** steps rebuild it from wireframe to clay to finished, **About** turns to the monitor, **Toolbox** opens up the mechanism, each **work** reloads the cartridge and its title card, and **Contact** sets the antenna broadcasting. Drag to turn it, or click a piece to jump to its chapter.

Built with React 19, Vite, React Three Fiber, drei, Lenis and Tailwind CSS. Set in Bricolage Grotesque, Schibsted Grotesk and Martian Mono.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # production build in dist/
pnpm preview      # serve the production build
pnpm lint
```

## Editing content

All copy lives in **`src/constants.js`**: profile, the "on the bench" line, chapters, the three process steps, stats, the toolbox, works (each with a one-line `quip`) and side projects. Section layouts are in `src/sections/*`. The monitor's title cards read from the same file, so they stay in sync.

The contact form has no backend. It opens the visitor's mail app with the message filled in and sends it to `profile.email`.

## Colour

The palette sits verbatim at the top of **`src/index.css`** (`--bg`, `--text`, `--primary`, `--secondary`, …). Nothing else hard-codes a colour:

- Tailwind classes (`bg-surface`, `text-ink`, `text-muted`, `border-line`, `text-accent`, `bg-pop`) map to *roles* that point at palette variables.
- Each chapter is `data-tone="light"` or `"dark"`. As you scroll, the director flips `data-tone` on `<html>`, the roles swap, and the whole page cross-fades between mint and deep teal.
- The 3D scene and the monitor read the same variables through `src/palette.js`, so recolouring the palette recolours the model too.

## How the page drives the exhibit

Any element with **`data-shot`** is a scroll anchor. While the middle of the viewport is inside it, the camera holds that shot; near the boundary it cross-fades into the next one.

| Attribute | Effect |
| --- | --- |
| `data-shot="about"` | Camera shot from `src/canvas/shots.js` (target, angle, distance, where it sits on screen) |
| `data-param="2"` | Passed to the shot, e.g. which work or which process step |
| `data-screen="work-2"` | Title card on the monitor (`MonitorScreen.jsx`); defaults to the shot name. `process-0`/`process-1` also switch the console to wireframe/clay |
| `data-chapter="work"` | Which nav item is active and which piece glows |
| `data-tone="dark"` | Light or dark page colours while this chapter leads |
| `data-speed="0.3"` | Parallax drift against the scroll |
| `data-marquee="50"` | Sideways drift in px/s (negative reverses); speeds up with scroll |
| `data-reveal` / `.reveal` | Animate in the first time it scrolls into view |

To add a section, give it a `data-shot`, add a shot and a caption in `shots.js`, and optionally a monitor card in `MonitorScreen.jsx`.

## Structure

```
src/
├── App.jsx                  # Fixed exhibit + scrims + scrolling chapters
├── director.js              # Lenis, scroll → shot blend, tone, velocity, parallax, marquees
├── palette.js               # Reads the CSS palette for three.js and canvas
├── constants.js             # All editable content
├── index.css                # Palette, tone roles, type scale, reveal motion
├── components/
│   ├── Navbar.jsx           # Chapter nav, progress bar, phone menu
│   ├── Lines.jsx            # Headlines that rise line by line
│   ├── SectionHeading.jsx   # Number, rule, kicker, headline, intro
│   ├── CountUp.jsx          # Stats that count up on reveal
│   ├── Marquee.jsx / Tape.jsx  # Scroll-reactive marquees and the tilted ticker tape
│   ├── ScrollBadge.jsx      # Spinning "keep scrolling" badge
│   ├── ExhibitCaption.jsx   # Label beside the exhibit, with a hand-drawn arrow
│   ├── ExhibitLoader.jsx    # Loading percentage, drawn where the exhibit will appear
│   └── SceneBoundary.jsx    # Hides the 3D scene if WebGL fails
├── hooks/useReveal.js       # Marks elements visible on first scroll into view
├── sections/                # Hero, Process, About, Toolbox, Work, Contact, Colophon
└── canvas/                  # Lazy-loaded 3D chunk (except shots.js / targets.js)
    ├── Stage.jsx            # <Canvas>, lights, follow spot, the island leaning into scrolls
    ├── CameraRig.jsx        # Blends shots, damps the camera, reacts to scroll speed
    ├── ConsoleModel.jsx     # GLB, palette, wireframe/clay/finished, glow, cartridge, picking
    ├── MonitorScreen.jsx    # Teal phosphor title cards with a CRT channel change
    ├── Plinth.jsx           # The island: teal slab, bright lip, wine inlay, shadow/glow pool
    ├── Signal.jsx           # Ripples from the antenna during Contact
    ├── shots.js             # Camera shots and captions (no three.js imports)
    └── targets.js           # Which piece opens which chapter; shared drag/focus state
public/
└── console.glb              # Optimized model (~1.2 MB)
```

## Performance notes

- **Scrolling never re-renders React.** One animation loop runs Lenis and writes camera state, CSS custom properties, parallax and marquee transforms directly; React only hears when the chapter, tone, monitor screen or hovered piece changes.
- **three.js loads after the text.** The 3D scene is a separate chunk, and devices without WebGL never download it.
- **Pixel ratio is capped at 1.5** and drops to 1 if the frame rate falls. Shadows and the environment map are baked once.
- **Picking uses invisible boxes**, not the 110k-vertex model, so mouse moves cost almost nothing.
- **The model is ~1.2 MB instead of ~20 MB.** The original `scene.gltf` pointed at 32 textures that were never committed, so they 404'd. It was rebuilt as `console.glb` with a flat color palette, no unused UV/tangent data, light simplification, quantization and meshopt compression. drei decodes meshopt out of the box.
- Respects `prefers-reduced-motion`: no smooth scrolling, parallax or marquees, the camera cuts instead of gliding, and idle motion stops.

## Deploying to GitHub Pages

This is a user site (`Ryzuuuu.github.io`), so Vite's default `base: '/'` is correct. Pages must serve the **built** `dist/` folder, not the repo source. Use a GitHub Actions workflow running `pnpm install --frozen-lockfile && pnpm build` (with `pnpm/action-setup`) with `actions/upload-pages-artifact` + `actions/deploy-pages`, and set *Settings → Pages → Source* to **GitHub Actions**.

## Credits

3D model: [Lumen VGS Pack](https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3) by dark_igorek on Sketchfab. Check the model's license on Sketchfab before you publish.
