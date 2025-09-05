import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Text, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// Performance monitoring utility
const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useEffect(() => {
    let frameId
    const updateFps = () => {
      frameCount.current++
      const currentTime = performance.now()
      if (currentTime - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)))
        frameCount.current = 0
        lastTime.current = currentTime
      }
      frameId = requestAnimationFrame(updateFps)
    }
    frameId = requestAnimationFrame(updateFps)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return fps
}

// Visibility detection hook using Intersection Observer
const useVisibility = (ref) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(ref.current)

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref])

  return isVisible
}

// Optimized BlochSphere component with reduced geometry complexity
function BlochSphere({ vector, index, vectors, isVisible }) {
  const sphereRef = useRef()
  const arrowRef = useRef()
  const pointRef = useRef()
  const groupRef = useRef()

  // Reduced animation when not visible
  useFrame((state) => {
    if (!isVisible) return

    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0005 // Slower rotation for better performance
    }
    if (pointRef.current && pointRef.current.material) {
      pointRef.current.material.emissiveIntensity = 0.3 + 0.2 * Math.sin(state.clock.elapsedTime)
    }
  })

  // Further reduced geometry complexity for better memory usage
  const arrowGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(0.02, 0.08, 4) // Reduced segments from 6 to 4
    geometry.translate(0, 0.04, 0)
    return geometry
  }, [])

  const linePoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(vector.x, vector.z, -vector.y)
  ], [vector])

  // Memoize positions to prevent unnecessary re-renders
  const position = useMemo(() => [
    index * (vectors.length === 1 ? 0 : 2.5), 0, 0 // Reduced spacing from 3 to 2.5
  ], [index, vectors.length])

  // Define colors for different qubits
  const qubitColors = useMemo(() => [
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#8b5cf6'  // purple
  ], [])

  const qubitColor = qubitColors[vector.id % qubitColors.length] || '#3b82f6'

  // Define unique patterns for each qubit
  const getQubitPattern = (qubitId) => {
    const patterns = [
      '', // solid
      'dashed', // dashed
      'dotted', // dotted
      'dashdot', // dash-dot
    ]
    return patterns[qubitId % patterns.length]
  }

  const qubitPattern = getQubitPattern(vector.id)

  return (
    <group ref={groupRef} position={position}>
      {/* Qubit label */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.15}
        color={qubitColor}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        Qubit {vector.id}
      </Text>
      
      {/* Further reduced sphere complexity */}
      <Sphere ref={sphereRef} args={[1, 16, 8]} position={[0, 0, 0]}> {/* Reduced from 32,16 to 16,8 */}
        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={0.1}
        />
      </Sphere>

      <Sphere args={[1.01, 8, 4]} position={[0, 0, 0]}> {/* Reduced from 16,8 to 8,4 */}
        <meshBasicMaterial
          color={qubitColor}
          transparent
          opacity={0.03}
          wireframe
        />
      </Sphere>

      {/* Simplified axis lines */}
      <Line
        points={[[-1, 0, 0], [1, 0, 0]]}
        color="#64748b"
        lineWidth={0.5}
        transparent
        opacity={0.4}
      />
      <Line
        points={[[0, -1, 0], [0, 1, 0]]}
        color="#64748b"
        lineWidth={0.5}
        transparent
        opacity={0.4}
      />
      <Line
        points={[[0, 0, -1], [0, 0, 1]]}
        color="#64748b"
        lineWidth={0.5}
        transparent
        opacity={0.4}
      />

      <Line
        points={linePoints}
        color={qubitColor}
        lineWidth={2}
        dashed={qubitPattern === 'dashed' || qubitPattern === 'dashdot'}
        dashSize={qubitPattern === 'dashed' ? 0.2 : 0.1}
        gapSize={qubitPattern === 'dashed' ? 0.1 : 0.05}
      />

      <mesh
        ref={pointRef}
        position={[vector.x, vector.z, -vector.y]}
        geometry={arrowGeometry}
      >
        <meshBasicMaterial
          color={qubitColor}
        />
      </mesh>

      <mesh position={[vector.x, vector.z, -vector.y]}>
        <sphereGeometry args={[0.03, 6, 6]} /> {/* Reduced from 8,8 to 6,6 */}
        <meshBasicMaterial
          color="#fbbf24"
        />
      </mesh>

      {/* Enhanced labels with background for better visibility */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.12}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
      >
        |0⟩
      </Text>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.12}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
      >
        |1⟩
      </Text>
      
      {/* Add coordinate axis labels */}
      <Text
        position={[1.2, 0, 0]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Z
      </Text>
    </group>
  )
}

