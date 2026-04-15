import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import { useState, useRef } from "react";
import Draggable from "react-draggable";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

// 👉 드래그든 클릭이든 끝나면 무조건 멘트가 나오는 고도화된 카피바라 존
const CapybaraZone: React.FC = () => {
  const [message, setMessage] = useState("오늘도 알찬 회의를 진행해 볼까요? 🐹");
  const [isDragging, setIsDragging] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  // react-draggable 에러 방지용 Ref
  const nodeRef = useRef(null);

  const messages = [
    "저를 클릭하셨군요! 🐹",
    "안녕하세요! 저는 회의바라예요. ✨",
    "궁금한 게 있으면 언제든 물어보세요!",
    "회의 내용을 열심히 요약하고 있어요. 📝",
    "졸지 말고 회의에 집중하세요! (농담이에요 ㅎㅎ)",
    "원하는 곳으로 저를 옮겨둘 수 있어요. 🚀"
  ];

  // 드래그 시작 시 실행: 말풍선 숨김
  const handleStart = () => {
    setIsDragging(true);
  };

  // 드래그가 끝났을 때 (또는 그냥 클릭만 했을 때) 실행
  const handleStop = () => {
    setIsDragging(false);
    
    // 🌟 핵심 해결책: 드래그 여부 따지지 않고 무조건 다음 멘트로 변경
    setClickCount((prevCount) => {
      const nextIndex = (prevCount + 1) % messages.length;
      setMessage(messages[nextIndex]);
      return nextIndex;
    });
  };

  return (
    <Draggable 
      nodeRef={nodeRef}
      bounds="parent" 
      onStart={handleStart}
      onStop={handleStop} // 드래그/클릭이 끝나면 호출됨
      defaultPosition={{x: 0, y: 0}}
    >
      <div 
        ref={nodeRef}
        className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-3 cursor-grab active:cursor-grabbing"
      >
        {/* 1. 말풍선 영역: 드래그 중에는 숨김  */}
        {!isDragging && message && (
          <div className="relative bg-white border border-[#91D148] shadow-lg rounded-2xl p-4 max-w-[220px] animate-fade-in-up select-none pointer-events-none">
            <p className="text-[14px] text-gray-700 font-bold whitespace-pre-wrap">
              {message}
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-[#91D148] transform rotate-45"></div>
          </div>
        )}

        {/* 2. 카피바라 캐릭터 영역 */}
        <div 
          className="w-45 h-45 bg-[#f4f9ed] border-2 border-[#91D148]/20 rounded-2xl shadow-md flex items-center justify-center hover:shadow-xl transition-all active:scale-95"
        >
          <span className="text-4xl select-none">🐹</span>
        </div>
      </div>
    </Draggable>
  );
};

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  return (
    // 전체 배경 흰색 유지 [cite: 1640]
    <div className="h-screen w-screen xl:flex relative bg-white overflow-hidden">
      <AppSidebar />
      <Backdrop />
      
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:ml-[240px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""} bg-white overflow-hidden`}
      >
        <AppHeader />
        
        {/* 본문 영역 (개별 스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6 bg-white">
          <Outlet />
        </div>
      </div>

      {/* 자유롭게 드래그 가능한 카피바라 존 */}
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