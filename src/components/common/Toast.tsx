// src/components/common/Toast.tsx
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  subMessage?: string; // 진행률 등 서브 메시지
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // 기본 3초
}

const Toast: React.FC<ToastProps> = ({ message, subMessage, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    // ★ fixed top-8: 화면 최상단에서 약간 띄움, animate-fade-in-down: 위에서 아래로 스르륵
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-fade-in-down">
      
      {/* ★ 깔끔하고 적당한 크기의 화이트 둥근 박스 (Shadow로 입체감 부여) */}
      <div className="bg-white border border-gray-100 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] px-8 py-5 flex flex-col items-center min-w-[320px] transition-all">
        
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[18px] font-black text-gray-900 tracking-tight">
            {message}
          </span>
        </div>

        {subMessage && (
          <div className="bg-[#F4F9ED] px-4 py-1.5 rounded-lg border border-[#91D148]/20 mt-1">
            <span className="text-[15px] font-extrabold text-[#91D148]">
              {subMessage}
            </span>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Toast;