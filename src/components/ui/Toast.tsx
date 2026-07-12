import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const Toast = ({ message, onClose, type = 'success' }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-[86px] left-1/2 -translate-x-1/2 z-[1000] flex flex-row justify-center items-center px-[12px] py-[8px] gap-[8px] w-[353px] h-[40px] rounded-[8px] animate-in fade-in slide-in-from-top-4 ${type === 'success' ? 'bg-[#079455]' : 'bg-[#B41759]'}`}>
      <span className="flex-1 text-[14px] font-semibold text-white font-['SF_Pro']">
        {message}
      </span>
      <button onClick={onClose} className="cursor-pointer">
        <X className="w-[16px] h-[16px] text-white" />
      </button>
    </div>
  );
};