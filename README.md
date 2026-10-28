# Neelabja Mukhopadhyay · Portfolio

A one-page portfolio built around an interactive retro console in 3D. Drag to spin it. Click the **monitor** for About, a **gamepad** for Projects, or the **TV** for Contact. Or just scroll.

Built with React 19, Vite, React Three Fiber, drei and Tailwind CSS.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint
```

## Editing content

All copy lives in **`src/constants.js`**: profile, the "now building" ticker, stats, the skills loadout, project cards and side quests. Section headings and paragraphs are in `src/sections/*`.

The contact form has no backend. It opens the visitor's mail app with the message filled in and sends it to `profile.email`.

## Structure

```
src/
├── App.jsx                  # Navbar + sections, one scrolling page
├── constants.js             # All editable content
├── index.css                # Tailwind layers, tokens, reveal animation
├── components/
│   ├── Navbar.jsx           # Anchor nav, scroll-spy, progress bar
│   ├── SectionHeading.jsx   # Eyebrow + title with decode effect
│   └── SceneBoundary.jsx    # Hides the 3D scene if WebGL fails
├── hooks/
│   ├── useActiveSection.js  # Which section is on screen
│   └── useReveal.js         # Fade-in on first scroll into view
├── sections/                # Hero, About, Projects, Contact, Footer
└── canvas/                  # Lazy-loaded 3D chunk
    ├── ConsoleScene.jsx     # <Canvas>, lights, loader, pauses when off-screen
    ├── ConsoleModel.jsx     # GLB, hover/click targets, drag-to-spin
    ├── MonitorScreen.jsx    # Terminal drawn onto the monitor
    ├── CameraRig.jsx        # Framing, pointer parallax, scroll drift
    └── targets.js           # Which object opens which section
public/
└── console.glb              # Optimized model (~1.2 MB)
```

## Performance notes

- **Scrolling never re-renders React.** The scroll progress bar, hero fade and camera all read `scrollY` directly, at most once per frame.
- **three.js loads after the text.** The 3D scene is a separate chunk, and devices without WebGL never download it.
- **The canvas stops rendering** once the hero leaves the viewport. Pixel ratio is capped at 1.5 and drops to 1 if the frame rate falls.
- **Picking uses invisible boxes**, not the 110k-vertex model, so mouse moves cost almost nothing.
- **The model is ~1.2 MB instead of ~20 MB.** The original `scene.gltf` pointed at 32 textures that were never committed, so they 404'd. It was rebuilt as `console.glb` with a flat color palette, no unused UV/tangent data, light simplification, quantization and meshopt compression. drei decodes meshopt out of the box.
- Respects `prefers-reduced-motion`.

## Deploying to GitHub Pages

This is a user site (`Ryzuuuu.github.io`), so Vite's default `base: '/'` is correct. Pages must serve the **built** `dist/` folder, not the repo source. Use a GitHub Actions workflow running `npm ci && npm run build` with `actions/upload-pages-artifact` + `actions/deploy-pages`, and set *Settings → Pages → Source* to **GitHub Actions**.

## Credits

3D model: [Lumen VGS Pack](https://sketchfab.com/3d-models/lumen-vgs-pack-f1c6f36076154777809b30a2e1c50ba3) by dark_igorek on Sketchfab. Check the model's license on Sketchfab before you publish.
