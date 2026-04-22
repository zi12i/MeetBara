import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// --- SVG Icons ---
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "시간 선택", 
  isInvalid = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // 시간 포맷 파싱 (값이 없으면 기본값 09:00)
  const currentHour = value ? value.split(":")[0] : "09";
  const currentMinute = value ? value.split(":")[1] : "00";

  // 스크롤 데이터 생성
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  // 회의용으로 자주 쓰이는 5분 단위 분 생성
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  // 💡 스마트 포지셔닝 & 우측 정렬 계산 로직
  const handleOpenDropdown = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = 240;
      const dropdownHeight = 240;
      const gap = 8;
      
      // 화면 하단의 여유 공간 계산
      const spaceBelow = window.innerHeight - rect.bottom;
      
      let topPos;
      // 💡 아래쪽에 모달을 띄울 충분한 공간(248px)이 있다면 아래로, 없으면 위로 띄움
      if (spaceBelow >= dropdownHeight + gap) {
        topPos = rect.bottom + window.scrollY + gap;
      } else {
        topPos = rect.top + window.scrollY - dropdownHeight - gap;
      }

      setDropdownStyle({
        position: 'absolute',
        top: `${topPos}px`,
        // 💡 우측 정렬: 입력칸의 우측 절대 좌표에서 모달 너비(240)를 빼서 맞춤
        left: `${rect.right + window.scrollX - dropdownWidth}px`,
        width: `${dropdownWidth}px`
      });
      
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const handleHourSelect = (hour: string) => {
    onChange(`${hour}:${currentMinute}`);
  };

  const handleMinuteSelect = (minute: string) => {
    onChange(`${currentHour}:${minute}`);
    // 분(Minute)까지 선택하면 모달 닫기
    setIsOpen(false); 
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      
      {/* 트리거 버튼 */}
      <div 
        onClick={() => setIsOpen(!isOpen) ? null : handleOpenDropdown()}
        className={`w-full h-[54px] px-5 flex items-center justify-between text-[15px] font-bold border rounded-xl cursor-pointer bg-white transition-all shadow-sm ${
          isInvalid ? "border-red-400 bg-red-50 text-red-500" : isOpen ? "border-[#91D148] shadow-[0_0_0_2px_rgba(145,209,72,0.2)]" : "border-gray-200 text-gray-900 hover:border-[#91D148]"
        }`}
      >
        <span>{value || <span className="text-gray-400">{placeholder}</span>}</span>
        <div className={`text-[18px] ${isInvalid ? "text-red-400" : isOpen ? "text-[#91D148]" : "text-gray-400"}`}>
          <ClockIcon />
        </div>
      </div>

      {/* 포탈을 통해 최상단 바디에 열리는 스마트 드롭다운 렌더링 */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl z-[9999] animate-fade-in flex overflow-hidden h-[240px]"
        >
          {/* 시간 (Hours) 칼럼 */}
          <div className="flex-1 border-r border-gray-100 overflow-y-auto custom-scrollbar p-2 relative">
            <div className="text-center text-[11px] font-black text-gray-400 mb-2 sticky top-0 bg-white/90 backdrop-blur-sm py-1.5 z-10">시 (HH)</div>
            <div className="flex flex-col gap-1">
              {hours.map((h) => (
                <button
                  key={`h-${h}`}
                  onClick={(e) => { e.preventDefault(); handleHourSelect(h); }}
                  className={`py-2 rounded-lg text-[14px] font-bold transition-colors ${
                    h === currentHour 
                      ? "bg-[#91D148] text-white shadow-sm" 
                      : "text-gray-600 hover:bg-[#F4F9ED] hover:text-[#4d7222]"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* 분 (Minutes) 칼럼 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 relative">
            <div className="text-center text-[11px] font-black text-gray-400 mb-2 sticky top-0 bg-white/90 backdrop-blur-sm py-1.5 z-10">분 (MM)</div>
            <div className="flex flex-col gap-1">
              {minutes.map((m) => (
                <button
                  key={`m-${m}`}
                  onClick={(e) => { e.preventDefault(); handleMinuteSelect(m); }}
                  className={`py-2 rounded-lg text-[14px] font-bold transition-colors ${
                    m === currentMinute 
                      ? "bg-[#91D148] text-white shadow-sm" 
                      : "text-gray-600 hover:bg-[#F4F9ED] hover:text-[#4d7222]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 커스텀 스크롤바 & 애니메이션 CSS 주입 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2EBD5; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #91D148; }
        
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        .animate-fade-in { animation: fadeIn 0.15s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default TimePicker;