import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6']

export default function BlochSphere2D({ vectors }) {
  const chartData = useMemo(() => {
    if (!vectors || vectors.length === 0) return []
    
    return vectors.map((vector, index) => ({
      name: `Qubit ${vector.id || index}`,
      x: vector.x,
      y: vector.y,
      z: vector.z,
      probability0: (1 - vector.z) / 2,
      probability1: (1 + vector.z) / 2,
      color: COLORS[vector.id % COLORS.length] || COLORS[index % COLORS.length]
    }))
  }, [vectors])

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
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700/50 p-6 overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Quantum State Visualization (2D)</h3>
      
      {/* Individual Qubit Visualizations */}
      <div className="mb-8 overflow-hidden">
        <h4 className="text-md font-medium text-slate-300 mb-3">Individual Qubit States</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.map((data, index) => (
            <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-hidden" style={{ borderColor: data.color }}>
              <h5 className="text-sm font-medium mb-3 truncate" style={{ color: data.color }}>
                {data.name}
              </h5>
              
              {/* Bloch Vector Visualization */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Bloch Vector</span>
                  <span className="font-mono text-slate-300 truncate">
                    ({data.x.toFixed(2)}, {data.y.toFixed(2)}, {data.z.toFixed(2)})
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${Math.sqrt(data.x**2 + data.y**2 + data.z**2) * 100}%`,
                      backgroundColor: data.color
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Measurement Probabilities Visualization */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Measurement</span>
                </div>
                <div className="flex h-6 rounded overflow-hidden">
                  <div 
                    className="flex items-center justify-center text-xs font-medium"
                    style={{ 
                      width: `${data.probability0 * 100}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  >
                    {data.probability0 > 0.1 ? `|0⟩ ${(data.probability0 * 100).toFixed(0)}%` : ''}
                  </div>
                  <div 
                    className="flex items-center justify-center text-xs font-medium"
                    style={{ 
                      width: `${data.probability1 * 100}%`,
                      backgroundColor: '#ef4444'
                    }}
                  >
                    {data.probability1 > 0.1 ? `|1⟩ ${(data.probability1 * 100).toFixed(0)}%` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bloch Vector Components Chart */}
      <div className="mb-8 overflow-hidden">
        <h4 className="text-md font-medium text-slate-300 mb-3">Bloch Vector Components</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-hidden">
            <h5 className="text-sm font-medium text-blue-400 mb-2">X Component</h5>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[-1, 1]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="x" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-hidden">
            <h5 className="text-sm font-medium text-green-400 mb-2">Y Component</h5>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[-1, 1]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="y" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-hidden">
            <h5 className="text-sm font-medium text-purple-400 mb-2">Z Component</h5>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[-1, 1]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="z" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Measurement Probabilities Pie Charts */}
      <div className="mb-8 overflow-hidden">
        <h4 className="text-md font-medium text-slate-300 mb-3">Measurement Probabilities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chartData.map((data, index) => (
            <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-hidden">
              <h5 className="text-sm font-medium text-slate-300 mb-3 truncate" style={{ color: data.color }}>
                {data.name}
              </h5>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: '|0⟩', value: data.probability0, color: '#3b82f6' },
                        { name: '|1⟩', value: data.probability1, color: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: '|0⟩', value: data.probability0, color: '#3b82f6' },
                        { name: '|1⟩', value: data.probability1, color: '#ef4444' }
                      ].map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'Probability']}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-slate-400 truncate">
                P(|0⟩) = {data.probability0.toFixed(4)}, P(|1⟩) = {data.probability1.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary Table */}
      <div className="overflow-hidden">
        <h4 className="text-md font-medium text-slate-300 mb-3">State Summary</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-slate-800/50 rounded-lg border border-slate-700">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left text-xs font-medium text-slate-400 uppercase">Qubit</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-slate-400 uppercase">X</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-slate-400 uppercase">Y</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-slate-400 uppercase">Z</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-slate-400 uppercase">P(|0⟩)</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-slate-400 uppercase">P(|1⟩)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((data, index) => (
                <tr key={index} className="border-t border-slate-700/50">
                  <td className="py-2 px-4 text-sm truncate" style={{ color: data.color }}>
                    {data.name}
                  </td>
                  <td className="py-2 px-4 text-sm" style={{ color: '#3b82f6' }}>
                    {data.x.toFixed(4)}
                  </td>
                  <td className="py-2 px-4 text-sm" style={{ color: '#10b981' }}>
                    {data.y.toFixed(4)}
                  </td>
                  <td className="py-2 px-4 text-sm" style={{ color: '#8b5cf6' }}>
                    {data.z.toFixed(4)}
                  </td>
                  <td className="py-2 px-4 text-sm" style={{ color: '#3b82f6' }}>
                    {data.probability0.toFixed(4)}
                  </td>
                  <td className="py-2 px-4 text-sm" style={{ color: '#ef4444' }}>
                    {data.probability1.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}