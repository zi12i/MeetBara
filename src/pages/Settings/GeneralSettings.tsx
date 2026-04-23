import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone"; 
import Toast from "../../components/common/Toast";
import { createPortal } from "react-dom";

// --- 아이콘 컴포넌트 ---
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const MonitorIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;

interface SubAlarm {
  id: string;
  label: string;
  isEnabled: boolean;
}

interface ToolAlarm {
  id: string;
  toolName: string;
  isLinked: boolean;
  icon: JSX.Element;
  subAlarms: SubAlarm[];
}

const GeneralSettings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  
  // 💡 모달 대신 텍스트 우측에 띄울 인라인 토스트 상태
  const [showInlineToast, setShowInlineToast] = useState(false);

  const [alarms, setAlarms] = useState<ToolAlarm[]>([
    {
      id: "notion", toolName: "Notion", isLinked: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.14 6.72l12.44-3.41c.64-.17 1.15.17 1.15.77v14.16c0 .59-.51.94-1.15 1.11l-12.44 3.41c-.64.18-1.15-.17-1.15-.77V7.83c0-.59.51-.94 1.15-1.11zM6.43 18.1l8.52-2.34V6l-8.52 2.34v9.76zm1.75-8.32l4.94-1.35.04 6.84-4.98 1.37v-6.86z"/>
        </svg>
      ),
      subAlarms: [
        { id: "notion_sub_1", label: "노션 전체 알림", isEnabled: true },
        { id: "notion_sub_2", label: "회의 일정 알림", isEnabled: true },
        { id: "notion_sub_3", label: "신규 회의 초대 알림", isEnabled: true },
        { id: "notion_sub_4", label: "신규 회의 승인 알림", isEnabled: true },
        { id: "notion_sub_5", label: "브리핑 카드 확인 알림", isEnabled: true }
      ]
    },
    {
      id: "slack", toolName: "slack", isLinked: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522-2.52h-6.313z" fill="#E01E5A"/>
        </svg>
      ),
      subAlarms: [
        { id: "slack_sub_1", label: "슬랙 전체 알림", isEnabled: true },
        { id: "slack_sub_2", label: "회의 일정 알림", isEnabled: true },
        { id: "slack_sub_3", label: "신규 회의 초대 알림", isEnabled: false },
        { id: "slack_sub_4", label: "신규 회의 승인 알림", isEnabled: false },
        { id: "slack_sub_5", label: "브리핑 카드 확인 알림", isEnabled: true }
      ]
    },
    {
      id: "jira", toolName: "Jira", isLinked: false, // Jira 미연동 상태
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0052CC">
          <path d="M11.53 2c0 0-4.04 4.02-4.04 8.52 0 4.5 4.04 8.52 4.04 8.52s4.04-4.02 4.04-8.52c0-4.5-4.04-8.52-4.04-8.52zM2.5 7.17C1.12 7.17 0 8.28 0 9.67c0 1.38 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-1.39-1.12-2.5-2.5-2.5zm19 0c-1.38 0-2.5 1.12-2.5 2.5 0 1.39 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-1.39-1.12-2.5-2.5-2.5z"/>
        </svg>
      ),
      subAlarms: [
        { id: "jira_sub_1", label: "지라 전체 알림", isEnabled: false },
        { id: "jira_sub_2", label: "회의 일정 알림", isEnabled: false },
        { id: "jira_sub_3", label: "신규 회의 초대 알림", isEnabled: false },
        { id: "jira_sub_4", label: "신규 회의 승인 알림", isEnabled: false },
        { id: "jira_sub_5", label: "브리핑 카드 확인 알림", isEnabled: false }
      ]
    }
  ]);

  useEffect(() => {
    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { scenarioId: "general_setting", customMessage: "알림 및 테마 환경을 쾌적하게 설정해 보세요 ⚙️" } 
    });
    window.dispatchEvent(event);
  }, []);

  // 메인 토스트 타이머
  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => setIsToastVisible(false), 3000); 
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  // 💡 인라인 토스트 자동 숨김 타이머 (4초)
  useEffect(() => {
    if (showInlineToast) {
      const timer = setTimeout(() => setShowInlineToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showInlineToast]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const handleToggleClick = (toolId: string, subId: string, isLinked: boolean) => {
    if (!isLinked) {
      // 💡 모달 대신 인라인 토스트 활성화
      setShowInlineToast(true);
      return;
    }
    
    setAlarms(prev => prev.map(tool => {
      if (tool.id === toolId) {
        const updatedSubs = tool.subAlarms.map(sub => 
          sub.id === subId ? { ...sub, isEnabled: !sub.isEnabled } : sub
        );
        return { ...tool, subAlarms: updatedSubs };
      }
      return tool;
    }));
  };

  return (
    <>
      <PageMeta title="일반 설정" description="플랫폼 연동 및 인터페이스 설정" />
      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      {/* 최상단 래퍼 */}
      <div className="absolute inset-0 p-4 md:p-6 overflow-hidden bg-transparent">
        <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-6 md:gap-8">
          
          {/* === 좌측: 알림 설정 패널 === */}
          <div className="flex-[3] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            {/* 💡 헤더 영역: 텍스트 우측 빈 공간에 인라인 토스트 배치 */}
            <div className="p-8 pb-6 border-b border-gray-100 shrink-0 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-black text-gray-900 flex items-center gap-2.5">
                  <span className="text-[#3b82f6]"><BellIcon /></span> 알림 설정
                </h2>
                <p className="text-[13px] font-medium text-gray-500 mt-2">연동된 외부 툴의 알림 수신 여부를 개별적으로 설정할 수 있습니다.</p>
              </div>

              {/* 💡 인라인 토스트 애니메이션 및 UI */}
              <div className={`transition-all duration-300 transform ${showInlineToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                <div className="bg-gray-800 text-white px-5 py-3 rounded-xl flex items-center gap-4 shadow-md border border-gray-700">
                  <span className="text-[13px] font-medium">계정 연동 후 설정 가능합니다.</span>
                  <div className="w-px h-4 bg-gray-600"></div>
                  <button 
                    onClick={() => {
                      setShowInlineToast(false);
                      showToast("현재 계정 연동 기능은 준비 중입니다.");
                    }}
                    className="text-[13px] font-black text-[#A5D275] hover:text-[#91D148] transition-colors"
                  >
                    연동하기
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6 md:p-8 bg-gray-50/30 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                {alarms.map((tool) => (
                  <div key={tool.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col transition-colors group ${!tool.isLinked && showInlineToast ? 'border-gray-300 bg-gray-50/50' : 'border-gray-200 hover:border-[#91D148]/50'}`}>
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-5">
                      <div className="flex items-center gap-2.5">
                        {tool.icon}
                        <span className={`text-[17px] font-black ${tool.isLinked ? 'text-gray-900' : 'text-gray-500'}`}>
                          {tool.toolName.charAt(0).toUpperCase() + tool.toolName.slice(1)}
                        </span>
                      </div>
                      
                      {tool.isLinked ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold text-[#91D148] bg-[#F4F9ED] rounded-md border border-[#91D148]/30">
                          연동 완료
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 rounded-md">
                          연동 필요
                        </span>
                      )}
                    </div>

                    <div className="space-y-4 flex-1">
                      {tool.subAlarms.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between">
                          <span className={`text-[13px] font-bold transition-colors ${tool.isLinked ? 'text-gray-700' : 'text-gray-400'}`}>
                            {sub.label}
                          </span>
                          
                          <div 
                            className="relative inline-flex items-center cursor-pointer"
                            onClick={() => handleToggleClick(tool.id, sub.id, tool.isLinked)}
                          >
                            <div className={`w-11 h-6 rounded-full transition-all relative ${
                              !tool.isLinked ? 'bg-gray-200 opacity-50' : 
                              sub.isEnabled ? 'bg-[#91D148]' : 'bg-gray-200'
                            }`}>
                              <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform shadow-sm ${
                                sub.isEnabled && tool.isLinked ? 'translate-x-full border-white' : ''
                              }`}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === 우측: 인터페이스 설정 패널 === */}
          <div className="flex-[1] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-8 pb-6 border-b border-gray-100 shrink-0 bg-white">
              <h2 className="text-[20px] font-black text-gray-900 flex items-center gap-2.5">
                <span className="text-[#ff6b6b]"><MonitorIcon /></span> 인터페이스
              </h2>
              <p className="text-[13px] font-medium text-gray-500 mt-2">서비스의 시각적 테마를 설정합니다.</p>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/30 flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:border-[#91D148]/50 transition-colors cursor-pointer" onClick={() => setIsDarkMode(!isDarkMode)}>
                <div>
                  <span className="text-[15px] font-black text-gray-900 block mb-1">라이트 모드 UI</span>
                  <span className="text-[12px] font-medium text-gray-500">기본 밝은 테마를 사용합니다.</span>
                </div>
                
                <label className="relative inline-flex items-center pointer-events-none">
                  <input type="checkbox" className="sr-only peer" checked={!isDarkMode} readOnly />
                  <div className={`w-12 h-6 rounded-full transition-all relative ${!isDarkMode ? 'bg-[#91D148]' : 'bg-gray-200'}`}>
                    <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform shadow-sm ${!isDarkMode ? 'translate-x-[24px] border-white' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D6E8C3; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #91D148; }
      `}</style>
    </>
  );
};

export default GeneralSettings;