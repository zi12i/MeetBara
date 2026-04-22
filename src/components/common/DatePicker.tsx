import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// --- SVG Icons ---
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ChevronLeftIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const AlertCircleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  isInvalid?: boolean;
  alignRight?: boolean;
  minDate?: string; // 최소 선택 가능 날짜
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "날짜 선택", 
  isInvalid = false,
  alignRight = false,
  minDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  
  // 💡 포탈(화면 가장 위)로 띄우기 위한 위치 계산 상태
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 달력 열기 및 절대 좌표 계산
  const handleOpenDropdown = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 8}px`,
        ...(alignRight 
          ? { right: `${window.innerWidth - rect.right - window.scrollX}px` }
          : { left: `${rect.left + window.scrollX}px` }
        ),
        width: '260px'
      });
      setIsOpen(true);
    }
  };

  // 외부 클릭 및 화면 스크롤 시 달력 닫기 로직
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
      // 달력 내부를 스크롤할 때는 닫히지 않도록 방어
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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelectDate = (day: number) => {
    const selected = new Date(year, month, day);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, "0");
    const dd = String(selected.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  return (
    <div className="relative w-[140px]" ref={containerRef}>
      {/* 트리거 버튼 */}
      <div 
        onClick={() => setIsOpen(!isOpen) ? null : handleOpenDropdown()}
        className={`w-full h-11 pl-3 pr-8 flex items-center justify-between text-[13px] font-bold border rounded-xl cursor-pointer bg-white transition-all ${
          isInvalid ? "border-red-400 bg-red-50 text-red-500" : isOpen ? "border-[#91D148] shadow-[0_0_0_2px_rgba(145,209,72,0.2)]" : "border-gray-200 text-gray-700 hover:border-[#91D148]"
        }`}
      >
        <span>{value || <span className="text-gray-400">{placeholder}</span>}</span>
        <div className={`absolute right-3 ${isInvalid ? "text-red-400" : isOpen ? "text-[#91D148]" : "text-gray-400"}`}>
          <CalendarIcon />
        </div>
      </div>

      {/* 💡 화면 짤림 방지: createPortal을 사용하여 달력을 최상단 바디에 렌더링 */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xl z-[9999] animate-fade-in"
        >
          <div className="flex justify-between items-center mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
              <ChevronLeftIcon />
            </button>
            <div className="text-[14px] font-black text-gray-800">
              {year}년 {month + 1}월
            </div>
            <button onClick={nextMonth} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
              <ChevronRightIcon />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((wd, i) => (
              <div key={wd} className={`text-center text-[11px] font-bold ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
                {wd}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((b) => <div key={`blank-${b}`} className="h-8"></div>)}
            {days.map((day) => {
              const currentDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = value === currentDateStr;
              
              // 💡 전달받은 minDate 기준으로 과거 날짜인지 판별
              const isPastDate = minDate ? currentDateStr < minDate : false;

              return (
                <button
                  key={day}
                  onClick={(e) => {
                    // 과거 날짜 클릭 시 모달 띄우기
                    if (isPastDate) {
                      e.preventDefault();
                      setErrorModalOpen(true);
                      setIsOpen(false); // 달력은 닫음
                      return;
                    }
                    handleSelectDate(day);
                  }}
                  className={`h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-colors ${
                    isPastDate 
                      ? "text-gray-400 cursor-not-allowed bg-transparent" // 과거 날짜 스타일 (플레이스홀더 색상)
                      : isSelected 
                      ? "bg-[#91D148] text-white shadow-sm" 
                      : "text-gray-700 hover:bg-[#F4F9ED] hover:text-[#4d7222]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {/* 💡 과거 날짜 클릭 시 경고 커스텀 모달 */}
      {errorModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[320px] text-center animate-zoom-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
              <AlertCircleIcon />
            </div>
            <h3 className="text-[18px] font-black text-gray-900 mb-2">선택 불가</h3>
            <p className="text-[14px] text-gray-500 font-medium mb-6 leading-relaxed">
              오늘 이전의 과거 날짜는<br/>선택하실 수 없습니다.
            </p>
            <button 
              onClick={() => setErrorModalOpen(false)} 
              className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              확인
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DatePicker;