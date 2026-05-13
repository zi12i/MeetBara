import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Draggable from "react-draggable";
import { createPortal } from "react-dom";
import Roulette from "../decisions/Roulette"; 
import Ladder from "../decisions/Ladder"; 
import ProsCons from "../decisions/ProsCons";

// 💡 커스텀 SVG 아이콘 정의
const DiceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"></circle>
    <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"></circle>
    <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"></circle>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

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
  { id: "profile_setting", img: "C_3.png", msg: "주기적인 비밀번호 변경은 중요한 데이터를 지키는 첫걸음입니다! 🐹🛡️", color: "bg-[#91D148]", footerType: "text", footerValue: "보안 점검 중" },
  { id: "meeting_quick", img: "C_4.png", msg: "", color: "bg-gray-400", footerType: "text", footerValue: "빠른 회의 중" } 
];

interface ChatMessage {
  id: number;
  sender: "me" | "bara" | "other";
  text: string;
  time: string;
  user?: string;
  target?: string; 
}

interface CapybaraZoneProps {
  mode?: "floating" | "embedded";
  teamChatList?: ChatMessage[];
  inputValue?: string;
  onInputChange?: (val: string) => void;
  onSendMessage?: () => void;
  chatTarget?: string;
  onChatTargetChange?: (target: string) => void;
  meetingMembers?: string[];
}

