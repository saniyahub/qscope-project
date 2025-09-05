import React from 'react';
import { Bot, X } from 'lucide-react';
import QChat from './QChat';

const QChatSidePanel = ({ isOpen, onClose, autoQuery }) => {
  return (
    <div className={`fixed top-0 left-0 h-full w-[500px] bg-slate-900 border-r border-slate-700 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}>
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Bot className="text-indigo-400" size={20} />
            QChat - Quantum Assistant
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Close QChat panel"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* QChat Component */}
        <div className="flex-1 overflow-hidden">
          <QChat autoQuery={autoQuery} />
        </div>
      </div>
    </div>
  );
};

export default QChatSidePanel;