// What the opening curtain and the 3D stage share. The stage reports how the model's download is
// going and when it's standing; the curtain shows that, and sets `raised` once it starts to open,
// which is the island's cue to come up into place.

let state = {
  progress: 0,
  ready: false,
  raised: typeof document !== 'undefined' && !document.documentElement.hasAttribute('data-intro'),
}
const listeners = new Set()

export const subscribeOpening = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getOpening = () => state

export const reportOpening = (next) => {
  if (Object.keys(next).every((k) => state[k] === next[k])) return
  state = { ...state, ...next }
  listeners.forEach((fn) => fn())
}
