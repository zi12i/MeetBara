import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router";
import Draggable from "react-draggable";

// 푸터 타입 정의
type FooterType = "progress" | "schedule" | "text";

interface Scenario {
  id: string;
  path: string;
  img: string;
  msg: string;
  color: string;
  footerType: FooterType; // 하단에 표시할 정보 종류
  footerValue: string | number; // 실제 값
}

// 👉 시나리오 데이터 확장
const BARA_SCENARIOS: Scenario[] = [
  { id: "welcome", path: "/", img: "C_2.png", msg: "어서오심시오 환영합니다", color: "bg-[#FF87B4]", footerType: "text", footerValue: "반가워요!" },
  { id: "meeting_normal", path: "/meeting/live", img: "C_3.png", msg: "그대로 계속 진행하심시오", color: "bg-[#91D148]", footerType: "progress", footerValue: 50 },
  { id: "meeting_caution", path: "/meeting/live", img: "C_8.png", msg: "조금 우려가 됨니다", color: "bg-[#FFD154]", footerType: "progress", footerValue: 50 },
  { id: "meeting_warning", path: "/meeting/live", img: "C_1.png", msg: "안건을 벗어났음니다", color: "bg-[#FF6B6B]", footerType: "progress", footerValue: 70 },
  { id: "generating", path: "/meeting/live", img: "C_5.png", msg: "회의록을 작성 중 입니다", color: "linear-gradient(90deg, #FF8A00 0%, #7000FF 100%)", footerType: "progress", footerValue: 100 },
  { id: "meeting_done", path: "/meeting/live", img: "C_4.png", msg: "회의, 고생하셨슴니다", color: "bg-[#B8A3FF]", footerType: "text", footerValue: "회의 종료" },
  { id: "idle_1", path: "/home", img: "C_6.png", msg: "남은 회의 일정이 없슴니다", color: "bg-gray-300", footerType: "text", footerValue: "여유로운 하루네요" },
  { id: "idle_2", path: "/home", img: "C_7.png", msg: "지금 한가하심니까?", color: "bg-gray-300", footerType: "schedule", footerValue: "26. 5. 13 / 14:00" }, // 스케줄 예시
  { id: "feedback", path: "/home", img: "C_9.png", msg: "돈가스가 먹고싶슴니다", color: "bg-gray-200", footerType: "text", footerValue: "점심 메뉴 추천" }
];

const CapybaraZone: React.FC = () => {
  const { pathname } = useLocation();
  const [currentScenario, setCurrentScenario] = useState<Scenario>(BARA_SCENARIOS[0]);
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    if (pathname === "/" || pathname === "/home") {
      setCurrentScenario(BARA_SCENARIOS.find(s => s.id === "idle_2") || BARA_SCENARIOS[0]);
    } 
    else if (pathname.includes("/meeting/") && pathname.includes("/live")) {
      setCurrentScenario(BARA_SCENARIOS.find(s => s.id === "meeting_normal") || BARA_SCENARIOS[1]);
    }
  }, [pathname]);

  // 👉 하단 푸터 렌더링 로직 분리
  const renderFooter = () => {
    const { footerType, footerValue } = currentScenario;

    switch (footerType) {
      case "progress":
        return (
          <span className="text-[13px] font-bold text-gray-400">
            Progress: <span className="text-gray-600">{footerValue}%</span>
          </span>
        );
      case "schedule":
        return (
          <div className="flex flex-col items-center leading-none">
            <span className="text-[10px] font-bold text-gray-400 mb-0.5">다음 회의</span>
            <span className="text-[12px] font-black text-gray-600">{footerValue}</span>
          </div>
        );
      case "text":
      default:
        return (
          <span className="text-[12px] font-bold text-gray-500 italic">{footerValue}</span>
        );
    }
  };

  const isShowBara = pathname === "/" || pathname === "/home" || (pathname.includes("/meeting/") && pathname.includes("/live"));
  if (!isShowBara) return null;

  return (
    <Draggable nodeRef={nodeRef} onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)} bounds="parent">
      <div ref={nodeRef} className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-2 cursor-grab active:cursor-grabbing">
        {!isDragging && (
          <div className="relative bg-white border-2 border-gray-100 shadow-xl rounded-2xl p-4 max-w-[220px] animate-fade-in-up select-none pointer-events-none mb-1 transition-all">
            <p className="text-[14px] text-gray-800 font-black text-center leading-tight">{currentScenario.msg}</p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-100 transform rotate-45"></div>
          </div>
        )}
        
        <div className="w-48 bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          {/* 상단 컬러 바 */}
          <div 
            className={`h-4 w-full ${currentScenario.color.startsWith('bg-') ? currentScenario.color : ''}`} 
            style={{ background: !currentScenario.color.startsWith('bg-') ? currentScenario.color : undefined }}
          />

          {/* 캐릭터 영역 */}
          <div className="flex-1 bg-[#f9f9f9] flex items-center justify-center p-4 min-h-[160px]">
            <img 
              src={`/images/bara/${currentScenario.img}`} 
              alt="바라" 
              className="w-full h-full object-contain select-none transition-transform duration-300" 
              draggable={false} 
            />
          </div>

          {/* 👉 고도화된 하단 정보 영역 */}
          <div className="bg-white border-t border-gray-100 py-2.5 px-2 flex items-center justify-center min-h-[40px]">
            {renderFooter()}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default CapybaraZone;