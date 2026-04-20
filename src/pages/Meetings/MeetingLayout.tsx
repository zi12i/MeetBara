import React from "react";
import { Outlet } from "react-router";

interface MeetingLayoutProps {
  children?: React.ReactNode;
}

export default function MeetingLayout({ children }: MeetingLayoutProps) {
  return (
    <div className="h-screen w-screen bg-white overflow-hidden flex flex-col">

      <main className="flex-1 w-full h-full relative overflow-hidden">
        {children || <Outlet />}
      </main>

      {/* 하단에 살짝 포인트를 주어 AuthLayout과의 디자인 통일감을 부여합니다. */}
      <div className="h-1 bg-[#91D148]/20 w-full" />
    </div>
  );
}