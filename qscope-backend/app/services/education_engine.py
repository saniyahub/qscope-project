"""
Education Engine Service for Qscope Backend
Provides educational content, tutorials, and learning pathways
"""

from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class EducationEngine:
    """
    Manages educational content and learning experiences
    """
    
    def __init__(self):
        """Initialize the education engine"""
        self.difficulty_levels = ['beginner', 'intermediate', 'advanced']
        self.quantum_concepts = self._load_quantum_concepts()
        self.algorithms_library = self._load_algorithms_library()
    
    def get_contextual_explanation(self, circuit_state: Dict, user_level: str) -> Dict:
        """Provide level-appropriate explanations based on circuit state"""
        try:
            current_concepts = self._identify_concepts_in_circuit(circuit_state)
            
            # Generate density matrix steps if we have simulation data
            density_matrix_steps = self._generate_density_matrix_steps(circuit_state)
            
            explanation = {
                'current_concepts': current_concepts,
                'level': user_level,
                'density_matrix_steps': density_matrix_steps,
                'next_steps': self._suggest_next_steps(current_concepts, user_level)
            }
            
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating contextual explanation: {str(e)}")
            return self._fallback_explanation(user_level)
    
    def get_guided_tutorial(self, level: str) -> Dict:
        """Get progressive tutorial content for different learning levels"""
        tutorials = {
            'beginner': self._get_beginner_tutorial(),
            'intermediate': self._get_intermediate_tutorial(),
            'advanced': self._get_advanced_tutorial()
        }
        
        return tutorials.get(level, tutorials['beginner'])
    
    def generate_learning_path(self, current_circuit: Dict, completed_concepts: List[str], 
                             preferred_difficulty: str) -> List[Dict]:
        """Generate personalized learning path"""
        try:
            # Analyze current circuit to understand user's level
            current_concepts = self._identify_concepts_in_circuit(current_circuit)
            
            # Determine next concepts to learn
            all_concepts = list(self.quantum_concepts.keys())
            remaining_concepts = [c for c in all_concepts if c not in completed_concepts]
            
            # Create learning path
            learning_path = []
            for concept in remaining_concepts[:5]:  # Limit to next 5 concepts
                learning_path.append({
                    'concept': concept,
                    'difficulty': preferred_difficulty,
                    'description': self.quantum_concepts[concept]['description'],
                    'prerequisites': self.quantum_concepts[concept].get('prerequisites', []),
                    'example_circuits': self._get_example_circuits_for_concept(concept),
                    'exercises': self._generate_exercises_for_concept(concept, preferred_difficulty),
                    'estimated_time': self.quantum_concepts[concept].get('time_estimate', '15-30 minutes')
                })
            
            return learning_path
            
        except Exception as e:
            logger.error(f"Error generating learning path: {str(e)}")
            return []
    
    def generate_interactive_questions(self, concept: str, difficulty: str, question_type: str) -> List[Dict]:
        """Generate interactive questions for a concept"""
        try:
            questions = []
            
            if concept in self.quantum_concepts:
                concept_data = self.quantum_concepts[concept]
                
                if question_type == 'multiple_choice':
                    questions.extend(self._generate_multiple_choice_questions(concept_data, difficulty))
                elif question_type == 'true_false':
                    questions.extend(self._generate_true_false_questions(concept_data, difficulty))
                elif question_type == 'fill_blank':
                    questions.extend(self._generate_fill_blank_questions(concept_data, difficulty))
            
            return questions[:3]  # Limit to 3 questions
            
        except Exception as e:
            logger.error(f"Error generating questions: {str(e)}")
            return []
    
    def get_quantum_algorithms_library(self) -> Dict:
        """Get library of quantum algorithms with educational content"""
        return {
            'algorithms': list(self.algorithms_library.keys()),
            'categories': self._categorize_algorithms(),
            'difficulty_levels': self._get_algorithm_difficulties(),
            'total_count': len(self.algorithms_library)
        }
    
    def get_algorithm_tutorial(self, algorithm_name: str) -> Optional[Dict]:
        """Get detailed tutorial for a specific quantum algorithm"""
        if algorithm_name not in self.algorithms_library:
            return None
        
        algorithm = self.algorithms_library[algorithm_name]
        
        return {
            'name': algorithm['name'],
            'description': algorithm['description'],
            'difficulty': algorithm['difficulty'],
            'circuit': algorithm['circuit'],
            'step_by_step': algorithm['steps'],
            'theory': algorithm['theory'],
            'applications': algorithm.get('applications', []),
            'prerequisites': algorithm.get('prerequisites', []),
            'interactive_demo': algorithm.get('demo', {}),
            'further_reading': algorithm.get('resources', [])
        }
    
    def get_basic_explanation(self) -> str:
        """Get basic explanation for health check"""
        return "Education engine provides personalized quantum computing learning experiences"
    
    # Private helper methods
    
    def _load_quantum_concepts(self) -> Dict:
        """Load comprehensive quantum concepts database"""
        return {
            'superposition': {
                'description': 'Quantum states existing in multiple possibilities simultaneously',
                'prerequisites': [],
                'gates': ['H'],
                'time_estimate': '20 minutes',
                'key_insights': [
                    'Superposition is not classical mixing but quantum coherence',
                    'Measurement collapses superposition to definite outcomes',
                    'Superposition enables quantum parallelism'
                ],
                'misconceptions': [
                    'Qubit is not both 0 and 1 simultaneously in classical sense',
                    'Superposition is not just probability distribution'
                ],
                'visual_analogies': {
                    'beginner': 'Like a spinning coin in the air - could land either way',
                    'intermediate': 'Wave interference pattern with multiple possibilities',
                    'advanced': 'Vector in complex Hilbert space with definite direction'
                }
            },
            'entanglement': {
                'description': 'Quantum correlation between multiple qubits',
                'prerequisites': ['superposition'],
                'gates': ['H', 'CNOT'],
                'time_estimate': '30 minutes',
                'key_insights': [
                    'Entangled qubits share quantum correlations',
                    'Measurement of one qubit affects the other instantly',
                    'Cannot be described by individual qubit properties'
                ],
                'misconceptions': [
                    'Entanglement does not allow faster-than-light communication',
                    'Hidden variables cannot explain quantum correlations'
                ],
                'visual_analogies': {
                    'beginner': 'Pair of magical coins that always land oppositely',
                    'intermediate': 'Synchronized dancers responding to each other',
                    'advanced': 'Non-separable quantum state in composite Hilbert space'
                }
            },
            'interference': {
                'description': 'Quantum amplitudes combining constructively or destructively',
                'prerequisites': ['superposition'],
                'gates': ['H', 'Z'],
                'time_estimate': '25 minutes',
                'key_insights': [
                    'Amplitudes can cancel each other out (destructive interference)',
                    'Phase relationships determine interference patterns',
                    'Basis of quantum algorithm speedups'
                ],
                'misconceptions': [
                    'Interference is not just probability addition',
                    'Phase matters even when not directly measurable'
                ],
                'visual_analogies': {
                    'beginner': 'Sound waves that can cancel each other out',
                    'intermediate': 'Water ripples creating complex patterns',
                    'advanced': 'Complex amplitude vector addition in phase space'
                }
            },
            'measurement': {
                'description': 'Observing quantum states and collapse to classical outcomes',
                'prerequisites': ['superposition'],
                'gates': ['all'],
                'time_estimate': '15 minutes',
                'key_insights': [
                    'Measurement fundamentally changes the quantum system',
                    'Only probabilities can be predicted, not specific outcomes',
                    'Choice of measurement basis affects results'
                ],
                'misconceptions': [
                    'Measurement does not just reveal pre-existing properties',
                    'Observer effect is not about consciousness'
                ],
                'visual_analogies': {
                    'beginner': 'Opening a box to see if the cat is alive or dead',
                    'intermediate': 'Flashlight revealing position but disturbing motion',
                    'advanced': 'Projection operator onto measurement eigenstates'
                }
            },
            'phase': {
                'description': 'Complex phase relationships in quantum amplitudes',
                'prerequisites': ['superposition'],
                'gates': ['Z', 'Y', 'S', 'T'],
                'time_estimate': '25 minutes',
                'key_insights': [
                    'Global phase is unobservable but relative phases matter',
                    'Phase gates enable quantum interference effects',
                    'Phase kickback is crucial for quantum algorithms'
                ],
                'misconceptions': [
                    'Phase changes are not directly observable in isolation',
                    'Complex numbers are not just mathematical convenience'
                ],
                'visual_analogies': {
                    'beginner': 'Hidden color that affects how quantum coins interact',
                    'intermediate': 'Clock hands pointing in different directions',
                    'advanced': 'Unit circle rotations in complex plane'
                }
            },
            'no_cloning': {
                'description': 'Fundamental impossibility of copying unknown quantum states',
                'prerequisites': ['superposition', 'measurement'],
                'gates': [],
                'time_estimate': '20 minutes',
                'key_insights': [
                    'Unknown quantum states cannot be perfectly cloned',
                    'Measurement destroys original superposition',
                    'Foundation of quantum cryptography security'
                ],
                'misconceptions': [
                    'Classical copying strategies fail for quantum states',
                    'Approximate cloning is possible but imperfect'
                ],
                'visual_analogies': {
                    'beginner': 'Trying to photocopy a spinning coin',
                    'intermediate': 'Impossible to make perfect copies of waves',
                    'advanced': 'Linearity of quantum mechanics prevents cloning'
                }
            }
        }
    
    def _load_algorithms_library(self) -> Dict:
        """Load quantum algorithms library"""
        return {
            'deutsch_jozsa': {
                'name': 'Deutsch-Jozsa Algorithm',
                'description': 'Determines if a function is constant or balanced',
                'difficulty': 'intermediate',
                'circuit': {
                    'gates': [
                        {'gate': 'H', 'qubit': 0, 'position': 0},
                        {'gate': 'H', 'qubit': 1, 'position': 0},
                        {'gate': 'X', 'qubit': 1, 'position': 1},  # Oracle (constant function)
                        {'gate': 'H', 'qubit': 0, 'position': 2}
                    ]
                },
                'steps': [
                    'Initialize qubits in superposition with Hadamard gates',
                    'Apply oracle function',
                    'Apply final Hadamard to query qubit',
                    'Measure to determine function type'
                ],
                'theory': 'Demonstrates quantum parallelism and interference',
                'applications': ['Function analysis', 'Quantum speedup demonstration']
            },
            'bell_states': {
                'name': 'Bell State Preparation',
                'description': 'Creates maximally entangled two-qubit states',
                'difficulty': 'beginner',
                'circuit': {
                    'gates': [
                        {'gate': 'H', 'qubit': 0, 'position': 0},
                        {'gate': 'CNOT', 'qubit': 1, 'position': 1, 'control': 0}
                    ]
                },
                'steps': [
                    'Apply Hadamard to create superposition',
                    'Apply CNOT to create entanglement',
                    'Measure to verify Bell state properties'
                ],
                'theory': 'Foundation of quantum entanglement and non-locality',
                'applications': ['Quantum communication', 'Quantum teleportation']
            }
        }
    
    def _identify_concepts_in_circuit(self, circuit_state: Dict) -> List[str]:
        """Identify quantum concepts present in the circuit"""
        gates = circuit_state.get('gates', [])
        gate_types = [gate.get('gate', '') for gate in gates]
        
        concepts = []
        
        # Check for superposition
        if 'H' in gate_types:
            concepts.append('superposition')
        
        # Check for phase operations
        if any(gate in gate_types for gate in ['Z', 'Y', 'S', 'T']):
            concepts.append('phase')
        
        # Check for entanglement (simplified check)
        if len(set(gate.get('qubit', 0) for gate in gates)) > 1:
            concepts.append('multi_qubit_operations')
        
        # Always include measurement as a concept
        concepts.append('measurement')
        
        return concepts
    
    def _generate_key_insights(self, concepts: List[str], user_level: str) -> List[str]:
        """Generate key insights for current concepts"""
        insights = []
        
        for concept in concepts:
            if concept in self.quantum_concepts:
                concept_data = self.quantum_concepts[concept]
                concept_insights = concept_data.get('key_insights', [])
                
                # Filter insights by difficulty level
                if user_level == 'beginner':
                    # Take first 1-2 insights for beginners
                    insights.extend(concept_insights[:2])
                elif user_level == 'intermediate':
                    # Take most insights for intermediate
                    insights.extend(concept_insights)
                else:  # advanced
                    # All insights plus deeper connections
                    insights.extend(concept_insights)
                    if concept == 'entanglement':
                        insights.append("Entanglement is the foundation of quantum advantage in many algorithms")
                    elif concept == 'superposition':
                        insights.append("Superposition enables exponential scaling of quantum information")
        
        return insights
    
    def _generate_step_guide(self, circuit_state: Dict, user_level: str) -> List[str]:
        """Generate step-by-step guide for the circuit"""
        gates = circuit_state.get('gates', [])
        
        if not gates:
            return ["Start by adding gates to your quantum circuit"]
        
        guide = ["Your quantum circuit performs the following steps:"]
        
        for i, gate in enumerate(sorted(gates, key=lambda g: g.get('position', 0))):
            gate_type = gate.get('gate', 'unknown')
            qubit = gate.get('qubit', 0)
            
            if gate_type == 'H':
                guide.append(f"Step {i+1}: Apply Hadamard gate to qubit {qubit} - creates superposition")
            elif gate_type == 'X':
                guide.append(f"Step {i+1}: Apply X gate to qubit {qubit} - flips the qubit state")
            elif gate_type == 'Y':
                guide.append(f"Step {i+1}: Apply Y gate to qubit {qubit} - bit flip with phase change")
            elif gate_type == 'Z':
                guide.append(f"Step {i+1}: Apply Z gate to qubit {qubit} - adds phase to |1⟩ state")
            else:
                guide.append(f"Step {i+1}: Apply {gate_type} gate to qubit {qubit}")
        
        guide.append("Observe how each gate changes the quantum state visualization")
        
        return guide
    
    def _get_misconceptions_for_concepts(self, concepts: List[str]) -> List[str]:
        """Get common misconceptions for concepts"""
        misconceptions = []
        
        if 'superposition' in concepts:
            misconceptions.append("Superposition doesn't mean the qubit is 'both 0 and 1' classically")
        
        if 'phase' in concepts:
            misconceptions.append("Phase changes are not directly observable but affect interference")
        
        if 'measurement' in concepts:
            misconceptions.append("Measurement is not just 'looking' - it fundamentally changes the system")
        
        return misconceptions
    
    def _generate_questions_for_concepts(self, concepts: List[str], user_level: str) -> List[Dict]:
        """Generate questions for concepts"""
        questions = []
        
        if 'superposition' in concepts:
            questions.append({
                'question': 'What happens when you apply a Hadamard gate to |0⟩?',
                'type': 'multiple_choice',
                'options': [
                    'It becomes |1⟩',
                    'It becomes (|0⟩ + |1⟩)/√2',
                    'It becomes |0⟩',
                    'It gets measured'
                ],
                'correct': 1,
                'explanation': 'Hadamard creates equal superposition of |0⟩ and |1⟩'
            })
        
        return questions
    
    def _suggest_next_steps(self, concepts: List[str], user_level: str) -> List[str]:
        """Suggest next learning steps based on current concepts and level"""
        suggestions = []
        
        # Get all concept prerequisites to suggest natural progressions
        all_concepts = set(self.quantum_concepts.keys())
        covered_concepts = set(concepts)
        
        # Find concepts that have prerequisites satisfied
        next_concepts = []
        for concept_name, concept_data in self.quantum_concepts.items():
            if concept_name not in covered_concepts:
                prereqs = set(concept_data.get('prerequisites', []))
                if prereqs.issubset(covered_concepts):
                    next_concepts.append(concept_name)
        
        # Generate level-appropriate suggestions
        if user_level == 'beginner':
            if 'superposition' not in covered_concepts:
                suggestions.append("Start with Hadamard gates to understand superposition")
            elif 'interference' in next_concepts:
                suggestions.append("Try combining H and Z gates to see quantum interference")
            elif 'entanglement' in next_concepts:
                suggestions.append("Add a second qubit to explore entanglement")
        
        elif user_level == 'intermediate':
            if 'phase' in next_concepts:
                suggestions.append("Explore phase gates (Z, Y) to understand complex amplitudes")
            if 'measurement' in next_concepts:
                suggestions.append("Learn about measurement and its effects on quantum states")
            if len(covered_concepts) >= 3:
                suggestions.append("Try building multi-step quantum algorithms")
        
        elif user_level == 'advanced':
            if 'no_cloning' in next_concepts:
                suggestions.append("Study the no-cloning theorem and its implications")
            suggestions.append("Explore quantum error correction principles")
            suggestions.append("Investigate quantum complexity theory")
        
        # Add circuit-specific suggestions
        if 'superposition' in covered_concepts:
            suggestions.append("Measure the superposition to see probabilistic outcomes")
        
        if 'entanglement' in covered_concepts:
            suggestions.append("Try different Bell states and their properties")
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    def _get_beginner_tutorial(self) -> Dict:
        """Get beginner tutorial content"""
        return {
            'title': 'Introduction to Quantum Computing',
            'sections': [
                {
                    'title': 'What is a Qubit?',
                    'content': 'A qubit is the basic unit of quantum information...',
                    'duration': '10 minutes'
                },
                {
                    'title': 'Your First Quantum Gate',
                    'content': 'Let\'s start with the Hadamard gate...',
                    'duration': '15 minutes'
                }
            ],
            'total_duration': '45 minutes',
            'prerequisites': 'None'
        }
    
    def _get_intermediate_tutorial(self) -> Dict:
        """Get intermediate tutorial content"""
        return {
            'title': 'Quantum Gates and Circuits',
            'sections': [
                {
                    'title': 'Understanding Quantum Interference',
                    'content': 'Quantum interference occurs when...',
                    'duration': '20 minutes'
                },
                {
                    'title': 'Multi-Qubit Operations',
                    'content': 'Working with multiple qubits introduces...',
                    'duration': '25 minutes'
                }
            ],
            'total_duration': '60 minutes',
            'prerequisites': 'Basic understanding of qubits and single gates'
        }
    
    def _get_advanced_tutorial(self) -> Dict:
        """Get advanced tutorial content"""
        return {
            'title': 'Quantum Algorithms and Applications',
            'sections': [
                {
                    'title': 'Quantum Fourier Transform',
                    'content': 'The QFT is fundamental to many quantum algorithms...',
                    'duration': '30 minutes'
                },
                {
                    'title': 'Error Correction Principles',
                    'content': 'Quantum error correction protects quantum information...',
                    'duration': '40 minutes'
                }
            ],
            'total_duration': '90 minutes',
            'prerequisites': 'Understanding of quantum gates, circuits, and basic algorithms'
        }
    
    def _fallback_explanation(self, user_level: str) -> Dict:
        """Fallback explanation for errors"""
        return {
            'current_concepts': ['basic_quantum'],
            'level': user_level,
            'key_insights': ['Quantum computing uses quantum mechanical phenomena for computation'],
            'step_by_step_guide': ['Build quantum circuits using quantum gates', 'Observe quantum state evolution'],
            'error': 'Unable to generate detailed explanation'
        }
    
    def _get_example_circuits_for_concept(self, concept: str) -> List[Dict]:
        """Get example circuits demonstrating a concept"""
        examples = {
            'superposition': [
                {
                    'name': 'Basic Superposition',
                    'circuit': {'gates': [{'gate': 'H', 'qubit': 0, 'position': 0}]},
                    'description': 'Single Hadamard gate creates superposition'
                }
            ],
            'entanglement': [
                {
                    'name': 'Bell State',
                    'circuit': {'gates': [
                        {'gate': 'H', 'qubit': 0, 'position': 0},
                        {'gate': 'CNOT', 'qubit': 1, 'position': 1, 'control': 0}
                    ]},
                    'description': 'Creates maximally entangled Bell state'
                }
            ],
            'interference': [
                {
                    'name': 'Interference Demo',
                    'circuit': {'gates': [
                        {'gate': 'H', 'qubit': 0, 'position': 0},
                        {'gate': 'Z', 'qubit': 0, 'position': 1},
                        {'gate': 'H', 'qubit': 0, 'position': 2}
                    ]},
                    'description': 'Demonstrates quantum interference'
                }
            ]
        }
        return examples.get(concept, [])
    
    def _generate_exercises_for_concept(self, concept: str, difficulty: str) -> List[Dict]:
        """Generate practice exercises for a concept"""
        exercises = {
            'superposition': [
                {
                    'type': 'build_circuit',
                    'instruction': 'Create a circuit that puts qubit 0 in superposition',
                    'expected_gates': ['H'],
                    'difficulty': difficulty
                }
            ],
            'entanglement': [
                {
                    'type': 'build_circuit',
                    'instruction': 'Create a Bell state using qubits 0 and 1',
                    'expected_gates': ['H', 'CNOT'],
                    'difficulty': difficulty
                }
            ]
        }
        return exercises.get(concept, [])
    
    def generate_analysis_insights(self, analysis_result: Dict) -> Dict:
        """Generate educational insights from analysis results"""
        try:
            insights = {
                'purity_insights': [],
                'entanglement_insights': [],
                'coherence_insights': [],
                'optimization_tips': []
            }
            
            metrics = analysis_result.get('metrics', {})
            basic_metrics = metrics.get('basic_metrics', {})
            entanglement_metrics = metrics.get('entanglement_metrics', {})
            
            # Purity insights
            purity = basic_metrics.get('purity', 1.0)
            if purity > 0.9:
                insights['purity_insights'].append("Your state is very pure - close to a classical state")
            elif purity < 0.5:
                insights['purity_insights'].append("Your state shows significant quantum mixing")
            else:
                insights['purity_insights'].append("Your state has moderate quantum mixing")
            
            # Entanglement insights
            total_entanglement = entanglement_metrics.get('total_entanglement', 0)
            if total_entanglement > 0.5:
                insights['entanglement_insights'].append("Strong entanglement detected between qubits")
            elif total_entanglement > 0.1:
                insights['entanglement_insights'].append("Moderate entanglement present")
            else:
                insights['entanglement_insights'].append("Little to no entanglement detected")
            
            # Optimization tips
            von_neumann_entropy = basic_metrics.get('von_neumann_entropy', 0)
            if von_neumann_entropy < 0.1:
                insights['optimization_tips'].append("Consider adding superposition for more quantum behavior")
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating analysis insights: {str(e)}")
            return {
                'purity_insights': ['Analysis insights unavailable'],
                'entanglement_insights': ['Entanglement analysis unavailable'],
                'coherence_insights': ['Coherence analysis unavailable'],
                'optimization_tips': ['Optimization suggestions unavailable']
            }
    
    def get_optimization_suggestions(self, circuit_data: Dict) -> List[str]:
        """Get optimization suggestions for quantum circuits"""
        try:
            suggestions = []
            gates = circuit_data.get('gates', [])
            
            if not gates:
                return ['Add quantum gates to start building your circuit']
            
            # Check for gate optimization opportunities
            gate_types = [gate.get('gate', '') for gate in gates]
            
            # Check for consecutive H gates
            consecutive_h = 0
            for i in range(len(gate_types) - 1):
                if gate_types[i] == 'H' and gate_types[i+1] == 'H':
                    consecutive_h += 1
            
            if consecutive_h > 0:
                suggestions.append(f"Remove {consecutive_h} pairs of consecutive H gates (H² = I)")
            
            # Check for identity gates
            identity_count = gate_types.count('I')
            if identity_count > 0:
                suggestions.append(f"Remove {identity_count} identity gates - they don't change the state")
            
            # Suggest circuit improvements
            if len(set(gate.get('qubit', 0) for gate in gates)) == 1:
                suggestions.append("Try adding gates to multiple qubits to explore entanglement")
            
            if 'H' not in gate_types:
                suggestions.append("Add Hadamard gates to create quantum superposition")
            
            # Circuit depth suggestions
            positions = [gate.get('position', 0) for gate in gates]
            max_position = max(positions) if positions else 0
            if max_position > 10:
                suggestions.append("Consider simplifying the circuit to reduce noise in real quantum devices")
            
            return suggestions[:5] if suggestions else ['Your circuit looks well optimized!']
            
        except Exception as e:
            logger.error(f"Error generating optimization suggestions: {str(e)}")
            return ['Unable to generate optimization suggestions']
    
    def _categorize_algorithms(self) -> Dict[str, List[str]]:
        """Categorize quantum algorithms by type"""
        return {
            'basic': ['bell_states'],
            'search': ['grover_search'],
            'oracle': ['deutsch_jozsa'],
            'communication': ['quantum_teleportation']
        }
    
    def _get_algorithm_difficulties(self) -> Dict[str, str]:
        """Get difficulty levels for algorithms"""
        return {
            algo: data['difficulty'] 
            for algo, data in self.algorithms_library.items()
        }
    
    def _generate_multiple_choice_questions(self, concept_data: Dict, difficulty: str) -> List[Dict]:
        """Generate multiple choice questions"""
        questions = []
        
        if difficulty == 'beginner':
            questions.append({
                'question': f"What does the {concept_data.get('gates', ['H'])[0]} gate do?",
                'options': [
                    'Measures the qubit',
                    concept_data.get('description', 'Unknown operation'),
                    'Destroys the quantum state',
                    'Does nothing'
                ],
                'correct': 1,
                'explanation': concept_data.get('description', 'This gate performs a specific quantum operation')
            })
        
        return questions
    
    def _generate_true_false_questions(self, concept_data: Dict, difficulty: str) -> List[Dict]:
        """Generate true/false questions"""
        return [
            {
                'question': f"{concept_data.get('description', 'This concept')} is fundamental to quantum computing.",
                'answer': True,
                'explanation': 'This is a core concept in quantum mechanics and computing.'
            }
        ]
    
    def _generate_fill_blank_questions(self, concept_data: Dict, difficulty: str) -> List[Dict]:
        """Generate fill-in-the-blank questions"""
        return [
            {
                'question': f"The {concept_data.get('gates', ['H'])[0]} gate is used to create ____.",
                'answer': concept_data.get('description', 'quantum effects').split()[0],
                'explanation': f"This gate creates {concept_data.get('description', 'quantum effects')}."
            }
        ]
    
    def _generate_density_matrix_steps(self, circuit_state: Dict) -> List[Dict]:
        """Generate density matrix evolution steps for the circuit"""
        try:
            # Import here to avoid circular imports
            from app.services.quantum_simulator import AdvancedQuantumSimulator
            
            simulator = AdvancedQuantumSimulator()
            simulation_result = simulator.simulate_with_steps(circuit_state)
            
            density_steps = []
            
            if 'steps' in simulation_result:
                for i, step in enumerate(simulation_result['steps']):
                    # Convert state vector to density matrix
                    density_matrix = self._statevector_to_density_matrix(step.get('state_vector', []))
                    
                    # Get gate matrix if available
                    gate_matrix = step.get('gate_matrix')
                    
                    density_step = {
                        'operation': step.get('operation', f'Step {i}'),
                        'description': step.get('explanation', ''),
                        'initial_state': density_matrix if i == 0 else None,
                        'final_state': density_matrix,
                        'gate_matrix': gate_matrix,
                        'transformation': self._generate_matrix_transformation_text(step.get('operation', 'I'))
                    }
                    
                    density_steps.append(density_step)
            
            return density_steps
            
        except Exception as e:
            logger.error(f"Error generating density matrix steps: {str(e)}")
            return []
    
    def _statevector_to_density_matrix(self, state_vector_data: List[Dict]) -> List[List[Dict]]:
        """Convert state vector representation to density matrix"""
        try:
            if not state_vector_data:
                return [[{'real': 1.0, 'imag': 0.0}]]
            
            n = len(state_vector_data)
            density_matrix = []
            
            for i in range(n):
                row = []
                for j in range(n):
                    # ρ_ij = ψ_i * ψ_j*
                    amp_i = state_vector_data[i]['amplitude']
                    amp_j = state_vector_data[j]['amplitude']
                    
                    # Complex conjugate multiplication
                    real_part = amp_i['real'] * amp_j['real'] + amp_i['imag'] * amp_j['imag']
                    imag_part = amp_i['imag'] * amp_j['real'] - amp_i['real'] * amp_j['imag']
                    
                    row.append({
                        'real': round(real_part, 4),
                        'imag': round(imag_part, 4)
                    })
                
                density_matrix.append(row)
            
            return density_matrix
            
        except Exception as e:
            logger.error(f"Error converting to density matrix: {str(e)}")
            return [[{'real': 1.0, 'imag': 0.0}]]
    
    def _generate_matrix_transformation_text(self, gate_type: str) -> str:
        """Generate the mathematical transformation formula"""
        transformations = {
            'initialization': 'ρ = |0⟩⟨0|',
            'H': "ρ' = H ρ H†",
            'X': "ρ' = X ρ X†", 
            'Y': "ρ' = Y ρ Y†",
            'Z': "ρ' = Z ρ Z†",
            'I': "ρ' = I ρ I† = ρ"
        }
        
        return transformations.get(gate_type, "ρ' = U ρ U†")