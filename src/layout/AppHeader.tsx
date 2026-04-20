import React, { useMemo } from "react";
import { useLocation } from "react-router-dom"; // 라우터 훅 임포트
import UserDropdown from "../components/header/UserDropdown";

// 👉 1. 경로(Path)에 따른 페이지 제목 맵핑 사전 정의
const routeTitles: Record<string, string> = {
  "/": "홈",
  "/home": "홈",
  "/profile": "내 정보 / 계정 연동",
  "/template-settings": "일반 / 템플릿 설정",
  "/status": "진행 현황",
  "/calendar": "회의 일정 관리",
  "/history": "히스토리",
  "/room-reservation": "회의 개설",
  "/wiki": "지식 관리",
  "/basic-tables": "조직 관리",
  "/data-tables": "유저 관리",
  "/editable-tables": "리포트 관리",
  "/meeting-start": "회의 시작",
  "/meeting-register": "회의 등록",
  // 필요한 정적 경로를 여기에 계속 추가하세요!
};

const AppHeader: React.FC = () => {
  const location = useLocation();

  // 👉 2. 현재 경로에 맞는 제목을 찾아주는 로직
  const pageTitle = useMemo(() => {
    const path = location.pathname;

    // 1순위: 정적 맵핑에서 찾기
    if (routeTitles[path]) {
      return routeTitles[path];
    }
    
    // 2순위: 동적 경로 처리 (예: /meeting/1/result)
    if (path.startsWith("/meeting/") && path.includes("/result")) {
      return "회의록 요약 결과";
    }
    
    if (path.startsWith("/meeting/") && path.includes("/live")) {
      return "실시간 회의 진행";
    }

    // 3순위: 매핑되지 않은 경로는 기본 로고 텍스트나 기본값 출력
    return "회의바라"; 
  }, [location.pathname]);

  return (
    // 기존 요청대로 border는 빼고, 살짝 투명한 글래스모피즘(backdrop-blur) 효과를 주어 스크롤 시 예쁘게 겹치게 함
    <header className="sticky top-0 flex w-full bg-white/90 backdrop-blur-md z-30 dark:bg-gray-900 transition-all">
      {/* 👉 justify-end를 justify-between으로 변경하여 좌/우를 나눔 */}
      <div className="flex items-center justify-between w-full h-[72px] px-4 md:px-6 2xl:px-10">
        
        {/* === 좌측: 동적 페이지 타이틀 영역 (밑줄 UI 적용) === */}
        <div className="flex items-center animate-fade-in-up">
          <div className="relative inline-block mt-2">
            {/* z-10을 주어 글자가 밑줄 위로 올라오게 합니다 */}
            <h1 className="text-[19px] md:text-[21px] font-black text-gray-900 tracking-tight px-1 pb-1 relative z-10">
              {pageTitle}
            </h1>
            {/* 👉 텍스트 바로 아래에 깔리는 연두색 밑줄 (홈 화면과 동일한 스타일) */}
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#91D148] rounded-full z-0"></div>
          </div>
        </div>

        {/* === 우측: 유저 드롭다운 메뉴 === */}
        <div className="flex items-center gap-3">
          <UserDropdown />
        </div>

      </div>
    </header>
  );
};

export default AppHeader;