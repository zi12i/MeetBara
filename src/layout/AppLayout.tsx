import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import CapybaraZone from "../components/common/CapybaraZone";

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  return (
    <div className="h-screen w-screen xl:flex relative bg-white overflow-hidden">
      {/* 사이드바 영역 */}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      
      {/* 메인 컨텐츠 영역 */}
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

      {/* 바라 영역 (컴포넌트로 분리됨) */}
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