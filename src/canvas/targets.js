// Clickable pieces of the exhibit and the chapter each one opens.
// Kept free of three.js imports so the page can read it without loading the 3D chunk.
export const TARGETS = {
  about: { label: 'The monitor', nodes: ['Lumen_Monitor_0'] },
  expertise: { label: 'The console', nodes: ['Lumen_Video_Game_System_21'] },
  work: { label: 'The controllers', nodes: ['gamepad_1_15', 'gamepad_2_16'] },
  contact: { label: 'The receiver', nodes: ['Lumen_TV_35'] },
}

// Drag-to-orbit state, shared by the pointer handlers and the camera rig.
export const orbit = { offset: 0, vel: 0, dragging: false, lastInput: 0 }

// Where the camera is currently looking (damped), shared with the spotlight that follows it.
export const focus = { x: 0, y: 1, z: 0 }
