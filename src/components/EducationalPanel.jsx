import { useState, useEffect } from 'react'
import { Book, Brain, ChevronDown, ChevronUp, Target, Calculator, ArrowRight, BookOpen, Zap, MessageCircle } from 'lucide-react'
import ResizablePanel from './ResizablePanel'

export default function EducationalPanel({ content, difficulty = 'beginner', circuit, onExplainMatrices }) {
  const [expandedSection, setExpandedSection] = useState('matrices')
  const [panelSize, setPanelSize] = useState({
    width: parseInt(localStorage.getItem('educationalPanelWidth')) || 600,
    height: parseInt(localStorage.getItem('educationalPanelHeight')) || 700
  })

  console.log('EducationalPanel received content:', content) // Debug log

  const handleResize = (event, { size }) => {
    setPanelSize(size);
    localStorage.setItem('educationalPanelWidth', size.width);
    localStorage.setItem('educationalPanelHeight', size.height);
  };

  if (!content || (!content.current_concepts && !content.explanation)) {
    return (
      <ResizablePanel
        width={panelSize.width}
        height={panelSize.height}
        minWidth={400}
        minHeight={500}
        maxWidth={900}
        maxHeight={1200}
        onResizeStop={handleResize}
      >
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 h-full">
          <div className="flex items-center gap-3 mb-4">
            <Book className="text-blue-400" size={20} />
            <h3 className="text-lg font-semibold">Educational Content</h3>
          </div>
          <div className="text-center py-8">
            <Brain size={48} className="text-slate-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400">Build a circuit to see educational insights</p>
          </div>
        </div>
      </ResizablePanel>
    )
  }

  // Handle both direct content and nested explanation structure
  const actualContent = content.explanation || content

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const formatMatrix = (matrix) => {
    if (!matrix || !Array.isArray(matrix)) {
      return (
        <div className="bg-red-900/20 p-3 rounded border border-red-800/30 text-center">
          <p className="text-red-300 text-sm">Matrix not available</p>
          <p className="text-red-400 text-xs mt-1">Backend may still be generating the matrix data</p>
        </div>
      )
    }
    
    const matrixSize = matrix.length
    const isLarge = matrixSize > 2
    
    return (
      <div className="space-y-2">
        <div className="overflow-x-auto bg-slate-800/30 p-3 rounded border">
          <div className={`${isLarge ? 'text-sm leading-relaxed' : 'text-base'} font-mono inline-block min-w-full`}>
            {matrix.map((row, i) => (
              <div key={i} className="flex justify-start items-center gap-1 whitespace-nowrap mb-1">
                <span className="text-slate-400 flex-shrink-0 text-lg">[</span>
                <div className={`flex ${isLarge ? 'gap-1' : 'gap-2'} flex-wrap`}>
                  {row.map((val, j) => {
                    const real = typeof val === 'object' && val.real !== undefined ? val.real : (typeof val === 'number' ? val : 0)
                    const imag = typeof val === 'object' && val.imag !== undefined ? val.imag : 0
                    
                    // Format complex numbers with better precision
                    let displayValue
                    if (Math.abs(imag) < 0.0001) {
                      displayValue = isLarge ? real.toFixed(3) : real.toFixed(3)
                    } else if (Math.abs(real) < 0.0001) {
                      displayValue = isLarge ? `${imag.toFixed(3)}i` : `${imag.toFixed(3)}i`
                    } else {
                      const realPart = real.toFixed(2)
                      const imagPart = imag.toFixed(2)
                      displayValue = `${realPart}${imag >= 0 ? '+' : ''}${imagPart}i`
                    }
                    
                    return (
                      <span 
                        key={j} 
                        className={`text-blue-300 ${isLarge ? 'px-1 min-w-[50px]' : 'px-2 min-w-[70px]'} text-center block bg-slate-700/20 rounded py-1`}
                        style={{ fontSize: isLarge ? '13px' : '15px' }}
                      >
                        {displayValue}
                        {j < row.length - 1 && <span className="text-slate-400 ml-1">,</span>}
                      </span>
                    )
                  })}
                </div>
                <span className="text-slate-400 flex-shrink-0 text-lg">]</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center text-slate-500 text-xs mt-2 font-medium">
          {isLarge ? `${matrixSize}×${matrixSize} quantum gate matrix` : 'Quantum gate matrix'}
        </div>
      </div>
    )
  }

  const renderDensityMatrixSteps = () => {
    const steps = actualContent.density_matrix_steps || []
    
    if (steps.length === 0) {
      return (
        <div className="text-center py-4">
          <Calculator size={32} className="text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Simulate circuit to see density matrix evolution</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <h4 className="font-medium text-slate-200">{step.operation || `Step ${index + 1}`}</h4>
              {index < steps.length - 1 && <ArrowRight size={14} className="text-slate-400" />}
            </div>
            
            {step.description && (
              <p className="text-sm text-slate-300 mb-3">{step.description}</p>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
              {step.initial_state && (
                <div>
                  <h5 className="text-xs font-medium text-slate-400 mb-2">Initial State ρ:</h5>
                  <div className="bg-slate-900/50 p-2 rounded border">
                    {formatMatrix(step.initial_state)}
                  </div>
                </div>
              )}
              
              {step.final_state && (
                <div>
                  <h5 className="text-xs font-medium text-slate-400 mb-2">Final State ρ':</h5>
                  <div className="bg-slate-900/50 p-2 rounded border">
                    {formatMatrix(step.final_state)}
                  </div>
                </div>
              )}
            </div>
            
            {step.gate_matrix && (
              <div className="mt-3">
                <h5 className="text-xs font-medium text-slate-400 mb-2">Gate Matrix U:</h5>
                <div className="bg-slate-900/50 p-2 rounded border">
                  {formatMatrix(step.gate_matrix)}
                </div>
              </div>
            )}
            
            {step.transformation && (
              <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-800/30">
                <p className="text-xs text-blue-300 font-mono">{step.transformation}</p>
              </div>
            )}
            
            {/* Explain button for this step */}
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => onExplainMatrices && onExplainMatrices({
                  circuit: circuit,
                  step: step,
                  index: index
                })}
                className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
              >
                <MessageCircle size={12} />
                Explain
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderTerminologySection = () => {
    const quantumTerms = [
      {
        symbol: '|ψ⟩',
        name: 'Quantum State',
        description: 'A quantum state vector representing the complete information about a quantum system',
        formula: '|ψ⟩ = α|0⟩ + β|1⟩',
        explanation: 'α and β are complex probability amplitudes'
      },
      {
        symbol: 'ρ',
        name: 'Density Matrix',
        description: 'Mathematical representation of quantum states, especially mixed states',
        formula: 'ρ = |ψ⟩⟨ψ|',
        explanation: 'For pure states, ρ is the outer product of the state vector with itself'
      },
      {
        symbol: 'U',
        name: 'Unitary Matrix',
        description: 'A reversible quantum operation that preserves probability',
        formula: 'U†U = I',
        explanation: 'U† is the conjugate transpose, I is the identity matrix'
      },
      {
        symbol: '⟨φ|ψ⟩',
        name: 'Inner Product',
        description: 'Overlap between two quantum states, related to probability',
        formula: '|⟨φ|ψ⟩|² = probability',
        explanation: 'The squared magnitude gives the transition probability'
      },
      {
        symbol: '⊗',
        name: 'Tensor Product',
        description: 'Mathematical operation to combine quantum systems',
        formula: '|ψ⟩ ⊗ |φ⟩',
        explanation: 'Used to describe multi-qubit systems'
      },
      {
        symbol: 'H',
        name: 'Hadamard Gate',
        description: 'Creates superposition of |0⟩ and |1⟩ states',
        formula: 'H = (1/√2)[[1,1],[1,-1]]',
        explanation: 'Transforms |0⟩ → (|0⟩+|1⟩)/√2, |1⟩ → (|0⟩-|1⟩)/√2'
      }
    ]

    const quantumConcepts = [
      {
        term: 'Superposition',
        definition: 'A quantum system being in multiple states simultaneously',
        example: 'A qubit can be both |0⟩ and |1⟩ at the same time'
      },
      {
        term: 'Entanglement',
        definition: 'Quantum correlation between particles that persists over distance',
        example: 'Bell state: (|00⟩ + |11⟩)/√2'
      },
      {
        term: 'Measurement',
        definition: 'Process that collapses superposition to a definite state',
        example: 'Measuring a qubit gives either |0⟩ or |1⟩ with certain probability'
      },
      {
        term: 'Decoherence',
        definition: 'Loss of quantum properties due to environmental interaction',
        example: 'Superposition gradually becomes classical mixture'
      },
      {
        term: 'Fidelity',
        definition: 'Measure of similarity between two quantum states',
        example: 'F = |⟨ψ|φ⟩|², ranges from 0 (orthogonal) to 1 (identical)'
      }
    ]

    return (
      <div className="space-y-4">
        {/* Quantum Symbols and Formulas */}
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
          <h5 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            <Zap size={14} className="text-purple-400" />
            Quantum Symbols & Formulas
          </h5>
          <div className="grid gap-3">
            {quantumTerms.map((term, index) => (
              <div key={index} className="bg-slate-800/30 rounded p-3 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <div className="text-lg font-mono text-purple-300 bg-purple-900/30 px-2 py-1 rounded min-w-[60px] text-center">
                    {term.symbol}
                  </div>
                  <div className="flex-1">
                    <h6 className="text-sm font-medium text-slate-200 mb-1">{term.name}</h6>
                    <p className="text-xs text-slate-300 mb-2">{term.description}</p>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-600/30">
                      <div className="text-xs font-mono text-blue-300 mb-1">{term.formula}</div>
                      <div className="text-xs text-slate-400">{term.explanation}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantum Concepts */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/30">
          <h5 className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-blue-400" />
            Key Quantum Concepts
          </h5>
          <div className="space-y-3">
            {quantumConcepts.map((concept, index) => (
              <div key={index} className="bg-slate-800/30 rounded p-3 border border-slate-700/50">
                <h6 className="text-sm font-medium text-blue-300 mb-1">{concept.term}</h6>
                <p className="text-xs text-slate-300 mb-2">{concept.definition}</p>
                <div className="text-xs text-slate-400 italic bg-slate-900/50 p-2 rounded border border-slate-600/30">
                  Example: {concept.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mathematical Notation Guide */}
        <div className="bg-green-900/20 rounded-lg p-4 border border-green-800/30">
          <h5 className="text-sm font-medium text-green-300 mb-3">Mathematical Notation Guide</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-green-300 bg-green-900/30 px-2 py-1 rounded">|0⟩, |1⟩</span>
                <span className="text-slate-300">Computational basis states</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-green-300 bg-green-900/30 px-2 py-1 rounded">α, β</span>
                <span className="text-slate-300">Complex probability amplitudes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-green-300 bg-green-900/30 px-2 py-1 rounded">†</span>
                <span className="text-slate-300">Conjugate transpose (dagger)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-green-300 bg-green-900/30 px-2 py-1 rounded">√</span>
                <span className="text-slate-300">Square root (normalization)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-green-300 bg-green-900/30 px-2 py-1 rounded">i</span>
                <span className="text-slate-300">Imaginary unit (√(-1))</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-green-300 bg-green-900/30 px-2 py-1 rounded">∑</span>
                <span className="text-slate-300">Summation over all terms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const difficultyColors = {
    beginner: 'bg-green-600',
    intermediate: 'bg-yellow-600',
    advanced: 'bg-red-600'
  }

  return (
    <ResizablePanel
      width={panelSize.width}
      height={panelSize.height}
      minWidth={450}
      minHeight={600}
      maxWidth={1000}
      maxHeight={1400}
      onResizeStop={handleResize}
    >
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 space-y-4 h-full overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Book className="text-blue-400" size={20} />
            <h3 className="text-lg font-semibold">Educational Content</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Level:</span>
            <span className={`text-xs px-2 py-1 rounded text-white ${difficultyColors[difficulty] || difficultyColors.beginner}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
        </div>

        {/* Active Concepts */}
        {actualContent.current_concepts && actualContent.current_concepts.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Target size={14} className="text-green-400" />
              Active Concepts
            </h4>
            <div className="flex flex-wrap gap-2">
              {actualContent.current_concepts.map((concept, index) => (
                <span
                  key={index}
                  className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded border border-green-800/30"
                >
                  {concept.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Density Matrix Steps */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <button
            onClick={() => toggleSection('matrices')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Calculator size={16} className="text-purple-400" />
              <span className="font-medium text-slate-200">Density Matrix Evolution</span>
            </div>
            {expandedSection === 'matrices' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSection === 'matrices' && (
            <div className="px-4 pb-4">
              {renderDensityMatrixSteps()}
            </div>
          )}
        </div>

        {/* Terminology and Symbols */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <button
            onClick={() => toggleSection('terminology')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="text-indigo-400" size={16} />
              <span className="font-medium text-slate-200">Terminology & Symbols</span>
            </div>
            {expandedSection === 'terminology' ? (
              <ChevronUp size={16} className="lucide lucide-chevron-up" />
            ) : (
              <ChevronDown size={16} className="lucide lucide-chevron-down" />
            )}
          </button>
          {expandedSection === 'terminology' && (
            <div className="px-4 pb-4">
              {renderTerminologySection()}
            </div>
          )}
        </div>

        {/* Suggested Next Steps */}
        {actualContent.next_steps && actualContent.next_steps.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Target size={14} className="text-amber-400" />
              Suggested Next Steps
            </h4>
            <div className="space-y-2">
              {actualContent.next_steps.slice(0, 3).map((step, index) => (
                <div key={index} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-1 text-xs">→</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ResizablePanel>
  )
}