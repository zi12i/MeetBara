import React from "react";
import { Link } from "react-router";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col lg:flex-row">
      
      {/* === 왼쪽 섹션: 로그인 폼 영역 === */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center bg-white relative z-10">
        {/* 상단 로고 div가 제거되었습니다. */}
        
        {children}
      </div>

      {/* === 오른쪽 섹션: 브랜드 비주얼 영역 === */}
      <div className="hidden lg:flex lg:w-1/2 h-full bg-[#F4F9ED] relative items-center justify-center overflow-hidden">
        
        {/* 배경 장식 (원형 패턴 등) */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#91D148]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#91D148]/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* 바라 캐릭터 이미지 (C_2.png 활용) */}
          <div className="w-64 h-64 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mb-10 transform rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white">
            <img
              src="/images/bara/C_2.png"
              alt="어서오심시오 바라"
              className="w-48 h-48 object-contain"
            />
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
            똑똑한 회의의 시작,<br />
            <span className="text-[#91D148]">회의바라</span>가 함께해요
          </h2>
          
          <p className="text-lg text-gray-600 font-bold max-w-md leading-relaxed">
            "드래그해서 저를 옮겨보셨나요? <br />
            오늘도 즐거운 회의가 되길 바라바라바라!"
          </p>
          
          {/* 장식용 뱃지 */}
          <div className="mt-12 flex gap-3">
            <span className="px-4 py-2 bg-white rounded-full text-sm font-black text-[#91D148] shadow-sm">#실시간요약</span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-black text-[#91D148] shadow-sm">#팩트체크</span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-black text-[#91D148] shadow-sm">#AI회의록</span>
          </div>
        </div>

        {/* 하단 푸터 장식 */}
        <div className="absolute bottom-10 text-gray-400 text-sm font-medium">
          © 2026 MEETBARA. All rights reserved.
        </div>
      </div>
    </div>
  );
}