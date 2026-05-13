import React, { useRef, useState, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const IslandModel = ({ onMonitorClick, onGamepadClick, onAntennaClick, monitorOn, section, ...props }) => {
  const group    = useRef()
  const cassetteRef = useRef()
  const { nodes, materials, animations } = useGLTF('/scene.gltf')
  const { actions } = useAnimations(animations, group)
  const [gpHover, setGpHover] = useState(false)
  const cassetteT = useRef(0)

  useEffect(() => {
    materials.Monitor_screen.emissive       = new THREE.Color(0x00ff88)
    materials.Monitor_screen.emissiveIntensity = 0
    materials.Gamepad_and_cartridge.emissive = new THREE.Color(0x4466ff)
    materials.Gamepad_and_cartridge.emissiveIntensity = 0
    materials.VGS_details_two_mat.emissive  = new THREE.Color(0xff44aa)
    materials.VGS_details_two_mat.emissiveIntensity = 0
  }, [materials])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Float
    if (group.current) group.current.position.y = -0.6 + Math.sin(t * 0.5) * 0.08

    // Monitor flicker
    materials.Monitor_screen.emissiveIntensity = monitorOn
      ? 0.35 + Math.sin(t * 20) * 0.08 + Math.sin(t * 7) * 0.05
      : Math.max(0, materials.Monitor_screen.emissiveIntensity - 0.05)

    // Cassette insertion animation when about section active
    if (section === 'about' && cassetteRef.current) {
      cassetteT.current = Math.min(1, cassetteT.current + delta * 0.6)
      const ease = 1 - Math.pow(1 - cassetteT.current, 3) // ease out cubic
      cassetteRef.current.position.y = THREE.MathUtils.lerp(0.577, 0.45, ease)
      cassetteRef.current.position.x = THREE.MathUtils.lerp(0.648, 0.0, ease)
      cassetteRef.current.position.z = THREE.MathUtils.lerp(0.245, -0.5, ease)
    } else if (section !== 'about') {
      cassetteT.current = 0
    }

    // Gamepad pulse for projects section
    const gpTarget = section === 'projects' ? 0.4 + Math.sin(t * 3) * 0.15
                   : gpHover               ? 0.3
                   : 0
    materials.Gamepad_and_cartridge.emissiveIntensity +=
      (gpTarget - materials.Gamepad_and_cartridge.emissiveIntensity) * 0.08

    // Antenna pulse for contact section
    const antennaTarget = section === 'contact' ? 0.3 + Math.sin(t * 5) * 0.2 : 0
    materials.VGS_details_two_mat.emissiveIntensity +=
      (antennaTarget - materials.VGS_details_two_mat.emissiveIntensity) * 0.08
  })

  const setCursor = (v) => { document.body.style.cursor = v }

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Load_block_item001_1">
                <mesh name="Object_9" geometry={nodes.Object_9.geometry} material={materials.Monitor_screen} />
              </group>
              <group name="Load_block_item002_2">
                <mesh name="Object_11" geometry={nodes.Object_11.geometry} material={materials.Monitor_screen} />
              </group>
              <group name="Load_block_item003_3">
                <mesh name="Object_13" geometry={nodes.Object_13.geometry} material={materials.Monitor_screen} />
              </group>
              <group name="Load_block_item004_4">
                <mesh name="Object_15" geometry={nodes.Object_15.geometry} material={materials.Monitor_screen} />
              </group>
              <group name="Load_block_item005_5">
                <mesh name="Object_17" geometry={nodes.Object_17.geometry} material={materials.Monitor_screen} />
              </group>
              <group name="Load_block_item006_6">
                <mesh name="Object_19" geometry={nodes.Object_19.geometry} material={materials.Monitor_screen} />
              </group>
              <group name="fan_27" position={[-0.034, 0.584, -0.661]}>
                <mesh name="Object_67" geometry={nodes.Object_67.geometry} material={materials.VGS_details_two_mat} />
              </group>
              <group name="lent_big002_28" position={[0.506, 0.595, 0.425]}>
                <mesh name="Object_69" geometry={nodes.Object_69.geometry} material={materials.Gamepad_and_cartridge} />
              </group>
              <group name="lent_small002_29" position={[0.793, 0.595, 0.089]}>
                <mesh name="Object_71" geometry={nodes.Object_71.geometry} material={materials.Gamepad_and_cartridge} />
              </group>
              <group name="roller001_30" position={[0.793, 0.529, 0.089]}>
                <mesh name="Object_73" geometry={nodes.Object_73.geometry} material={materials.VGS_details_two_mat} />
              </group>
              <group name="roller002_31" position={[0.506, 0.529, 0.425]}>
                <mesh name="Object_75" geometry={nodes.Object_75.geometry} material={materials.VGS_details_two_mat} />
              </group>

              {/* ✦ Clickable Monitor */}
              <group name="Lumen_Monitor_0" position={[-0.025, 0.263, -3.69]}
                onClick={onMonitorClick}
                onPointerOver={() => setCursor('pointer')}
                onPointerOut={() => setCursor('default')}>
                <mesh name="Object_4" geometry={nodes.Object_4.geometry} material={materials.Monitor_body_mat} />
                <mesh name="Object_5" geometry={nodes.Object_5.geometry} material={materials.Monitor_details_one_mat} />
                <mesh name="Object_6" geometry={nodes.Object_6.geometry} material={materials.Monitor_glass_mat} />
                <mesh name="Object_7" geometry={nodes.Object_7.geometry} material={materials.Monitor_details_two_mat} />
              </group>

              {/* ✦ Animated cassette (About) */}
              <group ref={cassetteRef} name="Bricktris_9" position={[0.648, 0.577, 0.245]} rotation={[0, -Math.PI / 2, 0]}>
                <group name="front_sticker_7" position={[0.051, 0.15, 0.01]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_24" geometry={nodes.Object_24.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <group name="lent001_8" position={[0.04, -0.007, -0.035]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
                  <mesh name="Object_26" geometry={nodes.Object_26.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <mesh name="Object_21" geometry={nodes.Object_21.geometry} material={materials.Gamepad_and_cartridge} />
                <mesh name="Object_22" geometry={nodes.Object_22.geometry} material={materials.Glass} />
              </group>

              <group name="Bricktris_copy_14" position={[-2.52, 0.072, 1.591]} rotation={[0, -0.873, Math.PI]}>
                <group name="front_sticker002_10" position={[0.051, 0.15, 0.01]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_31" geometry={nodes.Object_31.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <group name="lent_11" position={[0.04, -0.007, -0.035]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
                  <mesh name="Object_33" geometry={nodes.Object_33.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <group name="lent_big_12" position={[0.181, 0.018, 0.142]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_35" geometry={nodes.Object_35.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <group name="lent_small_13" position={[-0.156, 0.018, -0.145]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_37" geometry={nodes.Object_37.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <mesh name="Object_28" geometry={nodes.Object_28.geometry} material={materials.Gamepad_and_cartridge} />
                <mesh name="Object_29" geometry={nodes.Object_29.geometry} material={materials.Glass} />
              </group>

              {/* ✦ Hoverable + pulsing Gamepads (Projects) */}
              <group name="gamepad_1_15" position={[1.197, 0.058, 2.397]} rotation={[0, Math.PI / 6, 0]}
                onClick={onGamepadClick} onPointerOver={() => { setGpHover(true); setCursor('pointer') }}
                onPointerOut={() => { setGpHover(false); setCursor('default') }}>
                <mesh name="Object_39" geometry={nodes.Object_39.geometry} material={materials.Gamepad_and_cartridge} />
              </group>
              <group name="gamepad_2_16" position={[2.119, 0.228, 1.283]} rotation={[1.319, -0.074, 0.281]}
                onClick={onGamepadClick} onPointerOver={() => { setGpHover(true); setCursor('pointer') }}
                onPointerOut={() => { setGpHover(false); setCursor('default') }}>
                <mesh name="Object_41" geometry={nodes.Object_41.geometry} material={materials.Gamepad_and_cartridge} />
              </group>

              <group name="Lumen_Video_Game_System_21" position={[-0.382, 1.053, -0.126]} rotation={[0, -Math.PI / 2, 0]}>
                <group name="Lock_cartridge_17" position={[-0.194, -0.545, -1.026]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_48" geometry={nodes.Object_48.geometry} material={materials.VGS_details_two_mat} />
                </group>
                <group name="Reader_18" position={[0.384, -0.623, -1.026]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_50" geometry={nodes.Object_50.geometry} material={materials.VGS_details_two_mat} />
                </group>
                <group name="Side_lock_cartridge_20" position={[0.369, -0.578, -0.559]} rotation={[0, Math.PI / 2, 0]}>
                  <group name="eject_gear_19" position={[0, 0.121, 0]}>
                    <mesh name="Object_54" geometry={nodes.Object_54.geometry} material={materials.VGS_details_two_mat} />
                  </group>
                  <mesh name="Object_52" geometry={nodes.Object_52.geometry} material={materials.VGS_details_two_mat} />
                </group>
                <mesh name="Object_43" geometry={nodes.Object_43.geometry} material={materials.VGS_body_mat} />
                <mesh name="Object_44" geometry={nodes.Object_44.geometry} material={materials.VGS_details_one_mat} />
                <mesh name="Object_45" geometry={nodes.Object_45.geometry} material={materials.Glass} />
                <mesh name="Object_46" geometry={nodes.Object_46.geometry} material={materials.VGS_details_two_mat} />
              </group>
              <group name="Super_Lumia_Bros_26" position={[-2.652, 0.458, 0.587]} rotation={[Math.PI, Math.PI / 4, -Math.PI / 2]}>
                <group name="front_sticker001_22" position={[0.051, 0.15, 0.01]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_59" geometry={nodes.Object_59.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <group name="lent002_23" position={[0.04, -0.007, -0.035]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
                  <mesh name="Object_61" geometry={nodes.Object_61.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <group name="lent_big001_24" position={[0.181, 0.018, 0.142]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_63" geometry={nodes.Object_63.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <group name="lent_small001_25" position={[-0.156, 0.018, -0.145]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh name="Object_65" geometry={nodes.Object_65.geometry} material={materials.Gamepad_and_cartridge} />
                </group>
                <mesh name="Object_56" geometry={nodes.Object_56.geometry} material={materials.Gamepad_and_cartridge} />
                <mesh name="Object_57" geometry={nodes.Object_57.geometry} material={materials.Glass} />
              </group>
              <group name="Lumen_logo_32" position={[-0.025, 1.902, -2.765]}>
                <mesh name="Object_77" geometry={nodes.Object_77.geometry} material={materials.Monitor_screen} />
              </group>

              {/* ✦ Antenna / TV — custom material (lighter gray) */}
              <group name="Lumen_TV_35" position={[2.955, 0.156, -2.17]} rotation={[0, Math.PI / 9, 0]} onClick={onAntennaClick} onPointerOver={() => setCursor('pointer')} onPointerOut={() => setCursor('default')}>
                <mesh name="Object_79" geometry={nodes.Object_79.geometry}>
                  <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2}
                    emissive={new THREE.Color(0xff44aa)}
                    emissiveIntensity={section === 'contact' ? 0.3 : 0} />
                </mesh>
              </group>
              <group name="Signal_cable_36" position={[-0.726, 0.432, -1.165]}>
                <mesh name="Object_81" geometry={nodes.Object_81.geometry}>
                  <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/scene.gltf')
export default IslandModel