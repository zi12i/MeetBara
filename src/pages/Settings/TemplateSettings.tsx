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
  description: string;
  aiFormat: string;
  actionItem: string;
  sensitivity: "low" | "medium" | "high";
  content: string;
}

interface SubAlarm {
  id: string;
  label: string;
  isEnabled: boolean;
}

interface ToolAlarm {
  id: string;
  toolName: string;
  isLinked: boolean;
  isMasterEnabled: boolean;
  icon: JSX.Element;
  subAlarms: SubAlarm[];
}

const TemplateSettings: React.FC = () => {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState<string | undefined>(undefined);
  
  // 모달 상태 관리 (삭제만 모달 사용)
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  
  // 템플릿 선택 및 기본 템플릿 상태 관리
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(3);
  const [defaultTemplateId, setDefaultTemplateId] = useState<number>(3); 
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([
    { 
      id: 1, type: "default", title: "회의록 템플릿", description: "기본 회의록 템플릿입니다.", aiFormat: "서술형 줄글", actionItem: "기본 할당", sensitivity: "medium", content: "기본 내용" 
    },
    { 
      id: 2, type: "custom", title: "성과보고서 템플릿", description: "월간/분기 성과 보고용", aiFormat: "개조식 요약", actionItem: "부서별 배정", sensitivity: "high", content: "성과 내용" 
    },
    { 
      id: 3, type: "custom", title: "주간회의 템플릿", description: "팀원들의 한 주간 업무 진행 상황을 공유하고, 협업이 필요한 이슈 해결이 중점인 정기 회의 템플릿", aiFormat: "회의 종료 후 출력되는 문서의 양식을 적어주세요 (서술형 줄글, KPT 회고 등)", actionItem: "유관 부서 담당자 배정 및 우선 순위 설정 필요", sensitivity: "medium", 
      content: "회의 개요\n□ 회의 개요에 대해 먼저 설명합니다 (회의 주제, 배경, 목표, 주요 시간, 안건)\n• 회의 주제 : \n• 회의 진행배경 :\n• 회의 목표 :\n• 회의 안건 (목표시간 : 00분)\n  ◦ (논의/결정) A사항입니다 (00분) - 이 부분을 지우고 기재\n  ◦ (아이디어) C사항입니다 (00분) - 이 부분을 지우고 기재\n  ◦ (공유) D사항입니다 (00분) - 이 부분을 지우고 기재\n• 회의 회고 (5분) - 회고를 5분씩 진행해보세요.\n\n회의 사전 준비사항/숙지사항\n• (링크)\n\n회의 내용\n회의 전에 미리 차기 의견 적어놓기 (논의/결정vs공유, 해당 부분 작성자 닉네임, 예상 소요시간 표기)\n\n논의/결정사항\n• (닉네임) 논의/결정사항 (00분) → 실제 00분 소요\n\n공유사항\n• (닉네임) A의견에 대해 사전에 기록 (00분) → 실제 00분 소요\n\n회의 결과\n의사결정\n• A시안 → 결정내용\n• B시안 → 결정내용\n• C시안 → 결정내용\n\nAction Items\n□ 모든 액션아이템에 담당자와 납기를 설정하였나요?\n□ 액션 아이템 설명 @담당자 ~07/00 (요일)" 
    },
    { 
      id: 4, type: "custom", title: "미팅 템플릿", description: "외부 클라이언트 미팅용", aiFormat: "결정 사항 위주 요약", actionItem: "내부 담당자 지정", sensitivity: "medium", content: "미팅 내용" 
    },
  ]);

  // 우측 폼 상태
  const [formData, setFormData] = useState<Omit<Template, 'id' | 'type'>>({
    title: "", description: "", aiFormat: "", actionItem: "", sensitivity: "medium", content: ""
  });

  const [alarms, setAlarms] = useState<ToolAlarm[]>([
    {
      id: "notion", toolName: "Notion", isLinked: true, isMasterEnabled: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
      id: "slack", toolName: "slack", isLinked: true, isMasterEnabled: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522-2.52h-6.313z" fill="#E01E5A"/>
        </svg>
      ),
      subAlarms: [
        { id: "slack_sub_1", label: "노션 전체 알림", isEnabled: true },
        { id: "slack_sub_2", label: "회의 일정 알림", isEnabled: true },
        { id: "slack_sub_3", label: "신규 회의 초대 알림", isEnabled: false },
        { id: "slack_sub_4", label: "신규 회의 승인 알림", isEnabled: false },
        { id: "slack_sub_5", label: "브리핑 카드 확인 알림", isEnabled: true }
      ]
    },
    {
      id: "jira", toolName: "Jira", isLinked: true, isMasterEnabled: false,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0052CC">
          <path d="M11.53 2c0 0-4.04 4.02-4.04 8.52 0 4.5 4.04 8.52 4.04 8.52s4.04-4.02 4.04-8.52c0-4.5-4.04-8.52-4.04-8.52zM2.5 7.17C1.12 7.17 0 8.28 0 9.67c0 1.38 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-1.39-1.12-2.5-2.5-2.5zm19 0c-1.38 0-2.5 1.12-2.5 2.5 0 1.39 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-1.39-1.12-2.5-2.5-2.5z"/>
        </svg>
      ),
      subAlarms: [
        { id: "jira_sub_1", label: "노션 전체 알림", isEnabled: false },
        { id: "jira_sub_2", label: "회의 일정 알림", isEnabled: false },
        { id: "jira_sub_3", label: "신규 회의 초대 알림", isEnabled: false },
        { id: "jira_sub_4", label: "신규 회의 승인 알림", isEnabled: false },
        { id: "jira_sub_5", label: "브리핑 카드 확인 알림", isEnabled: false }
      ]
    }
  ]);

  // 선택된 템플릿 변경 시 우측 폼에 데이터 반영
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setFormData({
          title: template.title,
          description: template.description,
          aiFormat: template.aiFormat,
          actionItem: template.actionItem,
          sensitivity: template.sensitivity,
          content: template.content
        });
      }
    } else {
      setFormData({ title: "", description: "", aiFormat: "", actionItem: "", sensitivity: "medium", content: "" });
    }
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { scenarioId: "profile_setting", customMessage: "원하는 템플릿을 선택하고 우측에서 편집해 보심시오 🐹📝" } 
    });
    window.dispatchEvent(event);
  }, []);

  // 토스트 타이머
  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => setIsToastVisible(false), 3000); 
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  const showToast = (message: string, subMessage?: string) => {
    setToastMessage(message);
    setToastSubMessage(subMessage || "");
    setIsToastVisible(true);
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSubAlarm = (toolId: string, subId: string) => {
    setAlarms(prev => prev.map(tool => {
      if (tool.id === toolId) {
        if (!tool.isLinked) return tool;
        const updatedSubs = tool.subAlarms.map(sub => sub.id === subId ? { ...sub, isEnabled: !sub.isEnabled } : sub);
        return { ...tool, subAlarms: updatedSubs };
      }
      return tool;
    }));
  };

  const confirmDelete = () => {
    if (deleteModalId !== null) {
      setTemplates(prev => prev.filter(t => t.id !== deleteModalId));
      if (selectedTemplateId === deleteModalId) setSelectedTemplateId(null); 
      if (defaultTemplateId === deleteModalId) setDefaultTemplateId(-1); 
      setDeleteModalId(null);
      showToast("템플릿이 삭제되었습니다.");
    }
  };

  const saveTemplate = () => {
    if (selectedTemplateId) {
      setTemplates(prev => prev.map(t => t.id === selectedTemplateId ? { ...t, ...formData } : t));
      showToast("정상적으로 템플릿이 수정되었습니다.");
    } else {
      const newId = Date.now();
      const newTemplate: Template = {
        id: newId,
        type: "custom",
        ...formData
      };
      if(!newTemplate.title.trim()) newTemplate.title = "새 템플릿";
      
      setTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplateId(newId);
      showToast("정상적으로 템플릿이 등록되었습니다.");
    }
  };

  const handleSetDefault = () => {
    if (selectedTemplateId) {
      setDefaultTemplateId(selectedTemplateId);
      showToast("기본 템플릿으로 지정되었습니다.");
    }
  };

  const getSensitivityDescription = (sens: string) => {
    switch(sens) {
      case "low": return "아이디에이션 회의처럼 주제 상관없이 자유로운 발언이 필요한 경우입니다.";
      case "high": return "정확한 안건 중심의 회의로, 주제 이탈을 엄격하게 감지합니다.";
      default: return "모든 상황에 쓰기 좋은 민감도입니다.";
    }
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.id === defaultTemplateId) return -1;
    if (b.id === defaultTemplateId) return 1;
    return a.id - b.id; 
  });

  return (
    <>
      <PageMeta title="일반 / 템플릿 설정" description="일반 설정 및 회의록 템플릿 관리" />
      <Toast message={toastMessage} subMessage={toastSubMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      {/* 템플릿 삭제 모달 (이건 유지) */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[999] bg-gray-900/40 flex items-center justify-center p-4">
          <div className="bg-white w-[400px] rounded-xl py-12 px-8 shadow-2xl flex flex-col items-center relative">
            <p className="text-[16px] font-medium text-gray-800 text-center mb-1">
              삭제된 템플릿은 복구할 수 없습니다.
            </p>
            <p className="text-[16px] font-medium text-gray-800 text-center mb-8">
              정말 삭제하시겠습니까?
            </p>
            <button 
              onClick={confirmDelete} 
              className="px-12 py-3 rounded text-[14px] font-bold text-white bg-[#91D148] hover:bg-[#82bd41] transition-colors"
            >
              삭제하기
            </button>
            <button onClick={() => setDeleteModalId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      )}

      {/* 최상단 래퍼 */}
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-[calc(100vh-120px)] flex flex-col overflow-hidden">
        
        <div className="flex gap-8 flex-1 min-h-0 h-full">

          {/* === 1. 좌측 영역: 일반 설정 === */}
          <div className="w-[300px] flex flex-col shrink-0 min-h-0 h-full">
            <h2 className="text-[16px] font-bold text-gray-900 mb-4 shrink-0">일반 설정</h2>
            <div className="flex-1 bg-[#F3FAEB] border border-[#E2EBD5] rounded-lg p-6 overflow-y-auto no-scrollbar shadow-sm min-h-0">
              
              <h3 className="text-[14px] font-bold text-gray-800 mb-4">알림 설정</h3>
              <div className="bg-white rounded-lg p-4 border border-[#E2EBD5] space-y-6">
                {alarms.map((tool) => (
                  <div key={tool.id} className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      {tool.icon}
                      <span className="text-[16px] font-bold text-gray-900">
                        {tool.toolName.charAt(0).toUpperCase() + tool.toolName.slice(1)}
                      </span>
                    </div>
                    {tool.subAlarms.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600">{sub.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={sub.isEnabled} onChange={() => toggleSubAlarm(tool.id, sub.id)} />
                          <div className={`w-8 h-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${sub.isEnabled ? 'bg-[#91D148]' : 'bg-gray-200'}`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <h3 className="text-[14px] font-bold text-gray-800 mt-6 mb-4">인터페이스 설정</h3>
              <div className="bg-white rounded-lg p-4 border border-[#E2EBD5] flex items-center justify-between">
                <span className="text-[13px] text-gray-600">라이트 모드 UI</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                  <div className={`w-8 h-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${!isDarkMode ? 'bg-[#91D148]' : 'bg-gray-200'}`}></div>
                </label>
              </div>

            </div>
          </div>

          {/* === 2. 중앙 영역: 템플릿 목록 === */}
          <div className="w-[300px] flex flex-col shrink-0 min-h-0 h-full">
            <h2 className="text-[16px] font-bold text-gray-900 mb-4 border-l-2 border-[#D1D1D6] pl-2 shrink-0">템플릿 설정</h2>
            <div className="flex-1 bg-white border-2 border-[#D1D1D6] rounded-lg p-4 flex flex-col overflow-hidden min-h-0">
              <h3 className="text-[15px] font-bold text-gray-800 mb-4 shrink-0">템플릿 목록</h3>
              
              <button 
                onClick={() => setSelectedTemplateId(null)}
                className="w-full flex items-center justify-between px-3 py-3 border border-[#91D148] text-[#91D148] rounded mb-4 hover:bg-[#F9FCF5] transition-colors shrink-0"
              >
                <span className="text-[13px] font-bold">사용자 지정 템플릿 추가하기</span>
                <span className="text-lg leading-none">+</span>
              </button>

              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar min-h-0">
                {sortedTemplates.map(template => (
                  <div 
                    key={template.id} 
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`flex items-center justify-between px-3 py-3 rounded border cursor-pointer ${
                      selectedTemplateId === template.id ? "border-[#91D148] bg-[#F9FCF5]" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`text-[13px] truncate ${selectedTemplateId === template.id ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                        {template.title}
                      </span>
                      {template.id === defaultTemplateId && (
                        <span className="shrink-0 text-[10px] font-bold text-[#91D148] bg-white border border-[#91D148] px-1.5 py-0.5 rounded">
                          기본 템플릿
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedTemplateId === template.id && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#91D148" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setDeleteModalId(template.id); }} className="text-gray-300 hover:text-red-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === 3. 우측 영역: 사용자 지정 템플릿 에디터 === */}
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
            <h2 className="text-[16px] font-bold text-gray-900 mb-4 shrink-0">
              {selectedTemplateId ? "사용자 지정 템플릿 수정" : "새 사용자 지정 템플릿"}
            </h2>
            
            <div className="flex-1 flex flex-col bg-[#F3FAEB] rounded-lg p-6 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-5 min-h-0">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[13px] font-bold text-gray-700">템플릿 이름</label>
                    <div className="flex gap-2 items-center">
                      <span className="text-[11px] text-gray-400 border border-gray-200 bg-white px-2 py-1 rounded hidden lg:inline-block">템플릿 작성에 참고할 문서 양식을 첨부해주세요</span>
                      <button className="text-[12px] bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">첨부파일</button>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="해당 사용자 템플릿의 이름을 적어주세요"
                    className="w-full text-[13px] border border-gray-200 rounded p-2.5 outline-none focus:border-[#91D148]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">템플릿 설명</label>
                  <input 
                    type="text" 
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="해당 사용자 템플릿의 설명을 적어주세요"
                    className="w-full text-[13px] border border-gray-200 rounded p-2.5 outline-none focus:border-[#91D148]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">AI 요약 포맷</label>
                  <input 
                    type="text" 
                    value={formData.aiFormat}
                    onChange={(e) => handleFormChange('aiFormat', e.target.value)}
                    placeholder="회의 종료 후 출력되는 문서의 양식을 적어주세요 (서술형 줄글, KPT 회고 등)"
                    className="w-full text-[13px] border border-gray-200 rounded p-2.5 outline-none focus:border-[#91D148]"
                  />
                </div>

                {/* 액션 아이템 textarea로 변경 및 줄 수(rows=3) 지정, placeholder 변경 */}
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">액션 아이템</label>
                  <textarea 
                    value={formData.actionItem}
                    onChange={(e) => handleFormChange('actionItem', e.target.value)}
                    placeholder="즉시 실행 가능한 구체적인 작업 항목 (김철수 대리가 4월 25일까지(When) A 프로젝트 홍보 자료(What)를 수정하여 팀장님께 보고(Action)한다)"
                    rows={3}
                    className="w-full text-[13px] border border-gray-200 rounded p-2.5 outline-none focus:border-[#91D148] resize-none"
                  />
                </div>

                <div className="flex justify-between items-start pt-2">
                  <label className="block text-[13px] font-bold text-gray-700">이탈 감지 민감도</label>
                  <div className="flex flex-col items-end">
                    <div className="flex gap-2">
                      {["low", "medium", "high"].map((level) => {
                        const labels = { low: "낮음", medium: "보통", high: "높음" };
                        const isSelected = formData.sensitivity === level;
                        return (
                          <button
                            key={level}
                            onClick={() => handleFormChange('sensitivity', level)}
                            // 선택된 버튼 색상을 #91D148로 변경
                            className={`w-[60px] py-1 text-[12px] rounded transition-colors ${isSelected ? 'bg-[#91D148] text-white font-bold' : 'bg-white border border-gray-200 text-gray-600'}`}
                          >
                            {labels[level as keyof typeof labels]}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 text-right">{getSensitivityDescription(formData.sensitivity)}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col shrink-0 h-[350px]">
                  <div className="mb-2 shrink-0">
                    <label className="block text-[14px] font-bold text-gray-800">템플릿 출력 예시</label>
                    <p className="text-[12px] text-gray-500 mt-1">템플릿의 예시 출력 화면입니다.</p>
                  </div>
                  <textarea 
                    value={formData.content}
                    onChange={(e) => handleFormChange('content', e.target.value)}
                    className="w-full flex-1 border border-gray-200 rounded p-4 text-[13px] leading-relaxed outline-none focus:border-[#91D148] resize-none"
                    placeholder="회의 양식을 입력하세요."
                  />
                </div>
              </div>

              {/* 하단 고정 버튼 영역 */}
              <div className="shrink-0 flex justify-between bg-[#F3FAEB] pt-4 mt-2">
                <button 
                  onClick={handleSetDefault}
                  disabled={selectedTemplateId === defaultTemplateId || selectedTemplateId === null}
                  className={`px-6 py-2 border text-[13px] rounded transition-colors ${
                    selectedTemplateId === defaultTemplateId
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {selectedTemplateId === defaultTemplateId ? "현재 기본 템플릿" : "기본 템플릿으로 지정하기"}
                </button>
                
                <button 
                  onClick={saveTemplate}
                  // 버튼 색상 #91D148 적용
                  className="px-8 py-2 bg-[#91D148] text-white font-bold text-[13px] rounded hover:bg-[#82bd41] shadow-sm transition-colors"
                >
                  {selectedTemplateId ? "템플릿 수정하기" : "템플릿 등록하기"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default TemplateSettings;