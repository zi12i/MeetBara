import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  return (
    // 💡 핵심 1: 최상단 부모에서 flex 속성 완전 제거!
    // 화면에 꽉 차게 고정(h-screen w-full)하고, 삐져나가는 모든 전역 스크롤을 차단(overflow-hidden)합니다.
    <div className="relative h-screen w-full bg-white overflow-hidden">
      
      {/* 고정된(fixed) 사이드바는 문서 흐름에 영향을 주지 않고 화면 위에 뜹니다. */}
      <AppSidebar />
      <Backdrop />
      
      {/* 💡 핵심 2: 메인 래퍼를 block 레벨로 유지하되, h-screen을 부여합니다. */}
      {/* 마진(ml)이 변해도 가로 너비가 100vw를 넘지 않고 똑똑하게 스스로 줄어듭니다. */}
      <div
        className={`flex flex-col h-screen transition-all duration-300 ease-in-out bg-white ${
          isExpanded ? "lg:ml-[240px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        {/* 헤더 영역 (스크롤되지 않고 상단에 딱 고정됨) */}
        <div className="shrink-0">
          <AppHeader />
        </div>
        
        {/* 💡 핵심 3: 이 레이아웃에서 '유일하게' 스크롤이 허용되는 본문 영역 */}
        {/* 내용이 길어지면 브라우저 전체가 아니라 이 main 태그 내부만 스크롤됩니다. */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white relative p-4 md:p-6">
          <div className="mx-auto w-full max-w-(--breakpoint-2xl)">
            <Outlet />
          </div>
        </main>
      </div>
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