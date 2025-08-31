import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Text, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

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
    
    // Enhanced logging for production debugging
    if (process.env.NODE_ENV === 'production') {
      console.error('Production 3D error details:', {
        error: error.message,
        stack: error.stack,
        errorInfo,
        userAgent: navigator.userAgent,
        webGLSupport: this.checkWebGLSupport(),
        timestamp: new Date().toISOString()
      })
    }
  }

  checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return {
        supported: !!gl,
        version: gl ? gl.getParameter(gl.VERSION) : null,
        vendor: gl ? gl.getParameter(gl.VENDOR) : null,
        renderer: gl ? gl.getParameter(gl.RENDERER) : null
      }
    } catch (e) {
      return { supported: false, error: e.message }
    }
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
      const webglInfo = this.checkWebGLSupport()
      const canRetry = this.state.retryCount < this.maxRetries
      
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
                ? 'The 3D graphics context was lost. This can happen due to resource constraints or graphics driver issues.'
                : 'WebGL may not be supported or enabled in your browser'
              }
            </p>
            
            {!webglInfo.supported && (
              <div className="text-xs text-slate-500 mb-4 p-3 bg-slate-800/50 rounded">
                <p><strong>WebGL Status:</strong> Not supported</p>
                <p><strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}</p>
              </div>
            )}
            
            <div className="space-y-2">
              {canRetry && (
                <button 
                  onClick={this.handleRetry}
                  className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                </button>
              )}
              
              <div className="text-xs text-slate-500">
                <p>💡 Try:</p>
                <ul className="text-left mt-1 space-y-1">
                  <li>• Refresh the page</li>
                  <li>• Close other browser tabs</li>
                  <li>• Enable hardware acceleration</li>
                  <li>• Update your graphics drivers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function  BlochSphere({ vector, index, vectors }) { 
  const sphereRef = useRef()
  const arrowRef = useRef()
  const pointRef = useRef()

  useFrame((state) => {
    // Add null checks to prevent errors during context loss
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.001
    }
    if (pointRef.current && pointRef.current.material) {
      pointRef.current.material.emissiveIntensity = 0.5 + 0.3 * Math.sin(state.clock.elapsedTime * 2)
    }
  })

  // Reduced geometry complexity for better memory usage
  const arrowGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(0.03, 0.1, 6) // Reduced from 8 to 6 segments
    geometry.translate(0, 0.05, 0)
    return geometry
  }, [])

  const linePoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(vector.x, vector.z, -vector.y)
  ], [vector])

  return (
       <group position={[index * (vectors.length === 1 ? 0 : 3), 0, 0]}> 
      {/* Reduced sphere complexity for better memory usage */}
      <Sphere ref={sphereRef} args={[1, 32, 16]} position={[0, 0, 0]}> {/* Reduced from 64,32 to 32,16 */}
        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={0.15}
        />
      </Sphere>

      <Sphere args={[1.01, 16, 8]} position={[0, 0, 0]}> {/* Reduced from 32,16 to 16,8 */}
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
        <meshBasicMaterial
          color="#ef4444"
        />
      </mesh>

      <mesh position={[vector.x, vector.z, -vector.y]}>
        <sphereGeometry args={[0.05, 8, 8]} /> {/* Reduced from 16,16 to 8,8 */}
        <meshBasicMaterial
          color="#fbbf24"
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
      
      {/* Simplified lighting for better performance */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.4}
      />
      
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

// Enhanced WebGL Canvas with context loss handling
function WebGLCanvas({ children, vectors }) {
  const [contextLost, setContextLost] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleContextLost = (event) => {
      console.warn('WebGL context lost, attempting recovery...')
      event.preventDefault()
      setContextLost(true)
      
      // Attempt automatic recovery after a short delay
      setTimeout(() => {
        setContextLost(false)
        setRetryKey(prev => prev + 1)
      }, 1000)
    }

    const handleContextRestored = () => {
      console.log('WebGL context restored successfully')
      setContextLost(false)
    }

    // Add event listeners for context loss/restore
    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost)
        canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      }
    }
  }, [])

  if (contextLost) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-xl border border-slate-700/50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
          </div>
          <p className="text-slate-400">Recovering 3D graphics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
      <Canvas
        key={retryKey} // Force remount on retry
        ref={canvasRef}
        camera={{ position: [4, 2, 4], fov: 60 }}
        gl={{ 
          antialias: false, // Disabled for better performance
          alpha: true,
          powerPreference: "default", // Changed from "high-performance" to be more compatible
          preserveDrawingBuffer: true, // Help prevent context loss
          failIfMajorPerformanceCaveat: false, // Allow software rendering as fallback
          premultipliedAlpha: false,
          stencil: false,
          depth: true
        }}
        onCreated={(state) => {
          // Enhanced WebGL context setup
          const { gl } = state
          try {
            // Enable context loss extension if available
            const loseContext = gl.getExtension('WEBGL_lose_context')
            if (loseContext) {
              console.log('WebGL_lose_context extension available')
            }
            
            // Log WebGL info for debugging
            console.log('WebGL Context Info:', {
              version: gl.getParameter(gl.VERSION),
              vendor: gl.getParameter(gl.VENDOR),
              renderer: gl.getParameter(gl.RENDERER),
              maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
              maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
            })
          } catch (error) {
            console.warn('Error getting WebGL context info:', error)
          }
        }}
      >
        {children}
      </Canvas>
    </div>
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
    <BlochSphere3DErrorBoundary>
      <WebGLCanvas vectors={vectors}>
        <Scene vectors={vectors} />
      </WebGLCanvas>
    </BlochSphere3DErrorBoundary>
  )
}
 