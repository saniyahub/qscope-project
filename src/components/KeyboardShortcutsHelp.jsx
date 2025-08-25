import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X, Command, Undo, Redo, FolderOpen, Save } from 'lucide-react'

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    {
      category: 'Circuit Actions',
      shortcuts: [
        { keys: ['Ctrl', 'Z'], mac: ['⌘', 'Z'], action: 'Undo', icon: <Undo size={16} /> },
        { keys: ['Ctrl', 'Y'], mac: ['⌘', 'Y'], action: 'Redo', icon: <Redo size={16} /> },
        { keys: ['Ctrl', 'O'], mac: ['⌘', 'O'], action: 'Import Circuit', icon: <FolderOpen size={16} /> },
        { keys: ['Ctrl', 'S'], mac: ['⌘', 'S'], action: 'Export Circuit', icon: <Save size={16} /> }
      ]
    },
    {
      category: 'Navigation',
      shortcuts: [
        { keys: ['?'], action: 'Show/Hide this help', icon: <Keyboard size={16} /> },
        { keys: ['Esc'], action: 'Close overlays', icon: <X size={16} /> }
      ]
    }
  ]

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <>
      {/* Help trigger button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-800/80 backdrop-blur-sm border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Keyboard Shortcuts (Press ?)"
      >
        <Keyboard size={20} />
      </motion.button>

      {/* Help overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Keyboard className="text-indigo-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {shortcuts.map((category, categoryIndex) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.shortcuts.map((shortcut, index) => (
                        <motion.div
                          key={shortcut.action}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                          className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">{shortcut.icon}</span>
                            <span className="text-slate-200 text-sm">{shortcut.action}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {(isMac && shortcut.mac ? shortcut.mac : shortcut.keys).map((key, keyIndex) => (
                              <span key={keyIndex} className="flex items-center gap-1">
                                <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-mono text-slate-300">
                                  {key}
                                </kbd>
                                {keyIndex < (isMac && shortcut.mac ? shortcut.mac : shortcut.keys).length - 1 && (
                                  <span className="text-slate-500 text-xs">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 pt-4 border-t border-slate-700"
              >
                <p className="text-xs text-slate-400 text-center">
                  Press <kbd className="px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs">?</kbd> anytime to show this help
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}