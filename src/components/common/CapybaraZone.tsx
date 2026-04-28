import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Draggable from "react-draggable";

type FooterType = "progress" | "schedule" | "text" | "status";

interface Scenario {
  id: string;
  img: string;
  msg: string;
  color: string;
  footerType: FooterType; 
  footerValue: string | number;
  timeLeft?: string;
}

const BARA_SCENARIOS: Scenario[] = [
  { id: "welcome", img: "C_2.png", msg: "어서오심시오 환영합니다", color: "bg-[#FF87B4]", footerType: "text", footerValue: "반가워요!" },
  { id: "meeting_normal", img: "C_3.png", msg: "그대로 계속 진행하심시오", color: "bg-[#91D148]", footerType: "status", footerValue: "정상 진행 중" },
  { id: "meeting_caution", img: "C_8.png", msg: "조금 우려가 됨니다", color: "bg-[#FFD154]", footerType: "status", footerValue: "안건 이탈 주의" },
  { id: "meeting_warning", img: "C_1.png", msg: "안건을 벗어났음니다", color: "bg-[#FF6B6B]", footerType: "status", footerValue: "복귀 필요!" },
  { id: "generating", img: "C_5.png", msg: "회의록을 작성 중 입니다", color: "bg-[#7000FF]", footerType: "status", footerValue: "AI 요약 중" },
  { id: "idle", img: "C_7.png", msg: "지금 한가하심니까?", color: "bg-gray-400", footerType: "schedule", footerValue: "26. 5. 13 / 14:00" },
  { id: "dancing", img: "Bara_Dancing.gif", msg: "후후 이대로하십쇼", color: "bg-gray-400", footerType: "schedule", footerValue: "26. 5. 13 / 14:00" },
  { 
    id: "profile_setting", 
    img: "C_3.png", 
    msg: "주기적인 비밀번호 변경은 중요한 데이터를 지키는 첫걸음입니다! 🐹🛡️", 
    color: "bg-[#91D148]", 
    footerType: "text", 
    footerValue: "보안 점검 중" 
  }
];

