// src/components/common/DatePicker.tsx
import React, { useState, useEffect, useRef } from "react";

// --- SVG Icons ---
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ChevronLeftIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  isInvalid?: boolean;
  alignRight?: boolean; // 💡 팝업을 오른쪽 기준으로 열지 결정하는 옵션 추가
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "날짜 선택", 
  isInvalid = false,
  alignRight = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 pl-3 pr-8 flex items-center justify-between text-[13px] font-bold border rounded-xl cursor-pointer bg-white transition-all ${
          isInvalid ? "border-red-400 bg-red-50 text-red-500" : isOpen ? "border-[#91D148] shadow-[0_0_0_2px_rgba(145,209,72,0.2)]" : "border-gray-200 text-gray-700 hover:border-[#91D148]"
        }`}
      >
        <span>{value || <span className="text-gray-400">{placeholder}</span>}</span>
        <div className={`absolute right-3 ${isInvalid ? "text-red-400" : isOpen ? "text-[#91D148]" : "text-gray-400"}`}>
          <CalendarIcon />
        </div>
      </div>

      {isOpen && (
        <div className={`absolute top-full mt-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 w-[260px] animate-fade-in ${
          alignRight ? "right-0" : "left-0" // 💡 alignRight가 true면 오른쪽 정렬!
        }`}>
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
              return (
                <button
                  key={day}
                  onClick={() => handleSelectDate(day)}
                  className={`h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-colors ${
                    isSelected 
                      ? "bg-[#91D148] text-white shadow-sm" 
                      : "text-gray-700 hover:bg-[#F4F9ED] hover:text-[#4d7222]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;