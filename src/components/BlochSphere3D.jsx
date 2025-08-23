import  React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Text, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function  BlochSphere({ vector, index, vectors }) { 
  const sphereRef = useRef()
  const arrowRef = useRef()
  const pointRef = useRef()

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.001
    }
    if (pointRef.current) {
      pointRef.current.material.emissiveIntensity = 0.5 + 0.3 * Math.sin(state.clock.elapsedTime * 2)
    }
  })

  const arrowGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(0.03, 0.1, 8)
    geometry.translate(0, 0.05, 0)
    return geometry
  }, [])

  const linePoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(vector.x, vector.z, -vector.y)
  ], [vector])

  return (
       <group position={[index * (vectors.length === 1 ? 0 : 3), 0, 0]}> 
      <Sphere ref={sphereRef} args={[1, 64, 32]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#1e293b"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>

      <Sphere args={[1.01, 32, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.05}
          wireframe
        />
      </Sphere>

      <Line
        points={[[-1.2, 0, 0], [1.2, 0, 0]]}
        color="#64748b"
        lineWidth={1}
        transparent
        opacity={0.6}
      />
      <Line
        points={[[0, -1.2, 0], [0, 1.2, 0]]}
        color="#64748b"
        lineWidth={1}
        transparent
        opacity={0.6}
      />
      <Line
        points={[[0, 0, -1.2], [0, 0, 1.2]]}
        color="#64748b"
        lineWidth={1}
        transparent
        opacity={0.6}
      />

      <Line
        points={linePoints}
        color="#ef4444"
        lineWidth={3}
      />

      <mesh
        ref={pointRef}
        position={[vector.x, vector.z, -vector.y]}
        geometry={arrowGeometry}
        rotation={[
          Math.atan2(vector.y, Math.sqrt(vector.x ** 2 + vector.z ** 2)),
          Math.atan2(vector.x, -vector.y),
          0
        ]}
      >
        <meshPhysicalMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <mesh position={[vector.x, vector.z, -vector.y]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshPhysicalMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      <Text
        position={[0, 1.4, 0]}
        fontSize={0.15}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
      >
        |0⟩
      </Text>
      <Text
        position={[0, -1.4, 0]}
        fontSize={0.15}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
      >
        |1⟩
      </Text>
      <Text
        position={[1.4, 0, 0]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      <Text
        position={[0, 0, 1.4]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>

      <Text
        position={[0, -2, 0]}
        fontSize={0.2}
        color="#6366f1"
        anchorX="center"
        anchorY="middle"
      >
        Qubit {vector.id}
      </Text>
    </group>
  )
}

function  Scene({ vectors }) {
  const spacing = vectors.length > 1 ? 3 : 0
  
  return (
    <>
      <PerspectiveCamera makeDefault position={vectors.length > 1 ? [6, 3, 6] : [3, 2, 3]} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={vectors.length > 1 ? 20 : 8}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
      
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#3b82f1" />
      
           {vectors.map((vector, index) => (
        <BlochSphere 
          key={vector.id} 
          vector={vector} 
          index={vectors.length === 1 ? 0 : index}
          vectors={vectors}
        />
      ))} 
    </>
  )
} 

export default function BlochSphere3D({ vectors }) {
  if (!vectors || vectors.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-xl border border-slate-700/50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-slate-900 rounded-full"></div>
          </div>
          <p className="text-slate-400">Build a circuit to visualize qubits</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [4, 2, 4], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Scene vectors={vectors} />
      </Canvas>
    </div>
  )
}
 