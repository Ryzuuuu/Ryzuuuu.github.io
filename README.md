# Neelabja Mukhopadhyay · Portfolio

**Live site: https://ryzuuuu.github.io/**

A one-page portfolio, set like a printed monograph: warm paper, near-black ink and one blue (neel, the colour in the name). A 3D retro console stands fixed behind the page and every chapter does something to it: the **how a project goes** steps rebuild it from wireframe to clay to finished, **About** turns to the monitor, **Tools** opens up the mechanism, each **work** reloads the cartridge and runs that project's instrument on the monitor, and **Contact** sets the antenna broadcasting. Point at the antenna and its ears swing round hunting for a signal while it sends out pulses; they stop the moment you look away. Drag to turn it, or click a piece to jump to its chapter. On phones the console sits in a window over the top half of the screen, and each project also gets a live figure plate under its copy.

Built with React 19, Vite, React Three Fiber, drei, Lenis and Tailwind CSS. Set in Newsreader, Geist, Geist Mono and Tiro Bangla.

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

All copy lives in **`src/constants.js`**: profile, the intro, sections, the three process steps, about, tools, projects and side projects. Section layouts are in `src/sections/*`. The figure plates and the console's monitor read from the same file, so they stay in sync.

Each project has an `id` that selects its instrument in `src/canvas/instruments.js`. Instruments use the project's real thresholds and formulas where it has them, and anything invented for the picture is marked SIMULATED on screen. An instrument is a pure function of time drawn on a 2D canvas, so the same code paints the plates on the page (`src/components/Plate.jsx`, neel on paper) and the console's monitor (`src/canvas/MonitorScreen.jsx`, phosphor on glass).

The "last commit" line on the opening screen comes from GitHub's public events API, requested by the visitor's browser and cached for 30 minutes. If GitHub refuses, the line stays empty.

## Brand

The mark is a blue lotus seen from above (Neelabja means blue lotus), in a night-blue disc: two rows of folded petals, offset by half a petal, round a small golden heart. Its geometry lives in one place, **`src/brand/mark.js`**, and both of these draw from it:

- `src/brand/Logo.jsx`: the logo on the site. The flower turns slowly the whole time, and each row of petals is its own group, so it blooms in on load, the rows counter-turn with the scroll, and it opens on hover.
- `public/brand/*.svg`: standalone files, written by `pnpm brand`, which also writes the favicon.

There are two optical sizes. `full` has the dial and three rows of petals, for about 48 px and up. `compact` is redrawn with fewer, bolder parts, for nav bars and favicons. Each comes in three colourways: `brand` for light backgrounds, `reversed` for dark, and `mono`, which takes the colour of the surrounding text.

## Colour and type

The palette sits at the top of **`src/index.css`** (`--paper`, `--ink`, `--brand`, `--plinth`, `--casing`, …). Tailwind classes (`bg-paper`, `text-ink`, `text-muted`, `border-line`, `text-accent`) map to tone *roles* (`--surface`, `--fg`, …), never to raw palette values. Each chapter is `data-tone="light"` or `"dark"`; the director flips it on `<html>` and the registered roles cross-fade. The plinth, the console's casing, the monitor and the figure plates read the raw palette through `src/palette.js`, which only parses plain `oklch(L C h)` values.

Type roles are classes in the same file: `.t-display`, `.t-h2`, `.t-h3`, `.t-h4` and `.t-lead` in Newsreader, `.t-body` and `.t-small` in Geist, `.t-meta` and `.t-num` in Geist Mono.

## Structure

```
src/
├── App.jsx                  # Fixed exhibit + scrims + scrolling chapters
├── director.js              # Lenis, scroll → shot blend, tone, velocity
├── palette.js               # Reads the CSS palette for three.js and canvas
├── constants.js             # All editable content
├── brand/                   # The logo: geometry (mark.js) and component (Logo.jsx)
├── index.css                # Palette, type roles, plates, reveal motion
├── components/
│   ├── Navbar.jsx           # Section nav with a sliding pill on the active section, phone menu
│   ├── Button.jsx           # The pill button with its arrow chip
│   ├── Lines.jsx            # Headlines whose lines rise out of a mask
│   ├── Plate.jsx            # A project's instrument on paper (phones), drawn while on screen
│   ├── ExhibitCaption.jsx   # Figure caption saying what the monitor is running
│   ├── ExhibitLoader.jsx    # Thin progress line while the console downloads
│   └── SceneBoundary.jsx    # Hides the 3D scene if WebGL fails
├── hooks/
│   ├── useReveal.js         # Marks elements visible on first scroll into view
│   └── useLastPush.js       # Most recent public push, from GitHub
├── sections/                # Hero, Process, About, Toolbox, Work, Contact, Colophon
└── canvas/                  # Lazy-loaded 3D chunk (except shots.js, targets.js, instruments.js)
    ├── Stage.jsx            # <Canvas>, lights, follow spot, the island leaning into scrolls
    ├── CameraRig.jsx        # Blends shots, damps the camera, reacts to scroll speed
    ├── ConsoleModel.jsx     # GLB, shadows, glow, cartridge, picking
    ├── MonitorScreen.jsx    # The tube: bloom, scanlines, CRT channel change
    ├── instruments.js       # Everything drawn on the plates and the tube, one per project
    ├── Plinth.jsx           # The turntable
    ├── Signal.jsx           # Pulses from the antenna while it's hovered and during Contact
    ├── shots.js             # Camera shots and captions (no three.js imports)
    └── targets.js           # Which piece jumps to which section; shared drag state
public/
├── console.glb              # Optimized model, full textures (~5.4 MB)
├── console-phone.glb        # Same model, quarter-size textures (~3 MB)
└── brand/                   # Logo files, written by `pnpm brand`
```

## Performance notes

- **Scrolling never re-renders React.** One animation loop runs Lenis and writes camera state and CSS custom properties directly; React only hears when the chapter, tone, monitor screen or hovered piece changes.
- **Any element with `data-shot` is a camera anchor** (`data-param`, `data-screen`, `data-chapter`, `data-tone` alongside it). To add a chapter, give it a `data-shot` and add a shot and caption in `shots.js`.
- **three.js loads after the text.** The 3D scene is a separate chunk, and devices without WebGL never download it.
- **Plates only draw while visible**, at 30 fps rather than every display refresh, sized to the device pixel ratio.
- **Pixel ratio is capped at 1.5** in the 3D scene and drops to 1 if the frame rate falls. Real-time shadows are desktop only, and phones get `console-phone.glb` with quarter-size textures.
- **Picking uses invisible boxes**, not the 110k-vertex model, so mouse moves cost almost nothing.
- Respects `prefers-reduced-motion`: no smooth scrolling, no reveals, the monitor and plates show still frames, and the console stops idling.

## Deploying to GitHub Pages

This is a user site (`Ryzuuuu.github.io`), so Vite's default `base: '/'` is correct. Pages must serve the **built** `dist/` folder, not the repo source. Use a GitHub Actions workflow running `pnpm install --frozen-lockfile && pnpm build` (with `pnpm/action-setup`) with `actions/upload-pages-artifact` + `actions/deploy-pages`, and set *Settings → Pages → Source* to **GitHub Actions**.

## Credits

The 3D console is based on [Lumen VGS Pack](https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3) by dark_igorek, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Changes: recoloured, compressed, and animated in code.
