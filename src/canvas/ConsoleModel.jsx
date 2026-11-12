/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively in the frame loop by design */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getSnapshot, setHovered } from '../director'
import { linear } from '../palette'
import { orbit, TARGETS } from './targets'
import MonitorScreen from './MonitorScreen'
import Signal from './Signal'

const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
// Same model with quarter-size textures on phones, which pay for every texture in GPU memory.
const MODEL_URL = coarse ? '/console-phone.glb' : '/console.glb'
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const damp = THREE.MathUtils.damp
const color = (name) => new THREE.Color().setRGB(...linear(name), THREE.LinearSRGBColorSpace)

// The foot of the antenna, measured from the mesh. Its bounding box is no use for this: the
// coiled lead that belongs to the same mesh drags the centre well away from the antenna.
const ANTENNA = [2.955, 0.02, -2.24]

// Repaints the copper in the textures with the palette's casing colour. Each pixel is judged by
// how orange it is, so the labels, sticker art and dark trim stay as painted, and its brightness
// is kept in part, so the scratches and edge wear survive without looking like dirt.
const COPPER_LUMA = 0.33
const tintCasing = (material, casing, metal) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCasing = { value: casing }
    shader.uniforms.uCasingMetal = { value: metal }
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
uniform vec3 uCasing;
uniform float uCasingMetal;`)
      .replace('#include <map_fragment>', `#include <map_fragment>
float copperMask = smoothstep(0.42, 0.6, (diffuseColor.r - diffuseColor.b) / max(diffuseColor.r, 0.001));
float copperLuma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
diffuseColor.rgb = mix(diffuseColor.rgb, uCasing * mix(1.0, min(copperLuma / ${COPPER_LUMA.toFixed(2)}, 1.25), 0.38), copperMask);`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
metalnessFactor = mix(metalnessFactor, uCasingMetal, copperMask);`)
  }
  material.needsUpdate = true
}

// The small parts you handle get a darker finish than the body, as on real hi-fi.
const ACCESSORIES = /^(gamepad|Bricktris|Super_Lumia|Lumen_TV|lent)/
const isAccessory = (object) => {
  for (let n = object; n; n = n.parent) if (ACCESSORIES.test(n.name)) return true
  return false
}
const cssNumber = (name) => Number(getComputedStyle(document.documentElement).getPropertyValue(`--${name}`)) || 0

// A soft round pool of light, for the glow the monitor throws onto the island.
const makePool = () => {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.3)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

const tilt = new THREE.Quaternion()
const euler = new THREE.Euler()
const padTurn = new THREE.Quaternion()
const padLift = new THREE.Vector3()
const padUnit = new THREE.Vector3(1, 1, 1)
const padScene = new THREE.Matrix4()
const padToOrigin = new THREE.Matrix4()

// Each controller and its cable are a single mesh, so moving the node drags the whole wire along.
// Instead the vertex shader moves the controller's body and fades that out with distance, which
// leaves the plug and the far end of the wire where they are while the near end bends to follow.
//
// `dpad` and `buttons` are measured from the mesh, in the node's own frame. `across` and `along`
// are the directions on the controller's face in that frame.
const PADS = [
  {
    node: 'gamepad_1_15', center: [1.2, 0.12, 2.39], inner: 0.62, outer: 1.55, phase: 0, rock: 1,
    dpad: [-0.29, 0.1, -0.05], buttons: [0.29, 0.1, -0.05], across: [1, 0, 0], along: [0, 0, 1],
  },
  {
    node: 'gamepad_2_16', center: [2.12, 0.27, 1.2], inner: 1.2, outer: 1.6, phase: 1.9, rock: 0.7,
    dpad: [-0.29, 0.1, -0.05], buttons: [0.29, 0.1, -0.05], across: [1, 0, 0], along: [0, 0, 1],
  },
]
const PAD_VERTEX = `
uniform mat4 uPadToScene;
uniform mat4 uPadMove;
uniform vec3 uPadCenter;
uniform vec2 uPadRange;
varying vec3 vPadScene;
float padWeight(vec3 p) {
  return 1.0 - smoothstep(uPadRange.x, uPadRange.y, distance((uPadToScene * vec4(p, 1.0)).xyz, uPadCenter));
}`
const PAD_MOVE = `#include <begin_vertex>
vPadScene = (uPadToScene * vec4(transformed, 1.0)).xyz;
transformed = mix(transformed, (uPadMove * vec4(transformed, 1.0)).xyz, padWeight(transformed));`
const PAD_FRAGMENT = `
uniform vec3 uPressA;
uniform vec3 uPressB;
uniform vec2 uPressGlow;
uniform vec3 uPressColor;
varying vec3 vPadScene;`
const PAD_PRESS = `#include <emissivemap_fragment>
totalEmissiveRadiance += uPressColor * (
  uPressGlow.x * (1.0 - smoothstep(0.02, 0.12, distance(vPadScene, uPressA))) +
  uPressGlow.y * (1.0 - smoothstep(0.02, 0.12, distance(vPadScene, uPressB))));`

