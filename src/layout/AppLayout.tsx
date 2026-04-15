import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation, useParams } from "react-router";
import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

// 👉 시나리오별 이미지, 멘트, 색상바, 진행률 데이터 매핑
// 사용자가 제공한 원본 멘트를 유지하며 경로(path)와 ID를 추가했습니다.
const BARA_SCENARIOS = [
  { 
    id: "welcome", 
    path: "/", 
    img: "C_2.png", 
    msg: "어서오심시오 환영합니다", 
    color: "bg-[#FF87B4]", 
    progress: 70 
  },
  { 
    id: "meeting_normal", 
    path: "/meeting/live", 
    img: "C_3.png", 
    msg: "그대로 계속 진행하심시오", 
    color: "bg-[#91D148]", 
    progress: 50 
  },
  { 
    id: "meeting_caution", 
    path: "/meeting/live", 
    img: "C_8.png", 
    msg: "조금 우려가 됨니다", 
    color: "bg-[#FFD154]", 
    progress: 50 
  },
  { 
    id: "meeting_warning", 
    path: "/meeting/live", 
    img: "C_1.png", 
    msg: "안건을 벗어났음니다", 
    color: "bg-[#FF6B6B]", 
    progress: 70 
  },
  { 
    id: "generating", 
    path: "/meeting/live", 
    img: "C_5.png", 
    msg: "회의록을 작성 중 입니다", 
    color: "linear-gradient(90deg, #FF8A00 0%, #7000FF 100%)", 
    progress: 100 
  },
  { 
    id: "meeting_done", 
    path: "/meeting/live", 
    img: "C_4.png", 
    msg: "회의, 고생하셨슴니다", 
    color: "bg-[#B8A3FF]", 
    progress: 100 
  },
  { 
    id: "idle_1", 
    path: "/", 
    img: "C_6.png", 
    msg: "남은 회의 일정이 없슴니다", 
    color: "bg-gray-300", 
    progress: 0 
  },
  { 
    id: "idle_2", 
    path: "/", 
    img: "C_7.png", 
    msg: "지금 한가하심니까?", 
    color: "bg-gray-300", 
    progress: 0 
  },
  { 
    id: "feedback", 
    path: "/", 
    img: "C_9.png", 
    msg: "돈가스가 먹고싶슴니다", 
    color: "bg-gray-200", 
    progress: 50 
  }
];

const CapybaraZone: React.FC = () => {
  const { pathname } = useLocation();
  const [currentScenario, setCurrentScenario] = useState(BARA_SCENARIOS[0]);
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);

  // 경로 변화에 따른 바라 상태 결정
  useEffect(() => {
    if (pathname === "/" || pathname === "/home") {
      // 홈 화면에서는 환영 혹은 유휴 상태의 바라 노출
      setCurrentScenario(BARA_SCENARIOS.find(s => s.id === "welcome") || BARA_SCENARIOS[0]);
    } 
    else if (pathname.includes("/meeting/") && pathname.includes("/live")) {
      // 실시간 회의 화면에서는 정상 진행 상태를 기본으로 노출 (이후 liveStatus 데이터 연동 가능)
      setCurrentScenario(BARA_SCENARIOS.find(s => s.id === "meeting_normal") || BARA_SCENARIOS[1]);
    }
  }, [pathname]);

  const handleStart = () => setIsDragging(true);
  const handleStop = () => setIsDragging(false);

  // 지정된 경로가 아닐 경우 렌더링하지 않음
  const isShowBara = pathname === "/" || pathname === "/home" || (pathname.includes("/meeting/") && pathname.includes("/live"));
  if (!isShowBara) return null;

  return (
    <Draggable 
      nodeRef={nodeRef}
      onStart={handleStart}
      onStop={handleStop}
      bounds="parent"
    >
      <div 
        ref={nodeRef} 
        className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-2 cursor-grab active:cursor-grabbing"
      >
        {/* 1. 말풍선 영역 */}
        {!isDragging && (
          <div className="relative bg-white border-2 border-gray-100 shadow-xl rounded-2xl p-4 max-w-[220px] animate-fade-in-up select-none pointer-events-none mb-1">
            <p className="text-[14px] text-gray-800 font-black text-center leading-tight">
              {currentScenario.msg}
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-100 transform rotate-45"></div>
          </div>
        )}

        {/* 2. 카피바라 카드 영역 */}
        <div className="w-48 bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all">
          {/* 상단 상태 바 (중복 className 오류 해결) */}
          <div 
            className={`h-4 w-full ${currentScenario.color.startsWith('bg-') ? currentScenario.color : ''}`} 
            style={{ background: currentScenario.color.startsWith('bg-') ? undefined : currentScenario.color }}
          />

          {/* 캐릭터 이미지 영역 */}
          <div className="flex-1 bg-[#f9f9f9] flex items-center justify-center p-4 min-h-[160px]">
            <img 
              src={`/images/bara/${currentScenario.img}`} 
              alt="바라" 
              className="w-full h-full object-contain select-none"
              draggable={false}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<span class="text-6xl">🐹</span>';
              }}
            />
          </div>

          {/* 하단 진행률 영역 */}
          <div className="bg-white border-t border-gray-100 py-2 text-center">
            <span className="text-[13px] font-bold text-gray-400">
              Progress: <span className="text-gray-600">{currentScenario.progress}%</span>
            </span>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  return (
    <div className="h-screen w-screen xl:flex relative bg-white overflow-hidden">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:ml-[240px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""} bg-white overflow-hidden`}
      >
        <AppHeader />
        
        <div className="flex-1 overflow-y-auto p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6 bg-white">
          <Outlet />
        </div>
      </div>

      <CapybaraZone />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;