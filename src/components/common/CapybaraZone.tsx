import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Draggable from "react-draggable";

// 푸터 타입 정의 확장: status 추가
type FooterType = "progress" | "schedule" | "text" | "status";

interface Scenario {
  id: string;
  path: string;
  img: string;
  msg: string;
  color: string;
  footerType: FooterType; 
  footerValue: string | number; 
}

const BARA_SCENARIOS: Scenario[] = [
  { id: "welcome", path: "/", img: "C_2.png", msg: "어서오심시오 환영합니다", color: "bg-[#FF87B4]", footerType: "text", footerValue: "반가워요!" },
  { id: "meeting_normal", path: "/meeting/live", img: "C_3.png", msg: "그대로 계속 진행하심시오", color: "bg-[#91D148]", footerType: "progress", footerValue: 50 },
  { id: "quick_normal", path: "/meeting/quick/live", img: "C_3.png", msg: "열심히 경청하고 있슴니다", color: "bg-[#91D148]", footerType: "status", footerValue: "경청 중..." },
  { id: "generating", path: "/meeting/live", img: "C_5.png", msg: "회의록을 작성 중 입니다", color: "linear-gradient(90deg, #FF8A00 0%, #7000FF 100%)", footerType: "status", footerValue: "작성 중..." },
  { id: "idle_2", path: "/home", img: "C_7.png", msg: "지금 한가하심니까?", color: "bg-gray-300", footerType: "schedule", footerValue: "26. 5. 13 / 14:00" },
  { id: "profile_setting", path: "/profile", img: "C_3.png", msg: "계정을 안전하게 관리하심시오", color: "bg-[#91D148]", footerType: "text", footerValue: "보안 점검 중" }
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
    else if (pathname.includes("/meeting/quick")) {
      setCurrentScenario(BARA_SCENARIOS.find(s => s.id === "quick_normal") || BARA_SCENARIOS[2]);
    }
    else if (pathname.includes("/meeting/")) {
      setCurrentScenario(BARA_SCENARIOS.find(s => s.id === "meeting_normal") || BARA_SCENARIOS[1]);
    }
    else if (pathname === "/profile") {
      setCurrentScenario(BARA_SCENARIOS.find(s => s.id === "profile_setting") || BARA_SCENARIOS[0]);
    }
  }, [pathname]);

  useEffect(() => {
    const handleBaraUpdate = (event: any) => {
      const { scenarioId, progress, status, customMessage } = event.detail; 
      const newScenario = BARA_SCENARIOS.find(s => s.id === scenarioId);
      if (newScenario) {
        let updatedScenario = { ...newScenario };
        if (progress !== undefined) updatedScenario.footerValue = progress;
        if (status !== undefined) {
          updatedScenario.footerType = "status";
          updatedScenario.footerValue = status;
        }
        if (customMessage) updatedScenario.msg = customMessage;
        setCurrentScenario(updatedScenario);
      }
    };
    window.addEventListener('UPDATE_BARA', handleBaraUpdate);
    return () => window.removeEventListener('UPDATE_BARA', handleBaraUpdate);
  }, []);

  const renderFooter = () => {
    const { footerType, footerValue } = currentScenario;
    switch (footerType) {
      case "progress":
        return <span className="text-[13px] font-bold text-gray-400">Progress: <span className="text-gray-600">{footerValue}%</span></span>;
      case "status": // ★ 상태 표시 전용 렌더링
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#91D148] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#91D148]"></span>
            </span>
            <span className="text-[12px] font-black text-[#91D148] tracking-tight">{footerValue}</span>
          </div>
        );
      case "schedule":
        return <div className="flex flex-col items-center leading-none"><span className="text-[10px] font-bold text-gray-400 mb-0.5">다음 회의</span><span className="text-[12px] font-black text-gray-600">{footerValue}</span></div>;
      default:
        return <span className="text-[12px] font-bold text-gray-500 italic">{footerValue}</span>;
    }
  };

  const isShowBara = pathname === "/" || pathname === "/home" || pathname === "/profile" || pathname === "/template-settings" || pathname.includes("/meeting/");
  if (!isShowBara) return null;

  return (
    // ★ bounds="body"로 변경하고, 포지션 초기값을 잡아 순간이동 방지
    <Draggable nodeRef={nodeRef} onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)} bounds="body">
      {/* fixed 위치를 제거하고 초기 위치를 라이브러리에 맡기기 위해 클래스 수정 */}
      <div ref={nodeRef} className="fixed bottom-10 right-10 z-[9999] flex flex-col items-end gap-2 cursor-grab active:cursor-grabbing touch-none">
        {!isDragging && (
          <div className="relative bg-white border-2 border-gray-100 shadow-xl rounded-2xl p-4 max-w-[220px] animate-fade-in-up select-none pointer-events-none mb-1">
            <p className="text-[14px] text-gray-800 font-black text-center leading-tight">{currentScenario.msg}</p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-100 transform rotate-45"></div>
          </div>
        )}
        <div className="w-44 bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all">
          <div className={`h-3 w-full ${currentScenario.color.startsWith('bg-') ? currentScenario.color : ''}`} style={{ background: !currentScenario.color.startsWith('bg-') ? currentScenario.color : undefined }} />
          <div className="flex-1 bg-[#f9f9f9] flex items-center justify-center p-4 min-h-[140px]">
            <img src={`/images/bara/${currentScenario.img}`} alt="바라" className="w-full h-full object-contain select-none" draggable={false} />
          </div>
          <div className="bg-white border-t border-gray-100 py-2 flex items-center justify-center min-h-[36px]">
            {renderFooter()}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default CapybaraZone;