// The four directions a thumb can press, as steps across and along the controller's face.
const PRESSES = [[0, -1], [1, 0], [0, 1], [-1, 0]]
const COMBO_LEFT = [0, 0, 3, 1, 2, 1, 3, 0]
const COMBO_RIGHT = [1, 3, 1, 2, 0, 1, 1, 3]

const makePadRig = (scene, toLocal, { node: name, center, inner, outer, phase, rock, dpad, buttons, across, along }) => {
  const node = scene.getObjectByName(name)
  const mesh = node?.getObjectByProperty('isMesh', true)
  if (!mesh) return null
  const toScene = toLocal.clone().multiply(mesh.matrixWorld)
  const nodeToScene = toLocal.clone().multiply(node.matrixWorld)
  const centre = new THREE.Vector3(...center)
  const uniforms = {
    uPadToScene: { value: toScene },
    uPadMove: { value: new THREE.Matrix4() },
    uPadCenter: { value: centre },
    uPadRange: { value: new THREE.Vector2(inner, outer) },
    uPressA: { value: new THREE.Vector3() },
    uPressB: { value: new THREE.Vector3() },
    uPressGlow: { value: new THREE.Vector2() },
    uPressColor: { value: color('amber').multiplyScalar(2.4) },
  }
  const patchVertex = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>${PAD_VERTEX}`)
      .replace('#include <begin_vertex>', PAD_MOVE)
  }
  const material = mesh.material
  const tint = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    tint(shader, renderer)
    patchVertex(shader)
    shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
objectNormal = normalize(mix(objectNormal, mat3(uPadMove) * objectNormal, padWeight(position)));`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>${PAD_FRAGMENT}`)
      .replace('#include <emissivemap_fragment>', PAD_PRESS)
  }
  material.needsUpdate = true
  // Its shadow has to move with it.
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })
  mesh.customDepthMaterial.onBeforeCompile = patchVertex

  const fromScene = toScene.clone().invert()
  const dir = (v) => new THREE.Vector3(...v)
  const press = (out, base, combo, tick, reach) => {
    const [u, v] = PRESSES[combo[tick % combo.length]]
    out.copy(base).addScaledVector(acrossDir, u * reach).addScaledVector(alongDir, v * reach).applyMatrix4(nodeToScene)
  }
  const dpadAt = dir(dpad)
  const buttonsAt = dir(buttons)
  const acrossDir = dir(across)
  const alongDir = dir(along)

  // Being played: it stays on the table, rocks in an unseen grip and nods with each press, while
  // the d-pad and the face buttons light up in rhythm.
  const update = (level, t) => {
    const left = t * 3.6 + phase
    const right = t * 5.2 + phase
    const hitL = (1 - (left % 1)) ** 2
    const hitR = (1 - (right % 1)) ** 2
    press(uniforms.uPressA.value, dpadAt, COMBO_LEFT, Math.floor(left), 0.085)
    press(uniforms.uPressB.value, buttonsAt, COMBO_RIGHT, Math.floor(right), 0.085)
    uniforms.uPressGlow.value.set(hitL * level, hitR * level)

    const lean = Math.sin(t * 2.3 + phase)
    euler.set(
      level * rock * (Math.sin(t * 3.1 + phase) * 0.12 + hitR * 0.05),
      level * rock * lean * 0.3,
      level * rock * (lean * 0.1 - hitL * 0.04),
    )
    padTurn.setFromEuler(euler)
    padLift.set(0, level * rock * 0.09, 0).add(centre)
    padScene.compose(padLift, padTurn, padUnit).multiply(padToOrigin.makeTranslation(-centre.x, -centre.y, -centre.z))
    uniforms.uPadMove.value.copy(fromScene).multiply(padScene).multiply(toScene)
  }
  return { update, material }
}

// Remembers where a node rests, so a hover can move it and always come back.
const rest = (scene, name) => {
  const node = scene.getObjectByName(name)
  return node ? { node, position: node.position.clone(), quaternion: node.quaternion.clone() } : null
}

// Texture slots worth sharpening at the grazing angles the camera keeps visiting.
const MAPS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap']

// The "how I work" steps: a wireframe first, then the console is broken apart to be tested,
// then it comes back together finished.
const MODE_FOR = { 'process-0': 'wire' }
const SHATTER_ON = 'process-1'

// Mutating the cached GLTF scene is intentional, and it must only happen once per scene: the
// animations hold on to the materials made here, so a second pass would leave them driving copies
// that are no longer on screen. React's strict mode does call this twice.
const prepared = new WeakMap()
const prepareOnce = (scene) => {
  if (!prepared.has(scene)) prepared.set(scene, prepareScene(scene))
  return prepared.get(scene)
}

// The antenna is a pair of rabbit ears on a weighted base, and the coiled lead is part of the same
// mesh. So, as with the controllers, the vertex shader does the moving: anything above the base
// leans about the top of the base, each ear on its own, and the lead on the table never stirs.
// Measured from the mesh: the base tops out at about y 1.1 and the ears part either side of x 2.93.
const EARS = { node: 'Lumen_TV_35', pivot: [2.93, 1.1, -2.17], reach: 1.2 }
const EAR_VERTEX = `
uniform mat4 uEarToScene;
uniform mat4 uEarFromScene;
uniform vec3 uEarPivot;
uniform vec4 uEarLean;
vec3 earBend(vec3 p) {
  vec3 q = (uEarToScene * vec4(p, 1.0)).xyz;
  float h = max(q.y - uEarPivot.y, 0.0);
  if (h <= 0.0) return p;
  // -1 for the left ear, 1 for the right, blended through the hinge so the base never tears.
  float side = clamp((q.x - uEarPivot.x) * 12.0, -1.0, 1.0);
  vec2 lean = mix(uEarLean.xy, uEarLean.zw, side * 0.5 + 0.5);
  q.xz += lean * h;
  q.y -= 0.5 * dot(lean, lean) * h;
  return (uEarFromScene * vec4(q, 1.0)).xyz;
}`
const EAR_MOVE = `#include <begin_vertex>
transformed = earBend(transformed);`

const makeEarRig = (scene, toLocal) => {
  const mesh = scene.getObjectByName(EARS.node)?.getObjectByProperty('isMesh', true)
  if (!mesh) return null
  const toScene = toLocal.clone().multiply(mesh.matrixWorld)
  const uniforms = {
    uEarToScene: { value: toScene },
    uEarFromScene: { value: toScene.clone().invert() },
    uEarPivot: { value: new THREE.Vector3(...EARS.pivot) },
    uEarLean: { value: new THREE.Vector4() },
  }
  const patchVertex = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>${EAR_VERTEX}`)
      .replace('#include <begin_vertex>', EAR_MOVE)
  }
  const material = mesh.material
  const tint = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    tint(shader, renderer)
    patchVertex(shader)
  }
  material.needsUpdate = true
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })
  mesh.customDepthMaterial.onBeforeCompile = patchVertex

  // At rest the ears drift a hair, like something on a shelf near an open window. Pointed at,
  // they hunt for a signal: each ear swings on its own beat, out of step with the other, and
  // settles back once the pointer leaves. The Contact chapter keeps them gently searching.
  const lean = uniforms.uEarLean.value
  const update = (level, t) => {
    const idle = reducedMotion ? 0 : 0.012
    const amp = idle + level * 0.075
    const hunt = level * Math.sin(t * 9) * 0.008
    lean.set(
      Math.sin(t * 1.7) * amp - level * 0.03 + hunt,
      Math.sin(t * 1.1 + 0.6) * amp * 0.6,
      Math.sin(t * 1.9 + 2.1) * amp + level * 0.03 - hunt,
      Math.sin(t * 1.3 + 1.4) * amp * 0.6,
    )
  }
  return { update }
}

