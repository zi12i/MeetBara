import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

// 임시 데이터 타입
interface MeetingAgenda {
  id: number;
  title: string;
  status: "pending" | "done";
  category: string;
}

const Status: React.FC = () => {
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState("unresolved"); // 미결정 안건, 안건 숙지 현황, 업무 이행 현황
  
  // 임시 데이터
  const unresolvedAgendas: MeetingAgenda[] = [
    { id: 1, title: "신규 프로젝트 UI/UX 개선안 확정", status: "pending", category: "디자인" },
    { id: 2, title: "알림센터 통합 구조 설계 합의", status: "pending", category: "개발" },
  ];

  return (
    <>
      <PageMeta title="진행 현황 | 회의바라" description="회의 진행 현황 및 안건 관리" />

      {/* 전체 컨테이너: 헤더 높이를 뺀 나머지 공간 활용 */}
      <div className="flex gap-6 h-[calc(100vh-140px)] bg-white overflow-hidden animate-fade-in">
        
        {/* === 좌측 패널: 리스트 및 탭 영역 === */}
        <div className="w-full lg:w-[480px] flex flex-col border border-gray-100 rounded-[32px] bg-white shadow-sm overflow-hidden">
          
          {/* 탭 상단 영역 */}
          <div className="flex border-b border-gray-50 bg-gray-50/30">
            {[
              { id: "unresolved", label: "미결정 안건" },
              { id: "familiarity", label: "안건 숙지 현황" },
              { id: "task", label: "업무 이행 현황" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-5 text-[15px] font-black transition-all relative ${
                  activeTab === tab.id ? "text-gray-900 bg-white" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#91D148]"></div>
                )}
              </button>
            ))}
          </div>

          {/* 리스트 본문 영역 */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-4">
            {activeTab === "unresolved" ? (
              unresolvedAgendas.map((item) => (
                <div 
                  key={item.id} 
                  className="p-5 border-l-4 border-[#91D148] bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-[#F4F9ED] text-[#91D148] text-[11px] font-bold rounded-md">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-[16px] font-bold text-gray-800 group-hover:text-[#91D148] transition-colors">
                    {item.title}
                  </h4>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
                <span className="text-4xl mb-4">📝</span>
                <p className="font-bold">선택한 탭의 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* === 우측 패널: 상세 내용 영역 === */}
        <div className="flex-1 border border-gray-100 rounded-[32px] bg-[#F4F9ED]/30 p-8 overflow-hidden relative">
          {/* 상세 내용이 없을 때의 가이드 (Empty State) */}
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-[#91D148]/10 text-4xl">
              🔍
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">
              안건을 선택하여 상세 현황을 확인하세요
            </h3>
            <p className="text-gray-500 font-medium max-w-xs leading-relaxed">
              좌측 리스트에서 진행 현황을 확인하고 싶은 <br /> 
              회의 안건 또는 업무를 클릭해 주세요.
            </p>
          </div>
          
          {/* 배경 데코레이션 요소 */}
          <div className="absolute top-10 right-10 opacity-5">
             <img src="/images/logo/logo-icon.svg" alt="" className="w-64 h-64" />
          </div>
        </div>

      </div>
    </>
  );
};

export default Status;