const CapybaraZone: React.FC = () => {
  const { pathname } = useLocation();
  
  const isQuickMeeting = pathname.includes("/meeting/quick");
  const isLiveMeeting = pathname.includes("/meeting/") && !isQuickMeeting;

  // 💡 1. 렌더링 깜빡임/애니메이션 버그 방지: 초기 렌더링 시 현재 경로를 바탕으로 상태 결정
  const getInitialScenario = () => {
    if (pathname === "/profile") return BARA_SCENARIOS.find(s => s.id === "profile_setting") || BARA_SCENARIOS[7];
    if (pathname.includes("/general-setting")) return BARA_SCENARIOS.find(s => s.id === "dancing") || BARA_SCENARIOS[6];
    if (pathname === "/" || pathname === "/home") return BARA_SCENARIOS.find(s => s.id === "idle") || BARA_SCENARIOS[5];
    if (isLiveMeeting || isQuickMeeting) return BARA_SCENARIOS.find(s => s.id === "meeting_normal") || BARA_SCENARIOS[1];
    return BARA_SCENARIOS.find(s => s.id === "idle") || BARA_SCENARIOS[5];
  };

  const getInitialMinimized = () => {
    if (isLiveMeeting || isQuickMeeting) return false;
    const sleepPaths = ["/settings", "/workspace", "/project", "/meeting-start", "/meeting-register", "/calandar", "/calendar", "/profile", "/history", "/general-setting"];
    return sleepPaths.some(p => pathname.includes(p));
  };

  const [currentScenario, setCurrentScenario] = useState<Scenario>(getInitialScenario);
  const [isMinimized, setIsMinimized] = useState<boolean>(getInitialMinimized);

  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  const nodeRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isLiveMeeting) {
        setCurrentTime(new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isLiveMeeting]);

  // 💡 2. 경로 변경 시 시나리오 강제 전환 및 수면 모드 유지 로직
  useEffect(() => {
    setCurrentScenario(getInitialScenario());

    if (isLiveMeeting || isQuickMeeting) {
      setIsMinimized(false);
    } else {
      const sleepPaths = ["/settings", "/workspace", "/project", "/meeting-start", "/meeting-register", "/calandar", "/calendar", "/profile", "/history", "/general-setting"];
      if (sleepPaths.some(p => pathname.includes(p))) {
        setIsMinimized(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isLiveMeeting, isQuickMeeting]);

  useEffect(() => {
    const handleBaraUpdate = (event: any) => {
      const { scenarioId, progress, status, customMessage, timeLeft } = event.detail; 
      const newScenario = BARA_SCENARIOS.find(s => s.id === scenarioId);
      if (newScenario) {
        let updatedScenario = { ...newScenario };
        if (status !== undefined) { updatedScenario.footerType = "status"; updatedScenario.footerValue = status; }
        else if (progress !== undefined) { updatedScenario.footerType = "progress"; updatedScenario.footerValue = progress; }
        if (customMessage) updatedScenario.msg = customMessage;
        if (timeLeft !== undefined) updatedScenario.timeLeft = timeLeft;
        setCurrentScenario(updatedScenario);
      }
    };
    window.addEventListener('UPDATE_BARA', handleBaraUpdate);
    return () => window.removeEventListener('UPDATE_BARA', handleBaraUpdate);
  }, []);

  const renderFooter = () => {
    const { footerType, footerValue } = currentScenario;
    const isLightColor = currentScenario.color.includes("FFD154");
    const textColor = isLightColor ? 'text-gray-900' : 'text-white';

    switch (footerType) {
      case "status":
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLightColor ? 'bg-gray-800' : 'bg-white'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLightColor ? 'bg-gray-800' : 'bg-white'}`}></span>
            </span>
            <span className={`text-[13px] font-black ${textColor}`}>{footerValue}</span>
          </div>
        );
      case "progress":
        return <span className={`text-[13px] font-black ${textColor}`}>Progress: {footerValue}%</span>;
      case "schedule":
        return (
          <div className={`flex flex-col items-center leading-none ${textColor}`}>
            <span className="text-[10px] font-black opacity-75 mb-0.5 tracking-tight">다음 회의 일정</span>
            <span className="text-[13px] font-black tracking-tighter tabular-nums">{footerValue}</span>
          </div>
        );
      default:
        return <span className={`text-[13px] font-black ${textColor}`}>{footerValue}</span>;
    }
  };

  const isShowBara = !pathname.includes("/login");
  if (!isShowBara) return null;

  return (
    <Draggable nodeRef={nodeRef} onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)} bounds="body">
      <div 
        ref={nodeRef} 
        className="fixed bottom-1 right-1 z-[9999] flex flex-col items-end gap-3 cursor-grab active:cursor-grabbing touch-none"
        onDoubleClick={() => setIsMinimized(!isMinimized)}
      >
        
        {/* 최소화 상태가 아닐 때만 말풍선 표시 */}
        {!isDragging && !isMinimized && (
          <div className="relative bg-white border-2 border-gray-100 shadow-2xl rounded-[8px] p-4 min-w-[220px] max-w-[220px] animate-fade-in-up select-none pointer-events-none mb-1 transition-all">
            <p className="text-[14px] text-gray-800 font-bold text-center leading-tight break-keep">{currentScenario.msg}</p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-100 transform rotate-45"></div>
          </div>
        )}
        
        {isMinimized ? (
          <div className="w-[200px] h-[65px] bg-white border border-gray-200 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden transition-all duration-300">
            {/* 수면 모드 이미지 */}
            <img 
              src="/images/bara/C_sleep.png" 
              alt="수면 중인 바라" 
              className="w-full h-full object-cover select-none" 
              draggable={false} 
            />
          </div>
        ) : (
          // 기본 세로형 모드
          <div className="w-52 h-[250px] bg-white border border-gray-200 rounded-[8px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden transition-all">
            
            <div className={`h-13 w-full shrink-0 flex items-center justify-center ${currentScenario.color} transition-colors duration-500`}>
              <span className={`text-[32px] font-black tracking-tighter tabular-nums ${currentScenario.color.includes("FFD154") ? 'text-gray-900' : 'text-white'}`}>
                {isLiveMeeting ? currentScenario.timeLeft : currentTime}
              </span>
            </div>

            <div className="flex-1 bg-[#f5f5f5] flex items-center justify-center relative min-h-0">
              <img 
                src={`/images/bara/${currentScenario.img}`} 
                alt="바라" 
                className="w-full h-full object-contain select-none transition-transform duration-300" 
                draggable={false} 
              />
            </div>

            <div className={`h-10 w-full shrink-0 flex items-center justify-center ${currentScenario.color} transition-colors duration-500`}>
              {renderFooter()}
            </div>
          </div>
        )}

      </div>
    </Draggable>
  );
};

export default CapybaraZone;