const CapybaraZone: React.FC<CapybaraZoneProps> = ({ 
  mode = "floating",
  teamChatList = [],
  inputValue = "",
  onInputChange,
  onSendMessage,
  chatTarget = "all",
  onChatTargetChange,
  meetingMembers = []
}) => {
  const { pathname } = useLocation();
  const isQuickMeeting = pathname.includes("/meeting/quick");
  const isLiveMeeting = pathname.includes("/meeting/1/") && !isQuickMeeting;

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ---------------------------------------------------------
  // 🎥 [데모 전용] 가상 커서 및 위젯 자동 시연 로직
  // ---------------------------------------------------------
  const [cursor, setCursor] = useState({ x: -100, y: -100, visible: false, clicking: false, dragging: false });
  const [localInput, setLocalInput] = useState("");

  const handleInput = (val: string) => {
    if (onInputChange) onInputChange(val);
    else setLocalInput(val);
  };
  const displayInput = onInputChange ? inputValue : localInput;

  const handleSend = () => {
    if (onSendMessage) onSendMessage();
    else setLocalInput("");
  };

  useEffect(() => {
    // 💡 모드가 embedded이거나 실시간 회의 화면(isLiveMeeting)이 아닐 경우 데모 로직을 실행하지 않음
    if (mode === "embedded" || !isLiveMeeting) return;

    let isCancelled = false;
    
    // 강력한 Abort 로직을 포함한 대기 함수: 취소되면 즉시 에러를 던져 남은 동작 차단
    const wait = async (ms: number) => {
      await new Promise(res => setTimeout(res, ms));
      if (isCancelled) throw new Error("cancelled");
    };

    const moveCursor = async (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCursor(prev => ({ ...prev, visible: true, dragging: false, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
      }
      await wait(600); // 💡 이동 애니메이션 대기 (조절 가능)
    };

    const clickCursor = async () => {
      setCursor(prev => ({ ...prev, clicking: true }));
      await wait(150);
      setCursor(prev => ({ ...prev, clicking: false }));
      await wait(200);
    };

    const doubleClickCursor = async () => {
      setCursor(prev => ({ ...prev, clicking: true }));
      await wait(80);
      setCursor(prev => ({ ...prev, clicking: false }));
      await wait(80);
      setCursor(prev => ({ ...prev, clicking: true }));
      await wait(80);
      setCursor(prev => ({ ...prev, clicking: false }));
      await wait(200);
    };

    const runDemo = async () => {
      try {
        // 💡 메인 회의 시연(LiveMeeting)과 겹치지 않도록 초기 진입 딜레이 설정
        await wait(27000); 

        // 1. 위젯 드래그 시연
        const widgetId = "demo-bara-widget";
        const el = document.getElementById(widgetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          const startX = rect.left + rect.width / 2;
          const startY = rect.top + 20; 
          
          setCursor(prev => ({ ...prev, visible: true, x: startX, y: startY }));
          await wait(400);

          setCursor(prev => ({ ...prev, clicking: true, dragging: true }));
          el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: startX, clientY: startY, button: 0, buttons: 1 }));
          await wait(200);

          const dx = -100; 
          const dy = -100; 
          const steps = 30;
          
          for (let i = 1; i <= steps; i++) {
            const cx = startX + (dx * (i / steps));
            const cy = startY + (dy * (i / steps));
            setCursor(prev => ({ ...prev, x: cx, y: cy }));
            document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: cx, clientY: cy, button: 0, buttons: 1 }));
            await wait(16); 
          }

          document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: startX + dx, clientY: startY + dy, button: 0, buttons: 0 }));
          setCursor(prev => ({ ...prev, clicking: false, dragging: false }));
          await wait(1000); // 💡 드래그 종료 후 대기
        }

        // 2. 더블 클릭으로 축소 (정확히 헤더 타겟팅)
        await moveCursor("demo-bara-header");
        await doubleClickCursor();
        setIsMinimized(true);
        await wait(1200); // 💡 모드 전환 후 대기

        // 3. 더블 클릭으로 원복 (정확히 수면 이미지 타겟팅)
        await moveCursor("demo-bara-sleep-img");
        await doubleClickCursor();
        setIsMinimized(false);
        await wait(1200);

        // 💡 (요청 반영) 채팅창 입력 시연 과정(기존 4~7단계) 삭제

        // 4. 확장 기능 모달 열기 (기존 8번)
        await moveCursor("demo-bara-dice-btn");
        await clickCursor();
        setIsFeatureModalOpen(true);
        await wait(2000); // 💡 모달 띄워두고 구경하는 시간 (조절 가능)

        // 5. 확장 기능 모달 닫기 (기존 9번)
        await moveCursor("demo-bara-ext-close");
        await clickCursor();
        setIsFeatureModalOpen(false);
        await wait(1500);

        // 커서 퇴장
        setCursor(prev => ({ ...prev, visible: false }));

      } catch (e: any) {
        if (e.message !== "cancelled") console.error(e);
      }
    };

    runDemo();
    
    return () => { isCancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isLiveMeeting]); // 💡 의존성 배열에 isLiveMeeting 추가
  // ---------------------------------------------------------

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCurrentScenario(getInitialScenario());
    if (isLiveMeeting || isQuickMeeting) setIsMinimized(false);
    else {
      const sleepPaths = ["/settings", "/workspace", "/project", "/meeting-start", "/meeting-register", "/calandar", "/calendar", "/profile", "/history", "/general-setting"];
      if (sleepPaths.some(p => pathname.includes(p))) setIsMinimized(true);
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

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [teamChatList, isChatOpen]);

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
            <span className={`text-[14px] font-black ${textColor} tracking-tight`}>{footerValue}</span>
          </div>
        );
      case "progress":
        return <span className={`text-[14px] font-black ${textColor} tracking-tight`}>Progress: {footerValue}%</span>;
      case "schedule":
        return (
          <div className={`flex flex-col items-center leading-none ${textColor}`}>
            <span className="text-[10px] font-black opacity-75 mb-0.5 tracking-tight">다음 회의 일정</span>
            <span className="text-[14px] font-black tracking-tighter tabular-nums">{footerValue}</span>
          </div>
        );
      default:
        return <span className={`text-[14px] font-black ${textColor} tracking-tight`}>{footerValue}</span>;
    }
  };

  const isShowBara = !pathname.includes("/login");
  if (!isShowBara) return null;

  if (mode === "embedded") {
    const isLightColor = currentScenario.color.includes("FFD154");
    const textColor = isLightColor ? 'text-gray-900' : 'text-white';

    return (
      <div className="w-full h-full flex flex-col bg-transparent select-none overflow-hidden">
        <div className={`h-[35px] w-full shrink-0 flex items-center justify-center shadow-sm z-10 ${currentScenario.color} transition-colors duration-500`}>
          <span className={`text-[18px] font-black tracking-tighter tabular-nums ${textColor}`}>
            {isLiveMeeting ? (currentScenario.timeLeft || currentTime) : currentTime}
          </span>
        </div>
        <div className="flex-1 w-full flex items-center px-3 relative z-0">
          <div className="w-[120px] h-full flex items-center justify-center shrink-0">
            <img src={`/images/bara/${currentScenario.img}`} alt="바라" className="w-full h-[85%] object-contain drop-shadow-md transition-transform duration-300 hover:scale-105" draggable={false} />
          </div>
          <div className="flex-1 pl-5 flex flex-col justify-center">
            <span className="text-[11px] font-black text-[#6B8E23] mb-1.5 flex items-center gap-1.5 opacity-80">
              <img src="/images/favicon.ico" alt="icon" className="w-3.5 h-3.5 opacity-90" /> 바라
            </span>
            <p className="text-[15px] text-gray-800 font-bold leading-snug break-keep">
              {currentScenario.msg}
            </p>
          </div>
        </div>
        <div className={`h-[35px] w-full shrink-0 flex items-center justify-center shadow-inner z-10 ${currentScenario.color} transition-colors duration-500`}>
          {renderFooter()}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 💡 데모용 가상 마우스 커서 */}
      {cursor.visible && (
        <div
          style={{
            position: "fixed",
            top: cursor.y,
            left: cursor.x,
            width: "32px",
            height: "32px",
            pointerEvents: "none",
            zIndex: 999999,
            transform: `translate(-10%, -10%) ${cursor.clicking ? "scale(0.8)" : "scale(1)"}`,
            transition: cursor.dragging ? "none" : "top 0.6s cubic-bezier(0.25, 1, 0.5, 1), left 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.1s",
          }}
        >
          <svg viewBox="0 0 24 24" fill="black" stroke="white" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4l5.5 17.5 3.5-7.5 7.5-3.5z" />
          </svg>
          {cursor.clicking && (
            <div className="absolute top-0 left-0 w-8 h-8 bg-[#91D148] opacity-60 rounded-full animate-ping" style={{ transform: 'translate(-25%, -25%)' }} />
          )}
        </div>
      )}

      <Draggable nodeRef={nodeRef} onStart={() => setIsDragging(true)} onStop={() => setIsDragging(false)} bounds="body" cancel=".no-drag">
        <div id="demo-bara-widget" ref={nodeRef} className="fixed bottom-1 right-1 z-[9999] flex flex-col items-end gap-3 cursor-grab active:cursor-grabbing touch-none" onDoubleClick={() => setIsMinimized(!isMinimized)}>
          
          {isChatOpen && !isMinimized && (
            <div className="no-drag absolute bottom-full mb-3 right-0 w-[300px] h-[480px] bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in-up cursor-default" onClick={e => e.stopPropagation()}>
              
              <div className="bg-[#CAE7A7] px-4 py-3 border-b border-[#91D148]/20 flex justify-between items-center shrink-0">
                <span className="font-black text-gray-900 text-[14px]">💬 팀원 코멘트</span>
                <button id="demo-bara-chat-close-btn" onClick={() => setIsChatOpen(false)} className="text-gray-600 hover:text-gray-900 font-bold transition-colors">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-5">
                {teamChatList.map((chat) => (
                  <div key={chat.id} className={`flex flex-col ${chat.sender === "me" ? "items-end" : "items-start"}`}>
                    
                    {chat.target && chat.target !== "all" && (
                      <span className="text-[10px] font-black text-[#91D148] mb-1 px-1">🔒 {chat.target}에게만</span>
                    )}

                    {chat.sender !== "me" ? (
                      <span className="text-[10px] font-black text-gray-500 mb-1 px-1">{chat.user || "팀원"}</span>
                    ) : (
                      <span className="text-[10px] font-black text-[#91D148] mb-1 px-1">나(주최자)</span>
                    )}
                    <div className="flex items-end gap-2 max-w-[90%]">
                      {chat.sender === "me" && <span className="text-[10px] text-gray-400 mb-1 shrink-0">{chat.time}</span>}
                      <div className={`px-3 py-2.5 rounded-2xl text-[13px] font-bold shadow-sm leading-relaxed ${chat.sender === "me" ? "bg-gray-800 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-700 rounded-tl-none"}`}>{chat.text}</div>
                      {chat.sender !== "me" && <span className="text-[10px] text-gray-400 mb-1 shrink-0">{chat.time}</span>}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="p-3 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-2">
                <div className="flex px-1">
                  <select 
                    value={chatTarget} 
                    onChange={(e) => onChatTargetChange?.(e.target.value)} 
                    className="text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#CAE7A7] cursor-pointer"
                  >
                    <option value="all">모두에게 보내기</option>
                    {meetingMembers.map(name => ( <option key={name} value={name}>{name}에게 귓속말</option> ))}
                  </select>
                </div>

                <div className="relative">
                  <input 
                    id="demo-bara-chat-input"
                    type="text" 
                    value={displayInput}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.nativeEvent.isComposing) return; 
                      if (e.key === "Enter") handleSend(); 
                    }}
                    placeholder="코멘트 입력"
                    className="w-full border-2 border-gray-100 rounded-xl py-2.5 pl-3 pr-10 text-[13px] font-black focus:border-[#CAE7A7] outline-none transition-all bg-gray-50" 
                  />
                  <button id="demo-bara-send-btn" onClick={handleSend} className="absolute right-1.5 top-1.5 w-8 h-8 bg-[#91D148] text-white rounded-lg flex items-center justify-center shadow-md hover:bg-[#82bd41] transition-colors">➔</button>
                </div>
              </div>
            </div>
          )}

          {!isDragging && !isMinimized && !isChatOpen && (
            <div className="relative bg-white border-2 border-gray-100 shadow-2xl rounded-[8px] p-4 min-w-[220px] max-w-[220px] animate-fade-in-up select-none pointer-events-none mb-1 transition-all">
              <p className="text-[14px] text-gray-800 font-bold text-center leading-tight break-keep">{currentScenario.msg}</p>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-100 transform rotate-45"></div>
            </div>
          )}
          
          {isMinimized ? (
            <div className="w-[200px] h-[65px] bg-white border border-gray-200 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden transition-all duration-300">
              {/* 💡 데모 타겟 아이디 부여 (축소 상태 원복 클릭용) */}
              <img id="demo-bara-sleep-img" src="/images/bara/C_sleep.png" alt="수면 중인 바라" className="w-full h-full object-cover select-none" draggable={false} />
            </div>
          ) : (
            <div className="w-45 h-[240px] bg-white border border-gray-200 rounded-[10px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden transition-all">
              {/* 💡 데모 타겟 아이디 부여 (확대 상태 축소 클릭용) */}
              <div id="demo-bara-header" className={`h-11 w-full shrink-0 flex items-center justify-between px-2 ${currentScenario.color} transition-colors duration-500 relative`}>
                
                <button id="demo-bara-dice-btn" onClick={(e) => { e.stopPropagation(); setIsFeatureModalOpen(true); }} className="no-drag w-7 h-7 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-full text-white z-20 transition-transform hover:scale-110">
                  <DiceIcon />
                </button>
                
                {/* 💡 수정된 부분: 플로팅 모드에서도 남은 시간(timeLeft)이 정상적으로 출력됩니다. */}
                <span className={`absolute left-1/2 -translate-x-1/2 text-[32px] font-black tracking-tighter tabular-nums ${currentScenario.color.includes("FFD154") ? 'text-gray-900' : 'text-white'}`}>
                  {isLiveMeeting ? (currentScenario.timeLeft || currentTime) : currentTime}
                </span>
                
                <button id="demo-bara-chat-btn" onClick={(e) => { e.stopPropagation(); setIsChatOpen(prev => !prev); }} className={`no-drag w-7 h-7 flex items-center justify-center rounded-full text-white z-20 transition-all hover:scale-110 ${isChatOpen ? 'bg-black/40 shadow-inner' : 'bg-black/10 hover:bg-black/20'}`}>
                  <ChatBubbleIcon />
                </button>

              </div>
              <div className="flex-1 bg-[#f5f5f5] flex items-center justify-center relative min-h-0">
                <img src={`/images/bara/${currentScenario.img}`} alt="바라" className="w-full h-full object-contain select-none transition-transform duration-300" draggable={false} />
              </div>
              <div className={`h-10 w-full shrink-0 flex items-center justify-center ${currentScenario.color} transition-colors duration-500`}>{renderFooter()}</div>
            </div>
          )}
        </div>
      </Draggable>

      {/* 확장 기능 모달 */}
      {isFeatureModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsFeatureModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 w-[400px] shadow-2xl animate-zoom-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <DiceIcon /> 회의바라 확장 기능
            </h3>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => { setIsFeatureModalOpen(false); setActiveFeature('roulette'); }} className="p-4 border-2 border-gray-100 rounded-2xl hover:border-[#91D148] hover:bg-[#F4F9ED] text-left transition-all group">
                <div className="font-black text-gray-800 text-[16px] group-hover:text-[#6B8E23]">🎡 룰렛 돌리기</div>
                <div className="text-[13px] text-gray-500 font-bold mt-1 group-hover:text-[#91D148]">참여자 중 한 명을 무작위로 추첨합니다.</div>
              </button>

              <button onClick={() => { setIsFeatureModalOpen(false); setActiveFeature('ladder'); }} className="p-4 border-2 border-gray-100 rounded-2xl hover:border-[#91D148] hover:bg-[#F4F9ED] text-left transition-all group">
                <div className="font-black text-gray-800 text-[16px] group-hover:text-[#6B8E23]">🪜 사다리 타기</div>
                <div className="text-[13px] text-gray-500 font-bold mt-1 group-hover:text-[#91D148]">참여자들과 함께 사다리 게임을 진행합니다.</div>
              </button>

              <button onClick={() => { setIsFeatureModalOpen(false); setActiveFeature('proscons'); }} className="p-4 border-2 border-gray-100 rounded-2xl hover:border-[#91D148] hover:bg-[#F4F9ED] text-left transition-all group">
                <div className="font-black text-gray-800 text-[16px] group-hover:text-[#6B8E23]">🗳️ 투표 하기</div>
                <div className="text-[13px] text-gray-500 font-bold mt-1 group-hover:text-[#91D148]">참여자들과 함께 찬반 투표를 진행합니다.</div>
              </button>
            </div>

            <button id="demo-bara-ext-close" onClick={() => setIsFeatureModalOpen(false)} className="mt-6 w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black rounded-xl transition-colors">닫기</button>
          </div>
        </div>,
        document.body
      )}

      {/* 룰렛 모달 */}
      {activeFeature === 'roulette' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveFeature(null)}>
          <div className="bg-white rounded-[32px] p-8 w-auto min-w-[400px] shadow-2xl relative animate-zoom-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveFeature(null)} className="absolute top-6 right-6 text-2xl font-black text-gray-400 hover:text-gray-800 transition-colors">✕</button>
            <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">🎡 바라 룰렛</h3>
            <div className="flex justify-center"><Roulette /></div>
          </div>
        </div>,
        document.body
      )}
      
      {/* 사다리 타기 모달 */}
      {activeFeature === 'ladder' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveFeature(null)}>
          <div className="bg-white rounded-[32px] p-8 w-auto min-w-[500px] shadow-2xl relative animate-zoom-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveFeature(null)} className="absolute top-6 right-6 text-2xl font-black text-gray-400 hover:text-gray-800 transition-colors">✕</button>
            <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">🪜 바라 사다리</h3>
            <div className="flex justify-center"><Ladder /></div>
          </div>
        </div>,
        document.body
      )}

      {/* 투표 하기 모달 */}
      {activeFeature === 'proscons' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveFeature(null)}>
          <div className="bg-white rounded-[32px] p-8 w-auto min-w-[500px] shadow-2xl relative animate-zoom-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveFeature(null)} className="absolute top-6 right-6 text-2xl font-black text-gray-400 hover:text-gray-800 transition-colors">✕</button>
            <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">🗳️ 바라 투표</h3>
            <div className="flex justify-center"><ProsCons /></div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default CapybaraZone;