import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Copy, Download, AlertCircle, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import backendClient from '../services/backendClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const QChat = ({ autoQuery }) => {
  const { circuit, actions } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [availableModels, setAvailableModels] = useState(['openai/gpt-3.5-turbo']);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await backendClient.getQChatModels();
        if (response.success && response.models && response.models.length > 0) {
          setAvailableModels(response.models);
          // Set the first model as selected by default
          setSelectedModel(response.models[0]);
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
        // Keep default model if fetch fails
      }
    };

    fetchModels();
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m QChat, your quantum computing assistant. I can help you understand quantum concepts and generate quantum circuits from natural language descriptions. What would you like to know?',
      timestamp: new Date().toISOString()
    };
    
    // If there's an auto query, send it automatically
    if (autoQuery) {
      setMessages([welcomeMessage]);
      
      // Automatically submit the auto query after a short delay
      const timer = setTimeout(() => {
        setInputValue(autoQuery);
        
        // Create a synthetic event for form submission
        const fakeEvent = {
          preventDefault: () => {}
        };
        
        // Submit the form
        handleSubmit(fakeEvent);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setMessages([welcomeMessage]);
    }
  }, [autoQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Query the backend with selected model
      const response = await backendClient.queryQChat(inputValue, conversationHistory, selectedModel);
      
      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.result.content,
          circuit: response.result.circuit,
          type: response.result.type,
          timestamp: response.result.timestamp
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('QChat error:', err);
      setError(err.message || 'Failed to get response from QChat');
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        type: 'error',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const handleCopyQASM = (qasm, messageId) => {
    navigator.clipboard.writeText(qasm);
    setCopiedMessageId(messageId);
    
    // Reset the copied status after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const [appliedCircuitId, setAppliedCircuitId] = useState(null);

  const handleUseCircuit = (circuitData, messageId) => {
    // Convert circuit data to format compatible with QScope
    if (circuitData?.json?.gates) {
      const gates = circuitData.json.gates.map((gate, index) => ({
        id: `qchat-${index}`,
        gate: gate.gate,
        qubit: gate.qubits[0] || 0,
        position: index,
        ...(gate.qubits.length > 1 && { targetQubit: gate.qubits[1] })
      }));
      
      actions.setCircuit(gates);
      setAppliedCircuitId(messageId);
      
      // Reset the applied status after 2 seconds
      setTimeout(() => {
        setAppliedCircuitId(null);
      }, 2000);
    }
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setIsModelDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModelDropdownOpen && !event.target.closest('.model-dropdown')) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  const renderMessage = (message) => {
    if (message.role === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="bg-indigo-600 text-white rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <User size={16} />
                <span className="text-xs font-medium">You</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-2 max-w-[80%]">
          <div className="bg-slate-800 text-slate-100 rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <Bot size={16} className="text-indigo-400" />
              <span className="text-xs font-medium text-indigo-400">QChat</span>
            </div>
            <div className="text-sm qchat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
            
            {message.circuit && (
              <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-slate-200">Generated Circuit</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopyQASM(message.circuit.qasm, message.id)}
                      className={`p-1 transition-colors ${copiedMessageId === message.id ? 'text-green-400' : 'text-slate-400 hover:text-white'}`}
                      title={copiedMessageId === message.id ? "Copied!" : "Copy QASM"}
                    >
                      {copiedMessageId === message.id ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <button 
                      onClick={() => handleUseCircuit(message.circuit, message.id)}
                      className={`p-1 transition-colors ${appliedCircuitId === message.id ? 'text-green-400' : 'text-slate-400 hover:text-white'}`}
                      title="Use in Circuit Builder"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Apply button at the top of the circuit code */}
                <div className="mb-2">
                  <button
                    onClick={() => handleUseCircuit(message.circuit, message.id)}
                    className={`w-full ${appliedCircuitId === message.id ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1`}
                  >
                    {appliedCircuitId === message.id ? (
                      <>
                        <span>✓</span> Applied
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Apply to Circuit Builder
                      </>
                    )}
                  </button>
                </div>
                
                <pre className="text-xs bg-slate-950 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto">
                  {message.circuit.qasm}
                </pre>
                
                {/* Copy and Apply buttons at the bottom */}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleCopyQASM(message.circuit.qasm, message.id)}
                    className={`flex-1 ${copiedMessageId === message.id ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'} text-slate-200 py-1 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1`}
                  >
                    {copiedMessageId === message.id ? (
                      <>
                        <span>✓</span> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy QASM
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleUseCircuit(message.circuit, message.id)}
                    className={`flex-1 ${appliedCircuitId === message.id ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1`}
                  >
                    {appliedCircuitId === message.id ? (
                      <>
                        <span>✓</span> Applied
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Apply
                      </>
                    )}
                  </button>
                </div>
                
                {message.circuit.simplified?.gates && (
                  <div className="mt-3 pt-2 border-t border-slate-700">
                    <h5 className="text-xs text-slate-400 mb-1">Gates:</h5>
                    <div className="flex flex-wrap gap-1">
                      {message.circuit.simplified.gates.map((gate, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded"
                        >
                          {gate.name} ({gate.qubits.join(',')})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {message.type === 'error' && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-xs text-red-300">Error processing request</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 backdrop-blur-sm">
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div key={message.id} className="mb-4 last:mb-0">
              {renderMessage(message)}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="bg-slate-800 text-slate-100 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot size={16} className="text-indigo-400" />
                    <span className="text-xs font-medium text-indigo-400">QChat</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="bg-red-900/30 text-red-200 rounded-2xl px-4 py-2 border border-red-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={16} />
                    <span className="text-xs font-medium">Error</span>
                  </div>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-700/50">
          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-0 border-0">
            <div className="flex gap-2 mb-2">
              {/* Model Selection Dropdown */}
              <div className="relative model-dropdown">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <span className="max-w-[120px] truncate">{selectedModel}</span>
                  <ChevronDown size={16} />
                </button>
                
                {isModelDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      {availableModels.map((model) => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => handleModelSelect(model)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            selectedModel === model 
                              ? 'bg-indigo-600 text-white' 
                              : 'text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate">{model}</span>
                            {selectedModel === model && (
                              <span className="text-indigo-300">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about quantum computing or request a circuit..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Example: "Create a Bell state circuit" or "Explain superposition"
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QChat;