// ── Breaking it apart ──────────────────────────────────────────────────────────────
// Every mesh in the model is a piece. Each one has its own way out from the console's core,
// its own tumble and its own moment to leave, so the console comes apart in a ripple rather than
// all at once, hangs in the air turning slowly, and is pulled back together the same way. A mesh's parent can be spinning (the fan, the reels), so its way out
// is kept in the scene's frame and carried into the parent's frame every frame.
const CORE = new THREE.Vector3(0, 0.55, -1.1)
const rand = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2)
const shatterM = new THREE.Matrix4()
const shatterM3 = new THREE.Matrix3()
const shatterOff = new THREE.Vector3()
const shatterQ = new THREE.Quaternion()
const shatterV = new THREE.Vector3()

const inside = (object, name) => {
  for (let n = object; n; n = n.parent) if (n.name === name) return true
  return false
}

const makeShatter = (scene, toLocal, skip) => {
  const found = []
  scene.traverse((mesh) => {
    if (!mesh.isMesh || skip.has(mesh)) return
    mesh.geometry.computeBoundingBox()
    const box = new THREE.Box3().setFromObject(mesh).applyMatrix4(toLocal)
    found.push({
      mesh,
      seed: found.length + 1,
      centre: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()).length(),
      // The monitor's parts stay upright, so the picture on its screen can travel with the glass.
      upright: inside(mesh, 'Lumen_Monitor_0'),
    })
  })

  // Where each piece goes: out from the console's core across the island, and up, so it reads
  // as an explosion from whichever side you turn it to. Big pieces travel less than small ones.
  for (const f of found) {
    const out = new THREE.Vector3(f.centre.x - CORE.x, 0, f.centre.z - CORE.z)
    if (out.lengthSq() < 0.01) out.set(rand(f.seed) - 0.5, 0, rand(f.seed + 1) - 0.5)
    out.normalize().multiplyScalar(1 + rand(f.seed + 2) * 1.3)
    out.y = 0.9 + rand(f.seed + 3) * 1.6 + Math.max(0, f.centre.y - CORE.y) * 0.4
    out.multiplyScalar(f.size > 3 ? 0.6 : f.size > 1.5 ? 0.85 : 1)
    f.out = out
    f.delay = rand(f.seed + 9) * 0.4
    f.spin = (0.35 + rand(f.seed + 7) * 0.7) * (rand(f.seed + 8) < 0.5 ? -1 : 1)
  }

  // The monitor comes apart along its depth, like an exploded drawing seen from the front: its
  // layers slide forward one behind another, the glass (with the picture on it) furthest out.
  // They stay upright so the picture can travel with the glass.
  const layers = found.filter((f) => f.upright).sort((p, q) => p.centre.z - q.centre.z)
  layers.forEach((f, rank) => {
    const glass = f.mesh.material.name === 'Monitor_glass_mat'
    f.out = new THREE.Vector3(0, 0.25 + rank * 0.08, glass ? 1.6 : rank * 0.5)
    f.delay = 0.1 + rank * 0.07
    f.spin = 0
  })

  // No two small pieces may end up in each other. Each piece is a sphere round where it lands;
  // overlapping small ones are pushed apart along the line between them (big pieces and the
  // monitor's layers hold still and only push), until nothing overlaps.
  const landing = found.map((f) => ({
    f,
    at: f.centre.clone().add(f.out),
    r: f.size * (f.size > 3 ? 0.32 : 0.45) + 0.08,
    fixed: f.upright || f.size > 3,
  }))
  const push = new THREE.Vector3()
  for (let pass = 0; pass < 80; pass++) {
    let moved = false
    for (let x = 0; x < landing.length; x++) {
      for (let y = x + 1; y < landing.length; y++) {
        const p = landing[x]
        const q = landing[y]
        if (p.fixed && q.fixed) continue
        push.copy(q.at).sub(p.at)
        const d = push.length()
        const overlap = p.r + q.r - d
        if (overlap <= 0) continue
        moved = true
        if (d < 1e-4) push.set(rand(x + y) - 0.5, 0.2, rand(x * y + 1) - 0.5)
        push.normalize().multiplyScalar(overlap + 0.02)
        if (p.fixed) q.at.add(push)
        else if (q.fixed) p.at.sub(push)
        else {
          q.at.addScaledVector(push, 0.5)
          p.at.addScaledVector(push, -0.5)
        }
        // Never into the island.
        p.at.y = Math.max(p.at.y, p.r * 0.6 + 0.1)
        q.at.y = Math.max(q.at.y, q.r * 0.6 + 0.1)
      }
    }
    if (!moved) break
  }
  for (const { f, at } of landing) f.out = at.sub(f.centre)

  const pieces = found.map(({ mesh, seed, out, delay, spin }) => ({
    mesh,
    seed,
    out,
    delay,
    spin,
    // The tumble turns about the piece's own middle, in its parent's frame.
    pivot: mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(mesh.matrix),
    axis: new THREE.Vector3(rand(seed + 5) - 0.5, rand(seed + 6) - 0.5, rand(seed + 7) - 0.5).normalize(),
    position: mesh.position.clone(),
    quaternion: mesh.quaternion.clone(),
    glass: mesh.material.name === 'Monitor_glass_mat',
  }))

  // Where the glass went, in the scene's frame, so the monitor's picture can follow it.
  const glassOffset = new THREE.Vector3()
  let moved = false

  const update = (amount, t) => {
    glassOffset.set(0, 0, 0)
    if (amount <= 0.0005) {
      if (moved) {
        for (const p of pieces) {
          p.mesh.position.copy(p.position)
          p.mesh.quaternion.copy(p.quaternion)
        }
        moved = false
      }
      return
    }
    moved = true
    for (const p of pieces) {
      const k = easeInOut(THREE.MathUtils.clamp((amount - p.delay) / 0.55, 0, 1))
      // While it hangs apart, each piece drifts on its own slow breath.
      shatterOff.copy(p.out).multiplyScalar(k)
      shatterOff.y += Math.sin(t * 1.2 + p.seed) * 0.07 * k
      if (p.glass) glassOffset.copy(shatterOff)
      // Scene frame → the parent's frame (it may be turning).
      shatterM.copy(p.mesh.parent.matrixWorld).invert().multiply(scene.matrixWorld)
      shatterM3.setFromMatrix4(shatterM)
      shatterOff.applyMatrix3(shatterM3)
      shatterQ.setFromAxisAngle(p.axis, p.spin * k * (1.1 + Math.sin(t * 0.6 + p.seed) * 0.25))
      shatterV.copy(p.position).sub(p.pivot).applyQuaternion(shatterQ).add(p.pivot)
      p.mesh.position.copy(shatterV).add(shatterOff)
      p.mesh.quaternion.copy(shatterQ).multiply(p.quaternion)
    }
  }
  return { update, glassOffset }
}

