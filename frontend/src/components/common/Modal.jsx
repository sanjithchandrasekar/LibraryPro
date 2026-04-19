import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', description }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'overlayFadeIn 0.2s ease-out', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className={`relative bg-card/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.25)] rounded-3xl w-full ${sizeMap[size]} flex flex-col max-h-[90vh] overflow-hidden`}
        style={{ animation: 'modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Header gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between px-7 py-6 border-b border-border/60 shrink-0 mt-1">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all shrink-0 group"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 overflow-y-auto">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes overlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Modal;
