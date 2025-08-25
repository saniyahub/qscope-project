/**
 * Backend Client Service for Qscope Frontend
 * Provides seamless integration with the Flask backend API
 */

class BackendClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    this.timeout = 30000; // 30 seconds
    this.retryAttempts = 3;
  }

  /**
   * Generic fetch wrapper with error handling and retries
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Response data
   */
  async _fetch(endpoint, options = {}) {
    // Add /api prefix for API endpoints (health endpoint is at root level)
    const url = `${this.baseURL}/api${endpoint}`;
    const defaultOptions = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...defaultOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.warn(`Attempt ${attempt} failed for ${endpoint}:`, error.message);
        
        if (attempt === this.retryAttempts) {
          throw new Error(`Backend request failed after ${this.retryAttempts} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Check backend health status
   * @returns {Promise<Object>} - Health status
   */
  async checkHealth() {
    try {
      // Health endpoint is at root level, not under /api
      const url = `${this.baseURL}/health?t=${Date.now()}`; // Add cache-busting parameter
      
      console.log('Health check URL:', url); // Debug log
      console.log('baseURL from env:', import.meta.env.VITE_BACKEND_URL); // Debug log
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Health check response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Health check success:', result); // Debug log
      return { success: true, ...result };
    } catch (error) {
      console.error('Health check failed:', error.message); // Debug log
      return { success: false, error: error.message };
    }
  }

  // Quantum Simulation Endpoints

  /**
   * Simulate quantum circuit with basic analysis
   * @param {Object} circuit - Circuit specification
   * @returns {Promise<Object>} - Simulation result
   */
  async simulateCircuit(circuit) {
    return this._fetch('/quantum/simulate', {
      method: 'POST',
      body: JSON.stringify({ circuit })
    });
  }

  /**
   * Simulate quantum circuit with detailed step-by-step analysis
   * @param {Object} circuit - Circuit specification
   * @param {Object} options - Simulation options
   * @returns {Promise<Object>} - Detailed simulation result
   */
  async simulateWithSteps(circuit, options = {}) {
    const payload = {
      circuit,
      options: {
        include_explanations: true,
        detail_level: 'intermediate',
        ...options
      }
    };

    return this._fetch('/quantum/simulate-steps', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Validate circuit structure and constraints
   * @param {Object} circuit - Circuit to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateCircuit(circuit) {
    return this._fetch('/quantum/validate-circuit', {
      method: 'POST',
      body: JSON.stringify({ circuit })
    });
  }

  /**
   * Get supported quantum gates information
   * @returns {Promise<Object>} - Supported gates
   */
  async getSupportedGates() {
    return this._fetch('/quantum/gates', { method: 'GET' });
  }

  // Educational Content Endpoints

  /**
   * Get contextual educational explanations
   * @param {Object} circuitState - Current circuit state
   * @param {string} userLevel - User difficulty level
   * @returns {Promise<Object>} - Educational content
   */
  async getEducationalContent(circuitState, userLevel = 'beginner') {
    return this._fetch('/education/explain-concept', {
      method: 'POST',
      body: JSON.stringify({
        circuit_state: circuitState,
        user_level: userLevel
      })
    });
  }

  /**
   * Get guided tutorial for specified level
   * @param {string} level - Tutorial level (beginner, intermediate, advanced)
   * @returns {Promise<Object>} - Tutorial content
   */
  async getGuidedTutorial(level = 'beginner') {
    return this._fetch(`/education/guided-tutorial/${level}`, {
      method: 'GET'
    });
  }

  /**
   * Generate personalized learning path
   * @param {Object} currentCircuit - Current circuit
   * @param {Array} completedConcepts - Completed learning concepts
   * @param {string} preferredDifficulty - Preferred difficulty level
   * @returns {Promise<Object>} - Learning path
   */
  async generateLearningPath(currentCircuit, completedConcepts = [], preferredDifficulty = 'beginner') {
    return this._fetch('/education/learning-path', {
      method: 'POST',
      body: JSON.stringify({
        current_circuit: currentCircuit,
        completed_concepts: completedConcepts,
        preferred_difficulty: preferredDifficulty
      })
    });
  }

  /**
   * Get interactive questions for learning
   * @param {string} concept - Quantum concept to practice
   * @param {string} difficulty - Question difficulty
   * @param {string} questionType - Type of questions
   * @returns {Promise<Object>} - Interactive questions
   */
  async getInteractiveQuestions(concept, difficulty = 'beginner', questionType = 'multiple_choice') {
    return this._fetch('/education/interactive-questions', {
      method: 'POST',
      body: JSON.stringify({
        concept,
        difficulty,
        question_type: questionType
      })
    });
  }

  /**
   * Get quantum algorithms library
   * @returns {Promise<Object>} - Available algorithms
   */
  async getQuantumAlgorithms() {
    return this._fetch('/education/quantum-algorithms', {
      method: 'GET'
    });
  }

  /**
   * Get specific algorithm tutorial
   * @param {string} algorithmName - Name of the algorithm
   * @returns {Promise<Object>} - Algorithm tutorial
   */
  async getAlgorithmTutorial(algorithmName) {
    return this._fetch(`/education/quantum-algorithms/${algorithmName}`, {
      method: 'GET'
    });
  }

  // Analytics Endpoints

  /**
   * Get comprehensive real-time quantum state analysis
   * @param {Object} circuit - Circuit to analyze
   * @param {string} analysisType - Type of analysis
   * @param {Array} metrics - Specific metrics to calculate
   * @returns {Promise<Object>} - Analysis result
   */
  async getRealTimeAnalysis(circuit, analysisType = 'comprehensive', metrics = ['entanglement', 'purity', 'fidelity']) {
    return this._fetch('/analytics/real-time-analysis', {
      method: 'POST',
      body: JSON.stringify({
        circuit,
        analysis_type: analysisType,
        metrics
      })
    });
  }

  /**
   * Get detailed entanglement analysis
   * @param {Array} stateVector - Quantum state vector
   * @param {number} numQubits - Number of qubits
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Entanglement analysis
   */
  async getEntanglementAnalysis(stateVector, numQubits, options = {}) {
    return this._fetch('/analytics/entanglement-analysis', {
      method: 'POST',
      body: JSON.stringify({
        state_vector: stateVector,
        num_qubits: numQubits,
        analysis_options: {
          include_bipartite: true,
          include_multipartite: false,
          ...options
        }
      })
    });
  }

  /**
   * Calculate quantum coherence metrics
   * @param {Array} stateVector - Quantum state vector
   * @param {string} basis - Measurement basis
   * @param {Array} measures - Coherence measures to calculate
   * @returns {Promise<Object>} - Coherence metrics
   */
  async getCoherenceMetrics(stateVector, basis = 'computational', measures = ['l1_norm', 'relative_entropy']) {
    return this._fetch('/analytics/coherence-metrics', {
      method: 'POST',
      body: JSON.stringify({
        state_vector: stateVector,
        basis,
        coherence_measures: measures
      })
    });
  }

  /**
   * Analyze circuit complexity
   * @param {Object} circuit - Circuit to analyze
   * @param {Array} metrics - Complexity metrics to calculate
   * @returns {Promise<Object>} - Complexity analysis
   */
  async analyzeCircuitComplexity(circuit, metrics = ['depth', 'gate_count']) {
    return this._fetch('/analytics/circuit-complexity', {
      method: 'POST',
      body: JSON.stringify({
        circuit,
        complexity_metrics: metrics
      })
    });
  }

  /**
   * Get optimization suggestions for circuit
   * @param {Object} circuit - Circuit to optimize
   * @param {Array} goals - Optimization goals
   * @returns {Promise<Object>} - Optimization suggestions
   */
  async getOptimizationSuggestions(circuit, goals = ['reduce_depth', 'minimize_gates']) {
    return this._fetch('/analytics/optimization-suggestions', {
      method: 'POST',
      body: JSON.stringify({
        circuit,
        optimization_goals: goals
      })
    });
  }

  /**
   * Export analysis data in specified format
   * @param {Object} data - Data to export
   * @param {string} format - Export format (json, csv, matlab)
   * @param {boolean} includeMetadata - Whether to include metadata
   * @returns {Promise<Object>} - Exported data
   */
  async exportData(data, format = 'json', includeMetadata = true) {
    return this._fetch('/analytics/export-data', {
      method: 'POST',
      body: JSON.stringify({
        data,
        format,
        include_metadata: includeMetadata
      })
    });
  }

  /**
   * Get system performance metrics
   * @returns {Promise<Object>} - Performance metrics
   */
  async getPerformanceMetrics() {
    return this._fetch('/analytics/performance-metrics', {
      method: 'GET'
    });
  }

  // Utility Methods

  /**
   * Check if backend is available
   * @returns {Promise<boolean>} - Backend availability
   */
  async isBackendAvailable() {
    try {
      const health = await this.checkHealth();
      return health.success;
    } catch {
      return false;
    }
  }

  /**
   * Get backend capabilities
   * @returns {Promise<Object>} - Backend capabilities
   */
  async getCapabilities() {
    try {
      const [gates, algorithms, health] = await Promise.all([
        this.getSupportedGates(),
        this.getQuantumAlgorithms(),
        this.checkHealth()
      ]);

      return {
        available: health.success,
        supported_gates: gates.gates || [],
        available_algorithms: algorithms.algorithms || [],
        max_qubits: health.max_qubits || 10,
        features: {
          step_by_step_simulation: true,
          educational_content: true,
          advanced_analytics: true,
          circuit_optimization: true
        }
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        features: {}
      };
    }
  }

  /**
   * Batch request multiple endpoints
   * @param {Array} requests - Array of request configurations
   * @returns {Promise<Array>} - Array of responses
   */
  async batchRequest(requests) {
    const promises = requests.map(async (req) => {
      try {
        const result = await this._fetch(req.endpoint, req.options);
        return { success: true, data: result, id: req.id };
      } catch (error) {
        return { success: false, error: error.message, id: req.id };
      }
    });

    return Promise.all(promises);
  }
}

// Create singleton instance
const backendClient = new BackendClient();

export default backendClient;
export { BackendClient };