// The dust thrown off as it breaks: sparks that burst out of the core with the pieces, hang in a
// slow swirl while it's apart, and are drawn back in as it closes.
const DUST = 520
const makeDust = () => {
  const geometry = new THREE.BufferGeometry()
  const dirs = new Float32Array(DUST * 3)
  const seeds = new Float32Array(DUST)
  for (let i = 0; i < DUST; i++) {
    const u = rand(i * 3.1) * 2 - 1
    const a = rand(i * 7.7) * Math.PI * 2
    const r = Math.sqrt(1 - u * u)
    const reach = 1.2 + rand(i * 1.3) ** 0.7 * 3.4
    dirs.set([Math.cos(a) * r * reach, (Math.abs(u) * 0.8 + 0.25) * reach * 0.8, Math.sin(a) * r * reach], i * 3)
    seeds[i] = rand(i * 5.3)
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUST * 3), 3))
  const material = new THREE.PointsMaterial({
    color: color('phosphor'), size: 0.06, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  points.visible = false
  const pos = geometry.attributes.position
  const update = (amount, t) => {
    points.visible = amount > 0.002
    if (!points.visible) return
    const k = easeInOut(Math.min(1, amount))
    for (let i = 0; i < DUST; i++) {
      const sd = seeds[i]
      const swirl = t * (0.12 + sd * 0.25) * k
      const dx = dirs[i * 3] * k
      const dz = dirs[i * 3 + 2] * k
      const c = Math.cos(swirl)
      const sn = Math.sin(swirl)
      pos.array[i * 3] = CORE.x + dx * c - dz * sn
      pos.array[i * 3 + 1] = CORE.y + dirs[i * 3 + 1] * k + Math.sin(t * 0.9 + sd * 20) * 0.08 * k
      pos.array[i * 3 + 2] = CORE.z + dx * sn + dz * c
    }
    pos.needsUpdate = true
    // Brightest as it bursts and as it closes; a faint glitter while it hangs apart.
    material.opacity = 0.25 * k + Math.sin(Math.PI * Math.min(1, amount)) * 0.7
  }
  return { points, update }
}

const prepareScene = (scene) => {
  scene.traverse((o) => {
    if (!o.isMesh) return
    // Real geometry never gets raycast; cheap invisible boxes handle picking instead.
    o.raycast = () => {}
    for (const slot of MAPS) if (o.material[slot]) o.material[slot].anisotropy = coarse ? 4 : 8
    if (!o.material.transparent) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })

  scene.updateMatrixWorld(true)
  const toLocal = scene.matrixWorld.clone().invert()
  const boxOf = (node) => new THREE.Box3().setFromObject(node).applyMatrix4(toLocal)
  const glowColor = new THREE.Color('#ffe9d6')

  const proxies = []
  const glow = {}
  for (const [id, target] of Object.entries(TARGETS)) {
    const mats = new Set()
    for (const name of target.nodes) {
      const node = scene.getObjectByName(name)
      if (!node) continue
      node.traverse((o) => {
        if (!o.isMesh) return
        // Own materials so lighting up one piece doesn't light every piece sharing it.
        o.material = o.material.clone()
        // Parts with an emissive map have real indicator lights, so those stay as authored.
        if (o.material.emissiveMap) return
        o.material.emissive = glowColor.clone()
        o.material.emissiveIntensity = 0
        // The monitor glass is driven by the screen wash below instead.
        if (o.material.name !== 'Monitor_glass_mat') mats.add(o.material)
      })
      const box = boxOf(node)
      const size = box.getSize(new THREE.Vector3()).addScalar(0.15)
      proxies.push({ id, key: name, size: size.toArray(), center: box.getCenter(new THREE.Vector3()).toArray() })
    }
    glow[id] = [...mats]
  }

  // The original screen art was a texture we don't have; MonitorScreen replaces it.
  const logo = scene.getObjectByName('Lumen_logo_32')
  if (logo) logo.visible = false

  // A faint wash on the CRT glass in front of the screen.
  const glass = []
  scene.getObjectByName('Lumen_Monitor_0')?.traverse((o) => {
    if (o.isMesh && o.material.name === 'Monitor_glass_mat') glass.push(o.material)
  })
  for (const m of glass) {
    m.emissive = glowColor.clone()
    m.emissiveIntensity = 0
  }

  // Every mesh with its finished material, plus the two stand-ins for the process steps. The
  // tint goes on here, after the clones above: a clone doesn't keep a shader patch.
  const finish = {
    body: { color: color('casing'), metal: cssNumber('casing-metal') },
    small: { color: color('accessory'), metal: cssNumber('accessory-metal') },
  }
  const meshes = []
  scene.traverse((o) => {
    if (!o.isMesh) return
    if (o.material.map && !o.material.transparent) {
      const { color: paint, metal } = isAccessory(o) ? finish.small : finish.body
      tintCasing(o.material, paint, metal)
    }
    meshes.push({ mesh: o, finished: o.material })
  })
  const looks = {
    wire: new THREE.MeshBasicMaterial({ color: color('phosphor'), wireframe: true, transparent: true, opacity: 0.5, toneMapped: false }),
  }

  // The cartridge sitting in the console's bay; it reseats itself for each work.
  const cart = scene.getObjectByName('Bricktris_9')

  // The parts the hover animations move.
  const pads = PADS.map((pad) => makePadRig(scene, toLocal, pad)).filter(Boolean)
  const ears = makeEarRig(scene, toLocal)
  const tapes = ['Bricktris_copy_14', 'Super_Lumia_Bros_26'].map((n) => rest(scene, n)).filter(Boolean)
  const reels = ['lent_big_12', 'lent_small_13', 'lent_big001_24', 'lent_small001_25']
    .map((n) => scene.getObjectByName(n)).filter(Boolean)

  // Every visible mesh is a piece when it breaks apart; the hidden screen art isn't.
  const shatter = makeShatter(scene, toLocal, new Set(logo ? [logo.getObjectByProperty('isMesh', true)] : []))

  return { proxies, glow, glass, cart, cartY: cart?.position.y ?? 0, meshes, looks, pads, ears, tapes, reels, shatter }
}

const ConsoleModel = ({ onSelect }) => {
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions } = useAnimations(animations, scene)
  const { proxies, glow, glass, cart, cartY, meshes, looks, pads, ears, tapes, reels, shatter } = useMemo(() => prepareOnce(scene), [scene])
  const pool = useMemo(() => makePool(), [])
  const dust = useMemo(() => makeDust(), [])
  const screenRig = useRef()
  const spill = useRef()
  const spillLight = useRef()
  const powered = useRef(false)
  const scanner = useRef()
  const gl = useThree((s) => s.gl)

  const state = useRef({ boot: 0, flash: null, flashT: 0, press: null, screen: null, hop: 1, mode: 'full', scan: 1, split: 0, over: { about: 0, toolbox: 0, work: 0, archive: 0, contact: 0 } })
  const selectRef = useRef(onSelect)
  useEffect(() => { selectRef.current = onSelect }, [onSelect])

  useEffect(() => () => {
    looks.wire.dispose()
    pool.dispose()
    dust.points.geometry.dispose()
    dust.points.material.dispose()
  }, [looks, pool, dust])

  // The baked clip spins the fan, rollers and reels and runs the loading bar. It idles slowly
  // and runs at full speed while the Toolbox chapter is looking at the mechanism.
  const clip = useMemo(() => Object.values(actions)[0], [actions])
  useEffect(() => {
    if (!clip) return
    clip.reset().play()
    clip.timeScale = 0.2
    return () => { clip.stop() }
  }, [clip])

  // Drag sideways to orbit. `pan-y` keeps vertical swipes scrolling the page on touch.
  // A press that barely moves counts as a click on whatever piece it started on.
  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = 'pan-y'
    const s = state.current
    let lastX = 0
    const now = () => performance.now() / 1000
    const down = (e) => { orbit.dragging = true; orbit.vel = 0; lastX = e.clientX; orbit.lastInput = now() }
    const move = (e) => {
      if (!orbit.dragging) return
      const d = (e.clientX - lastX) * -0.3
      lastX = e.clientX
      orbit.offset += d
      orbit.vel = d
      orbit.lastInput = now()
    }
    const up = (e) => {
      if (!orbit.dragging) return
      orbit.dragging = false
      orbit.lastInput = now()
      const press = s.press
      s.press = null
      if (!press || e.type === 'pointercancel') return
      if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) return
      s.flash = press.id
      s.flashT = 1
      selectRef.current(press.id)
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useEffect(() => () => { document.body.style.cursor = '' }, [])

  useFrame(({ clock }, delta) => {
    const s = state.current
    const t = clock.elapsedTime
    const dt = Math.min(delta, 0.1)
    const snap = getSnapshot()
    const { chapter, screen } = snap
    // In pieces, the console is dead: nothing answers the pointer, nothing glows, nothing spins.
    const dead = screen === SHATTER_ON
    const hovered = dead ? null : snap.hovered

    // Screen powers on shortly after load; MonitorScreen handles the flicker.
    s.boot = Math.min(1, s.boot + dt * 0.9)
    powered.current = s.boot > 0.6
    const wash = powered.current && !dead ? 0.05 + (hovered === 'about' ? 0.12 : 0) : 0
    for (const m of glass) m.emissiveIntensity = damp(m.emissiveIntensity, wash, 8, dt)

    // Wireframe → finished. Swap the look and send the scanner ring up the console.
    const mode = MODE_FOR[screen] ?? 'full'
    if (mode !== s.mode) {
      s.mode = mode
      s.scan = reducedMotion ? 1 : 0
      for (const { mesh, finished } of meshes) {
        mesh.material = mode === 'full' ? finished : looks[mode]
        mesh.castShadow = mode !== 'wire' && !finished.transparent
      }
    }
    // Broken apart for testing, then pulled back together. When the last piece seats, the
    // scanner ring sweeps up the console as if checking the joins.
    const apart = screen === SHATTER_ON && !reducedMotion
    const was = s.split
    s.split = apart ? Math.min(1, s.split + dt * 0.8) : Math.max(0, s.split - dt * 0.95)
    if (was > 0 && s.split === 0) s.scan = 0
    shatter.update(s.split, t)
    dust.update(dead ? 0 : s.split, t)
    if (screenRig.current) screenRig.current.position.copy(shatter.glassOffset)

    s.scan = Math.min(1, s.scan + dt * 1.5)
    if (scanner.current) {
      scanner.current.visible = s.scan < 1
      scanner.current.position.y = s.scan * 3.4
      scanner.current.material.opacity = Math.sin(s.scan * Math.PI) * 0.9
    }

    // The piece belonging to the chapter on screen breathes; hover and clicks are brighter.
    s.flashT = Math.max(0, s.flashT - dt * 2)
    const breathe = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.4)
    for (const [id, mats] of Object.entries(glow)) {
      const target =
        (chapter === id ? 0.004 + breathe * 0.006 : 0) + (hovered === id ? 0.012 : 0) + (s.flash === id ? s.flashT * 0.18 : 0)
      for (const m of mats) m.emissiveIntensity = damp(m.emissiveIntensity, target, 8, dt)
    }

    // Each piece answers a hover in its own way; the antenna's rings live in Signal.
    const over = s.over
    for (const id of Object.keys(over)) over[id] = damp(over[id], hovered === id && !reducedMotion ? 1 : 0, 6, dt)

    // The monitor throws its light: green across the island in front of it, and onto the console.
    if (spill.current) {
      spill.current.visible = over.about > 0.01
      spill.current.material.opacity = over.about * 0.5
      spillLight.current.intensity = over.about * 14
    }

    // The controllers get played: they rock on the table while their buttons light up in rhythm.
    if (over.work > 0.002 || s.padsMoved) {
      for (const pad of pads) pad.update(over.work, t)
      s.padsMoved = over.work > 0.002
    }

    // The cassettes float up and turn towards you, with their reels running.
    tapes.forEach((tape, i) => {
      if (over.archive < 0.002) {
        tape.node.position.copy(tape.position)
        tape.node.quaternion.copy(tape.quaternion)
        return
      }
      tape.node.position.y = tape.position.y + over.archive * (i === 0 ? 0.55 : 0.32) + Math.sin(t * 2.2 + i) * 0.035 * over.archive
      euler.set(i === 0 ? over.archive * 0.5 : 0, Math.sin(t * 1.3 + i) * 0.28 * over.archive, 0)
      tilt.setFromEuler(euler)
      tape.node.quaternion.copy(tape.quaternion).premultiply(tilt)
    })
    if (over.archive > 0.002) for (const reel of reels) reel.rotateY(dt * 7 * over.archive)

    // The console runs up: the mechanism spins hard and the cartridge rises out of its bay.
    // The ears hunt for a signal while pointed at, and search more gently through Contact.
    if (ears) ears.update(reducedMotion ? 0 : Math.max(over.contact, chapter === 'contact' ? 0.35 : 0), t)

    if (clip) clip.timeScale = damp(clip.timeScale, dead ? 0 : hovered === 'toolbox' && !reducedMotion ? 3 : chapter === 'toolbox' ? 1.4 : 0.2, 3, dt)

    // Each new work reseats the cartridge: it lifts out of the bay and drops back in.
    if (screen !== s.screen) {
      if (s.screen !== null && screen.startsWith('work-') && !reducedMotion) s.hop = 0
      s.screen = screen
    }
    if (cart) {
      s.hop = Math.min(1, s.hop + dt * 1.4)
      const lift = Math.max(Math.sin(Math.PI * Math.min(1, s.hop * 1.15)) ** 2, over.toolbox)
      cart.position.y = cartY + lift * 0.5 + Math.sin(t * 2.4) * 0.025 * over.toolbox
      cart.rotation.z = lift * 0.12
    }
  })

  const handlers = (id) => ({
    onPointerOver: (e) => {
      e.stopPropagation()
      if (getSnapshot().screen === SHATTER_ON) return
      setHovered(id)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => { setHovered(null); document.body.style.cursor = '' },
    onPointerDown: (e) => {
      e.stopPropagation()
      if (getSnapshot().screen === SHATTER_ON) return
      state.current.press = { id, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
    },
  })

  return (
    <group>
      <primitive object={scene} />
      <group ref={screenRig}>
        <MonitorScreen position={[-0.025, 1.9, -2.74]} size={[2.3, 1.56]} powered={powered} />
      </group>
      <primitive object={dust.points} />
      <Signal position={ANTENNA} />
      <pointLight ref={spillLight} position={[0, 1.7, -1.9]} intensity={0} distance={7} decay={1.4} color={color('phosphor')} />
      <mesh ref={spill} rotation-x={-Math.PI / 2} position={[0, 0.014, -1.25]} visible={false}>
        <planeGeometry args={[6, 3.6]} />
        <meshBasicMaterial map={pool} color={color('phosphor')} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={scanner} rotation-x={-Math.PI / 2} position={[0, 0, -1.15]} visible={false}>
        <ringGeometry args={[3.9, 4.0, 128]} />
        <meshBasicMaterial color={color('phosphor')} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      {proxies.map((p) => (
        <mesh key={p.key} position={p.center} {...handlers(p.id)}>
          <boxGeometry args={p.size} />
          <meshBasicMaterial visible={false} />
        </mesh>
      ))}
    </group>
  )
}

useGLTF.preload(MODEL_URL)

export default ConsoleModel
