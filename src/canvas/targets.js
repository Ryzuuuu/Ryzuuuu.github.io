// Clickable objects in the 3D scene and the section each one opens.
// Kept free of three.js imports so the hero can read it without loading the 3D chunk.
export const TARGETS = {
  about: { label: 'Monitor', hint: 'open my profile', color: '#3dffa2', nodes: ['Lumen_Monitor_0'] },
  projects: { label: 'Gamepad', hint: 'browse projects', color: '#8183ff', nodes: ['gamepad_1_15', 'gamepad_2_16'] },
  contact: { label: 'TV', hint: 'send me a signal', color: '#ff5fb1', nodes: ['Lumen_TV_35'] },
}
