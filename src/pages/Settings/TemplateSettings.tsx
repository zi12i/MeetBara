import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone"; 
import Toast from "../../components/common/Toast"; 
import { createPortal } from "react-dom";

// 데이터 타입 정의
interface Template {
  id: number;
  type: "default" | "custom";
  title: string;
  content: string;
  updatedAt: string;
}

interface SubAlarm {
  id: string;
  label: string;
  isEnabled: boolean;
}

interface ToolAlarm {
  id: string;
  toolName: string;
  isLinked: boolean; // ★ 연동 여부 상태 추가
  isMasterEnabled: boolean;
  icon: JSX.Element;
  subAlarms: SubAlarm[];
}

const TemplateSettings: React.FC = () => {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState<string | undefined>(undefined);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([
    { id: 1, type: "default", title: "주간 회의 기본 템플릿", content: "1. 지난주 업무 리뷰\n2. 금주 주요 목표\n3. 이슈 및 블로커\n4. 액션 아이템", updatedAt: "2026.04.15" },
    { id: 2, type: "custom", title: "아이디에이션(브레인스토밍)", content: "1. 논의 배경\n2. 아이디어 발산\n3. 아이디어 수렴 및 평가\n4. 넥스트 스텝", updatedAt: "2026.04.16" },
    { id: 3, type: "custom", title: "프로젝트 킥오프 미팅", content: "1. 프로젝트 배경 및 목표\n2. 주요 마일스톤\n3. R&R (역할 분담)\n4. 질의응답", updatedAt: "2026.04.17" },
  ]);

  // ★ 워크툴 알림 설정 데이터 (연동 여부 테스트를 위해 Slack과 Jira는 미연동 처리)
  const [alarms, setAlarms] = useState<ToolAlarm[]>([
    {
      id: "slack",
      toolName: "Slack",
      isLinked: false, // 미연동 테스트용
      isMasterEnabled: false,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522-2.52h-6.313z" fill="#E01E5A"/>
        </svg>
      ),
      subAlarms: [
        { id: "slack_sub_1", label: "회의 종료 시 자동 요약 알림", isEnabled: false },
        { id: "slack_sub_2", label: "액션 아이템 개별 멘션 알림", isEnabled: false }
      ]
    },
    {
      id: "notion",
      toolName: "Notion",
      isLinked: true, // 연동됨
      isMasterEnabled: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.14 6.72l12.44-3.41c.64-.17 1.15.17 1.15.77v14.16c0 .59-.51.94-1.15 1.11l-12.44 3.41c-.64.18-1.15-.17-1.15-.77V7.83c0-.59.51-.94 1.15-1.11zM6.43 18.1l8.52-2.34V6l-8.52 2.34v9.76zm1.75-8.32l4.94-1.35.04 6.84-4.98 1.37v-6.86z"/>
        </svg>
      ),
      subAlarms: [
        { id: "notion_sub_1", label: "회의록 자동 내보내기 알림", isEnabled: true },
        { id: "notion_sub_2", label: "내보내기 실패 시 알림", isEnabled: false }
      ]
    },
    {
      id: "jira",
      toolName: "Jira Software",
      isLinked: true, // 연동됨
      isMasterEnabled: false,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0052CC">
          <path d="M11.53 2c0 0-4.04 4.02-4.04 8.52 0 4.5 4.04 8.52 4.04 8.52s4.04-4.02 4.04-8.52c0-4.5-4.04-8.52-4.04-8.52zM2.5 7.17C1.12 7.17 0 8.28 0 9.67c0 1.38 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-1.39-1.12-2.5-2.5-2.5zm19 0c-1.38 0-2.5 1.12-2.5 2.5 0 1.39 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-1.39-1.12-2.5-2.5-2.5z"/>
        </svg>
      ),
      subAlarms: [
        { id: "jira_sub_1", label: "액션 아이템 이슈 생성 알림", isEnabled: false },
        { id: "jira_sub_2", label: "이슈 상태 변경 알림", isEnabled: false }
      ]
    }
  ]);

  useEffect(() => {
    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { 
        scenarioId: "profile_setting",
        customMessage: "원하는 템플릿을 선택하고 우측에서 편집해 보심시오 🐹📝"
      } 
    });
    window.dispatchEvent(event);
  }, []);

  const triggerToast = (msg: string, subMsg?: string) => {
    setToastMessage(msg);
    setToastSubMessage(subMsg);
    setIsToastVisible(true);
  };

  // ★ 일괄 ON/OFF 마스터 스위치 핸들러
  const toggleMasterAlarm = (toolId: string) => {
    setAlarms(prev => prev.map(tool => {
      if (tool.id === toolId) {
        // 미연동 방어 로직
        if (!tool.isLinked) {
          triggerToast("알림 설정 불가", "해당 워크툴 계정을 먼저 연동해 주세요. 🚫");
          return tool;
        }
        const newState = !tool.isMasterEnabled;
        // 마스터 상태 변경 시, 하위 서브 알람들도 모두 동일한 상태로 변경
        return { 
          ...tool, 
          isMasterEnabled: newState,
          subAlarms: tool.subAlarms.map(sub => ({ ...sub, isEnabled: newState }))
        };
      }
      return tool;
    }));
  };

  // ★ 개별 서브 스위치 핸들러
  const toggleSubAlarm = (toolId: string, subId: string) => {
    setAlarms(prev => prev.map(tool => {
      if (tool.id === toolId) {
        // 미연동 방어 로직
        if (!tool.isLinked) {
          triggerToast("알림 설정 불가", "해당 워크툴 계정을 먼저 연동해 주세요. 🚫");
          return tool;
        }
        
        const updatedSubs = tool.subAlarms.map(sub => 
          sub.id === subId ? { ...sub, isEnabled: !sub.isEnabled } : sub
        );
        
        // 서브 알림이 하나라도 켜져있으면 마스터 ON, 모두 꺼지면 마스터 OFF 처리
        const isAnySubEnabled = updatedSubs.some(sub => sub.isEnabled);

        return {
          ...tool,
          isMasterEnabled: isAnySubEnabled,
          subAlarms: updatedSubs
        };
      }
      return tool;
    }));
  };

  const confirmDelete = () => {
    if (deleteModalId !== null) {
      const templateToDelete = templates.find(t => t.id === deleteModalId);
      setTemplates(prev => prev.filter(t => t.id !== deleteModalId));
      if (selectedTemplateId === deleteModalId) setSelectedTemplateId(null); 
      triggerToast(`'${templateToDelete?.title}' 삭제 완료`, "템플릿이 성공적으로 삭제되었습니다.");
      setDeleteModalId(null);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <>
      <PageMeta title="일반 / 템플릿 설정" description="일반 설정 및 회의록 템플릿 관리" />
      <Toast message={toastMessage} subMessage={toastSubMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      {/* 템플릿 삭제 경고 모달 */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[999] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl animate-scale-up text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h3 className="text-[20px] font-black text-gray-900 mb-2">템플릿 삭제</h3>
            <p className="text-[14px] font-medium text-gray-500 mb-8 leading-relaxed">
              정말 <strong>{templates.find(t => t.id === deleteModalId)?.title}</strong> 템플릿을 삭제하시겠습니까?<br/>
              삭제된 템플릿은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalId(null)} className="flex-1 py-4 rounded-2xl text-[14px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
                취소
              </button>
              <button onClick={confirmDelete} className="flex-1 py-4 rounded-2xl text-[14px] font-black text-white bg-red-500 hover:bg-red-600 shadow-md transition-all">
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 컨테이너 (비율 2:3:5 적용) */}
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-[calc(100vh-120px)] overflow-y-auto no-scrollbar relative">
        <div className="flex flex-col lg:flex-row gap-6 h-full">

          {/* === 1. 좌측 영역 (20%): 일반 설정 === */}
          <div className="w-full lg:w-[20%] flex flex-col h-full gap-4">
            <h2 className="text-[20px] font-black text-gray-900 ml-2 flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-6 bg-[#91D148] rounded-full inline-block"></span>
              일반 설정
            </h2>

            <div className="flex-1 bg-[#F4F9ED] p-6 rounded-[28px] border border-[#91D148]/20 flex flex-col gap-8 shadow-sm overflow-y-auto no-scrollbar">
              
              {/* 섹션 1: 워크툴 알림 상세설정 */}
              <section>
                <h3 className="text-[14px] font-black text-gray-800 mb-3 ml-1">워크툴 알림 상세설정</h3>
                <div className="space-y-4">
                  {alarms.map((tool) => (
                    <div 
                      key={tool.id} 
                      // 미연동 시 전체 카드를 살짝 투명하게 처리하여 시각적 피드백 제공
                      className={`bg-white border border-[#E2F1D1] rounded-2xl shadow-sm transition-all overflow-hidden ${
                        !tool.isLinked ? 'opacity-60 hover:opacity-80 cursor-not-allowed' : 'hover:border-[#91D148]/50'
                      }`}
                    >
                      {/* 마스터 스위치 영역 */}
                      <div 
                        className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50 cursor-pointer"
                        onClick={() => toggleMasterAlarm(tool.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${!tool.isLinked ? 'bg-gray-100 border-gray-200 grayscale' : 'bg-white border-gray-200'}`}>
                            {tool.icon}
                          </div>
                          <p className="text-[13px] font-black text-gray-900">{tool.toolName}</p>
                          {!tool.isLinked && <span className="ml-1 text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">미연동</span>}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                          <input type="checkbox" className="sr-only peer" checked={tool.isMasterEnabled} readOnly />
                          <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${tool.isMasterEnabled ? 'bg-[#91D148]' : 'bg-gray-200'}`}></div>
                        </label>
                      </div>

                      {/* 세부 스위치 영역 */}
                      <div className={`p-4 space-y-3 transition-opacity ${tool.isMasterEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        {tool.subAlarms.map(sub => (
                          <div 
                            key={sub.id} 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSubAlarm(tool.id, sub.id)}
                          >
                            <span className="text-[12px] font-bold text-gray-600">{sub.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                              <input type="checkbox" className="sr-only peer" checked={sub.isEnabled} readOnly/>
                              <div className={`w-7 h-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${sub.isEnabled ? 'bg-[#91D148]' : 'bg-gray-200'}`}></div>
                            </label>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-[#E2F1D1]" />

              {/* 섹션 2: 디스플레이 설정 */}
              <section>
                <h3 className="text-[14px] font-black text-gray-800 mb-3 ml-1">디스플레이 설정</h3>
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between p-4 bg-white border border-[#E2F1D1] rounded-2xl shadow-sm cursor-pointer hover:border-[#91D148]/50 transition-colors"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                  >
                    <p className="text-[13px] font-black text-gray-900">다크 모드 적용</p>
                    <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                      <input type="checkbox" className="sr-only peer" checked={isDarkMode} readOnly />
                      <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                    </label>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* === 2. 중앙 영역 (30%): 템플릿 리스트 === */}
          <div className="w-full lg:w-[30%] flex flex-col h-full gap-4">
            <h2 className="text-[20px] font-black text-gray-900 ml-2 flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-6 bg-[#91D148] rounded-full inline-block"></span>
              템플릿 리스트
            </h2>

            <div className="flex-1 bg-[#F4F9ED] p-6 rounded-[28px] border border-[#91D148]/20 flex flex-col gap-6 shadow-sm overflow-hidden">
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                {templates.map(template => (
                  <div 
                    key={template.id} 
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                      selectedTemplateId === template.id 
                        ? "bg-white border-[#91D148] shadow-md ring-4 ring-[#91D148]/10" 
                        : "bg-white border-[#E2F1D1] hover:border-[#91D148]/50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                        selectedTemplateId === template.id ? "bg-[#F4F9ED] border-[#91D148]/30" : "bg-gray-50 border-gray-100"
                      }`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={template.type === "default" ? "#9CA3AF" : "#91D148"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          {template.type === "default" ? (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded shrink-0">기본</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#EAF2E2] text-[#91D148] text-[10px] font-black rounded shrink-0">사용자</span>
                          )}
                          <p className="text-[14px] font-black text-gray-900 truncate">{template.title}</p>
                        </div>
                        <p className="text-[11px] font-bold text-gray-400">업데이트 : {template.updatedAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedTemplateId(null)}
                className="w-full mt-auto py-4 border-2 border-dashed border-[#91D148]/50 rounded-2xl text-[#91D148] text-[14px] font-black bg-white hover:bg-[#F4F9ED] transition-colors flex justify-center items-center gap-2 shadow-sm shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                새 템플릿 만들기
              </button>

            </div>
          </div>

          {/* === 3. 우측 영역 (50%): 템플릿 에디터 === */}
          <div className="w-full lg:w-[50%] flex flex-col h-full gap-4">
            <h2 className="text-[20px] font-black text-gray-900 ml-2 flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-6 bg-[#91D148] rounded-full inline-block"></span>
              템플릿 상세 및 수정
            </h2>

            <div className="flex-1 bg-[#F4F9ED] p-8 rounded-[28px] border border-[#91D148]/20 flex flex-col shadow-sm overflow-hidden">
              
              {selectedTemplate ? (
                <div className="flex flex-col h-full animate-fade-in">
                  <div className="flex items-center justify-between mb-6 shrink-0">
                    <span className={`px-3 py-1.5 text-[12px] font-black rounded-lg ${selectedTemplate.type === 'default' ? 'bg-gray-200 text-gray-600' : 'bg-[#91D148] text-white'}`}>
                      {selectedTemplate.type === 'default' ? '기본 제공 템플릿' : '사용자 커스텀 템플릿'}
                    </span>
                    <span className="text-[12px] font-bold text-gray-400">마지막 수정: {selectedTemplate.updatedAt}</span>
                  </div>

                  <div className="space-y-5 flex-1 flex flex-col overflow-hidden">
                    <div className="shrink-0">
                      <label className="block text-[13px] font-bold text-gray-600 mb-2 ml-1">템플릿 제목</label>
                      <input 
                        type="text" 
                        defaultValue={selectedTemplate.title}
                        disabled={selectedTemplate.type === 'default'}
                        className="w-full bg-white border border-[#E2F1D1] rounded-xl px-4 py-3.5 font-bold text-gray-900 outline-none focus:border-[#91D148] shadow-sm transition-all text-[15px] disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                      <label className="block text-[13px] font-bold text-gray-600 mb-2 ml-1">상세 구조 및 내용</label>
                      <textarea 
                        defaultValue={selectedTemplate.content}
                        disabled={selectedTemplate.type === 'default'}
                        className="w-full flex-1 bg-white border border-[#E2F1D1] rounded-xl px-5 py-5 font-bold text-gray-700 outline-none focus:border-[#91D148] shadow-sm transition-all text-[14px] leading-relaxed resize-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-[#E2F1D1] shrink-0">
                    <button 
                      onClick={() => setDeleteModalId(selectedTemplate.id)}
                      disabled={selectedTemplate.type === "default"}
                      className={`flex-1 py-3.5 rounded-xl text-[14px] font-bold transition-all ${
                        selectedTemplate.type === "default" 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-white border border-red-200 text-red-500 hover:bg-red-50 shadow-sm"
                      }`}
                    >
                      삭제하기
                    </button>
                    <button 
                      onClick={() => triggerToast("저장 완료", "템플릿 내용이 수정되었습니다. 🐹")}
                      disabled={selectedTemplate.type === "default"}
                      className={`flex-1 py-3.5 rounded-xl text-[14px] font-black text-white transition-all shadow-md ${
                        selectedTemplate.type === "default"
                          ? "bg-gray-300 cursor-not-allowed shadow-none"
                          : "bg-[#91D148] hover:bg-[#82bd41]"
                      }`}
                    >
                      수정 저장
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in overflow-y-auto no-scrollbar">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-dashed border-[#91D148]/50 mb-4 shrink-0">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-[18px] font-black text-gray-800 mb-2">새로운 템플릿 작성</h3>
                  <p className="text-[14px] text-gray-500 font-medium">제목과 내용을 입력하고 저장해주세요.</p>
                  
                  <div className="w-full mt-8 space-y-4 text-left flex-1 flex flex-col min-h-0">
                    <input placeholder="템플릿 제목을 입력하세요" className="w-full bg-white border border-[#E2F1D1] rounded-xl px-4 py-3.5 font-bold text-gray-900 outline-none focus:border-[#91D148] shadow-sm text-[15px] shrink-0"/>
                    <textarea placeholder="어떤 구조로 회의를 진행할지 적어주세요." className="w-full flex-1 min-h-[150px] bg-white border border-[#E2F1D1] rounded-xl px-5 py-5 font-bold text-gray-700 outline-none focus:border-[#91D148] shadow-sm text-[14px] resize-none"/>
                    <button onClick={() => triggerToast("생성 완료", "새 템플릿이 추가되었습니다! 🐹✨")} className="w-full py-4 bg-[#91D148] text-white font-black rounded-xl shadow-md hover:bg-[#82bd41] transition-colors shrink-0">새 템플릿 저장하기</button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default TemplateSettings;