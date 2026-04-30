import React, { useEffect } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useNavigate } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useAuth } from "../context/AuthContext";

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/signin");
    }
  }, [user, loading, navigate]);

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <p className="text-gray-400 font-bold text-[16px]">불러오는 중... 🐹</p>
      </div>
    );
  }

  // 로그인 안 되어 있으면 아무것도 안 보여줌 (navigate 처리됨)
  if (!user) return null;

  return (
    <div className="relative h-screen w-full bg-white overflow-hidden">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex flex-col h-screen transition-all duration-300 ease-in-out bg-white ${
          isExpanded ? "lg:ml-[240px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <div className="shrink-0">
          <AppHeader />
        </div>
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