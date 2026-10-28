// Camera shots, one per kind of scroll anchor (`data-shot` in the DOM).
// No three.js imports: the scroll director reads this from the main bundle too.
//
// A shot orbits `target` (world units, island centred on the origin, floor at y = 0):
//   az/el  azimuth and elevation in degrees (az 0 looks at the front, + swings right)
//   dist   distance at the reference aspect ratio
//   fx/fy  where the target lands on screen (0–1), so the copy has room beside it
// `mobile` overrides apply below the lg breakpoint, where copy scrolls over the lower half.

export const SPLIT_MIN_WIDTH = 1024

const SHOTS = {
  hero: () => ({
    target: [0, 1.05, 0.1], az: 30, el: 21, dist: 19.5, fx: 0.69, fy: 0.53,
    mobile: { dist: 25, fy: 0.3 },
  }),
  manifesto: (_, local) => ({
    target: [0, 1.1, 0], az: 30 + local * 360, el: 15 + Math.sin(local * Math.PI) * 15, dist: 18, fx: 0.5, fy: 0.5,
    mobile: { dist: 24, fy: 0.4 },
  }),
  about: () => ({
    target: [0, 1.9, -1.55], az: 34, el: 15, dist: 10.5, fx: 0.31, fy: 0.46,
    mobile: { dist: 11.5, fy: 0.27 },
  }),
  expertise: () => ({
    target: [0.1, 0.45, 0.95], az: 32, el: 46, dist: 8.4, fx: 0.7, fy: 0.5,
    mobile: { dist: 13, fy: 0.27 },
  }),
  work: (i) =>
    i < 0
      ? { target: [0.2, 1.1, 0.4], az: -16, el: 20, dist: 12.5, fx: 0.68, fy: 0.5, mobile: { dist: 19, fy: 0.27 } }
      : {
          target: [0.3, 1.2, -0.1], az: -27 + i * 10, el: 11 + (i % 2) * 5, dist: 10.2, fx: 0.7, fy: 0.5,
          mobile: { dist: 15, fy: 0.27 },
        },
  archive: () => ({
    target: [-2.45, 0.42, 2.35], az: -42, el: 18, dist: 7.4, fx: 0.67, fy: 0.52,
    mobile: { dist: 10.5, fy: 0.27 },
  }),
  contact: () => ({
    target: [2.2, 0.95, -1.6], az: 50, el: 14, dist: 8.6, fx: 0.31, fy: 0.5,
    mobile: { dist: 12.5, fy: 0.27 },
  }),
  colophon: () => ({
    target: [0, 0.4, 0.2], az: 18, el: 56, dist: 20, fx: 0.5, fy: 0.37,
    mobile: { dist: 27, fy: 0.3 },
  }),
}

// Museum-label caption shown beside the exhibit for each shot. `top` pins it to the upper
// corner when the bottom of the frame is busy.
export const CAPTIONS = {
  hero: { fig: 'Exhibit', title: 'Lumen Video Game System', note: 'Drag to turn it · click a piece to open its chapter' },
  manifesto: { fig: 'In the round', title: 'Every angle considered', note: 'Keep scrolling to turn the exhibit' },
  about: { fig: 'Fig. I', title: 'The monitor', note: 'Now showing: the profile', top: true },
  expertise: { fig: 'Fig. II', title: 'The mechanism', note: 'Fan, reader and rollers, running' },
  work: { fig: 'Fig. III', title: 'The cartridge bay', note: 'One work loaded at a time' },
  archive: { fig: 'Fig. III b', title: 'Loose cartridges', note: 'Side projects, kept within reach' },
  contact: { fig: 'Fig. IV', title: 'The receiver', note: 'Listening for your signal' },
  colophon: { fig: 'Fin.', title: 'The whole collection', note: 'Thank you for visiting' },
}

export const resolveShot = (name, param = 0, local = 0, split = true) => {
  const shot = (SHOTS[name] ?? SHOTS.hero)(param, local)
  const { mobile, ...base } = shot
  return split ? base : { ...base, fx: 0.5, ...mobile }
}

// Width-limited shots need to back off on narrow screens and can come closer on wide ones.
export const distanceScale = (aspect, split) =>
  split ? Math.min(1.35, Math.max(0.85, 1.6 / aspect)) : Math.min(1.3, Math.max(0.82, 0.5 / aspect))