// Optimized Scene component with visibility-based rendering
function Scene({ vectors }) {
  const groupRef = useRef()
  const [visibleSpheres, setVisibleSpheres] = useState([])
  
  // Virtualization for large circuits - only render visible spheres
  useEffect(() => {
    if (vectors.length <= 5) {
      setVisibleSpheres(vectors)
    } else {
      // For large circuits, only show first 5 spheres to prevent performance issues
      setVisibleSpheres(vectors.slice(0, 5))
    }
  }, [vectors])

  // Calculate optimal camera position based on number of qubits
  const cameraPosition = useMemo(() => {
    if (visibleSpheres.length <= 1) {
      return [2.5, 1.5, 2.5]
    } else if (visibleSpheres.length <= 3) {
      return [5, 2, 5]
    } else {
      return [7, 3, 7]
    }
  }, [visibleSpheres.length])

  // Calculate optimal spacing between spheres
  const sphereSpacing = useMemo(() => {
    if (visibleSpheres.length <= 2) {
      return 3.0
    } else if (visibleSpheres.length <= 4) {
      return 2.5
    } else {
      return 2.0
    }
  }, [visibleSpheres.length])

  // Define colors for different qubits
  const qubitColors = useMemo(() => [
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#8b5cf6'  // purple
  ], [])

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1.5}
        maxDistance={visibleSpheres.length > 1 ? 20 : 8}
        autoRotate={false}
        autoRotateSpeed={0.2} // Slower rotation
      />
      
      {/* Minimal lighting for better performance */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 3, 3]}
        intensity={0.3}
      />
      
      {visibleSpheres.map((vector, index) => (
        <BlochSphere 
          key={vector.id} 
          vector={vector} 
          index={index}
          vectors={visibleSpheres}
        />
      ))}
      
      {/* Add a title for the visualization */}
      {visibleSpheres.length > 1 && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.2}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Bloch Sphere Visualization - {visibleSpheres.length} Qubit{visibleSpheres.length > 1 ? 's' : ''}
        </Text>
      )}
      
      {/* Add a legend for qubit colors */}
      {visibleSpheres.length > 1 && (
        <group position={[-5, -2, 0]}>
          {visibleSpheres.slice(0, Math.min(4, visibleSpheres.length)).map((vector, index) => (
            <group key={vector.id} position={[0, -index * 0.3, 0]}>
              <Text
                position={[0.3, 0, 0]}
                fontSize={0.1}
                color="#e2e8f0"
                anchorX="left"
                anchorY="middle"
              >
                Qubit {vector.id}
              </Text>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color={qubitColors[vector.id % qubitColors.length] || '#3b82f6'} />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </>
  )
}

// Enhanced WebGL Canvas with performance optimizations
function WebGLCanvas({ children, vectors }) {
  const canvasRef = useRef()
  const [retryKey, setRetryKey] = useState(0)
  const fps = usePerformanceMonitor()
  const isLowPerformance = fps < 30

  // Adjust rendering quality based on performance
  const glSettings = useMemo(() => ({
    antialias: !isLowPerformance, // Disable antialiasing on low performance
    alpha: true,
    powerPreference: "low-power", // Use low power for better battery life
    preserveDrawingBuffer: false, // Disable to save memory
    failIfMajorPerformanceCaveat: false,
    premultipliedAlpha: false,
    stencil: false,
    depth: true
  }), [isLowPerformance])

  if (isLowPerformance && vectors.length > 3) {
    // Show simplified version for low-end devices with many qubits
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-xl border border-slate-700/50">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-slate-900 rounded-full"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Simplified View</h3>
          <p className="text-slate-400 text-sm mb-4">
            Showing first 3 qubits for better performance
          </p>
          <p className="text-xs text-slate-500">
            Current FPS: {fps} (Recommended: 30+)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
      <Canvas
        key={retryKey}
        ref={canvasRef}
        camera={{ position: [3, 1.5, 3], fov: 50 }}
        gl={glSettings}
        frameloop={isLowPerformance ? "demand" : "always"} // Only render when needed on low performance
        dpr={isLowPerformance ? [1, 1.5] : [1, 2]} // Lower pixel ratio on low performance
      >
        {children}
      </Canvas>
      {isLowPerformance && (
        <div className="absolute top-2 right-2 bg-red-900/50 text-red-300 text-xs px-2 py-1 rounded">
          Performance Mode: {fps} FPS
        </div>
      )}
    </div>
  )
}

// Enhanced Error Boundary Component with WebGL context loss handling
class BlochSphere3DErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      contextLost: false,
      retryCount: 0
    }
    this.maxRetries = 3
  }

  static getDerivedStateFromError(error) {
    const isContextLoss = error.message?.includes('WebGL') || 
                         error.message?.includes('Context Lost') ||
                         error.name === 'WebGLContextLostEvent'
    
    return { 
      hasError: true, 
      error,
      contextLost: isContextLoss
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('BlochSphere3D Error:', error, errorInfo)
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({ 
        hasError: false, 
        error: null, 
        contextLost: false,
        retryCount: this.state.retryCount + 1
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <div className="text-center p-6 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            </div>
            
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              {this.state.contextLost ? 'WebGL Context Lost' : '3D Rendering Error'}
            </h3>
            
            <p className="text-slate-400 text-sm mb-4">
              {this.state.contextLost 
                ? 'The 3D graphics context was lost. This can happen due to resource constraints.'
                : 'WebGL may not be supported or enabled in your browser'
              }
            </p>
            
            {this.state.retryCount < this.maxRetries && (
              <button 
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                Try Again ({this.maxRetries - this.state.retryCount} attempts left)
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
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
    <BlochSphere3DErrorBoundary>
      <WebGLCanvas vectors={vectors}>
        <Scene vectors={vectors} />
      </WebGLCanvas>
    </BlochSphere3DErrorBoundary>
  )
}