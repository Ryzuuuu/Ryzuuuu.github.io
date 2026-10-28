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
    target: [0, 1.05, 0.1], az: 30, el: 21, dist: 19.5, fx: 0.7, fy: 0.54,
    mobile: { dist: 25, fy: 0.3 },
  }),
  // The three process steps share one continuous orbit: each step picks up where the last
  // left off, so scrolling through "how I work" walks you most of the way around the island.
  process: (step, local) => {
    const t = (step + local) / 3
    return {
      target: [0, 1.0, 0], az: 30 + t * 330, el: 16 + Math.sin(t * Math.PI) * 14, dist: 16.5 - Math.sin(t * Math.PI) * 2.5,
      fx: 0.68, fy: 0.52,
      mobile: { dist: 24, fy: 0.3 },
    }
  },
  about: () => ({
    target: [0, 1.9, -1.55], az: 34, el: 15, dist: 10.5, fx: 0.31, fy: 0.46,
    mobile: { dist: 11.5, fy: 0.27 },
  }),
  toolbox: () => ({
    target: [0.1, 0.45, 0.95], az: 32, el: 46, dist: 10.5, fx: 0.74, fy: 0.5,
    mobile: { dist: 13, fy: 0.27 },
  }),
  work: (i) =>
    i < 0
      ? { target: [0.2, 1.1, 0.4], az: -16, el: 20, dist: 12.5, fx: 0.7, fy: 0.5, mobile: { dist: 19, fy: 0.27 } }
      : {
          target: [0.3, 1.2, -0.1], az: -27 + i * 10, el: 11 + (i % 2) * 5, dist: 10.2, fx: 0.7, fy: 0.5,
          mobile: { dist: 15, fy: 0.27 },
        },
  archive: () => ({
    target: [-2.45, 0.42, 2.35], az: -42, el: 18, dist: 7.4, fx: 0.68, fy: 0.52,
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

// Label shown beside the exhibit, keyed by monitor screen first and shot second.
// `top` pins it to the upper corner when the bottom of the frame is busy.
export const CAPTIONS = {
  hero: { fig: 'Fig. 00', title: 'The whole setup', note: 'Drag it around. Click the bits.' },
  'process-0': { fig: 'Fig. 01', title: 'Wireframe', note: 'It runs. Barely.' },
  'process-1': { fig: 'Fig. 02', title: 'Clay', note: 'Survives a shaky webcam now.' },
  'process-2': { fig: 'Fig. 03', title: 'Finished', note: 'Okay, now it’s pretty.' },
  about: { fig: 'Fig. 04', title: 'The monitor', note: 'Currently showing: me.', top: true },
  toolbox: { fig: 'Fig. 05', title: 'The guts', note: 'Fan’s spinning. It’s thinking.' },
  work: { fig: 'Fig. 06', title: 'The cartridge slot', note: 'One project at a time, like a civilised machine.' },
  archive: { fig: 'Fig. 07', title: 'The floor', note: 'B-sides, left lying around.' },
  contact: { fig: 'Fig. 08', title: 'The antenna', note: 'Listening. Go on.' },
}

export const captionFor = (screen, shot) => CAPTIONS[screen] ?? CAPTIONS[shot]

export const resolveShot = (name, param = 0, local = 0, split = true) => {
  const shot = (SHOTS[name] ?? SHOTS.hero)(param, local)
  const { mobile, ...base } = shot
  return split ? base : { ...base, fx: 0.5, ...mobile }
}

// Width-limited shots need to back off on narrow screens and can come closer on wide ones.
export const distanceScale = (aspect, split) =>
  split ? Math.min(1.35, Math.max(0.85, 1.6 / aspect)) : Math.min(1.3, Math.max(0.82, 0.5 / aspect))
