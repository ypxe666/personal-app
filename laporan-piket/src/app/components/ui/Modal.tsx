'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="glass-card animate-pop-in rounded-2xl w-full max-w-lg p-6 shadow-2xl shadow-sky-500/10 border border-slate-700/60">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-xl font-bold text-sky-400 italic font-bold-title">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors font-bold text-lg p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
        <div className="text-slate-200 italic">{children}</div>
      </div>
    </div>
  );
}