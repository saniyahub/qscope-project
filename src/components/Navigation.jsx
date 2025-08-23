import  { LogOut, User } from 'lucide-react'

export default function Navigation({ onLogout, currentUser }) {
  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 rounded-xl p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Q
                  </div>
                  <div className="absolute inset-0">
                    <div className="w-8 h-8 border border-indigo-400/30 rounded-full absolute top-2 left-2 animate-spin" style={{animationDuration: '8s'}}></div>
                    <div className="w-6 h-6 border border-purple-400/40 rounded-full absolute top-3 left-3 animate-spin" style={{animationDuration: '6s', animationDirection: 'reverse'}}></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Qscope
              </span>
              <div className="text-xs text-slate-400">See Quantum Circuits Clearly</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <User size={16} />
              <span className="max-w-32 truncate">{currentUser}</span>
            </div>

            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 
 