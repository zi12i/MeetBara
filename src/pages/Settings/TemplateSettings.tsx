import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone"; 
import Toast from "../../components/common/Toast"; 
import { createPortal } from "react-dom";

// 💡 OpenAI API 키 (시연용 하드코딩 - 실서비스 배포 시 백엔드로 이관 필요)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
// --- SVG Icons ---
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const SparklesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

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

const TemplateSettings: React.FC = () => {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState<string | undefined>(undefined);
  
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(3);
  const [defaultTemplateId, setDefaultTemplateId] = useState<number>(3); 
  const [isGenerating, setIsGenerating] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([
    { id: 1, type: "default", title: "회의록 템플릿", description: "기본 회의록 템플릿입니다.", aiFormat: "서술형 줄글", actionItem: "기본 할당", sensitivity: "medium", content: "기본 내용" },
    { id: 2, type: "custom", title: "성과보고서 템플릿", description: "월간/분기 성과 보고용", aiFormat: "개조식 요약", actionItem: "부서별 배정", sensitivity: "high", content: "성과 내용" },
    { id: 3, type: "custom", title: "주간회의 템플릿", description: "한 주의 업무 상황을 공유하는 정기 회의", aiFormat: "회의 종료 후 출력되는 문서의 양식을 적어주세요", actionItem: "유관 부서 담당자 배정 필요", sensitivity: "medium", 
      content: "회의 개요\n□ 회의 개요에 대해 먼저 설명합니다 (회의 주제, 배경, 목표, 주요 시간, 안건)\n• 회의 주제 : \n• 회의 진행배경 :\n• 회의 목표 :\n• 회의 안건 (목표시간 : 00분)\n  ◦ (논의/결정) A사항입니다 (00분)\n  ◦ (공유) D사항입니다 (00분)\n• 회의 회고 (5분)\n\n회의 내용\n회의 전에 미리 차기 의견 적어놓기\n\nAction Items\n□ 모든 액션아이템에 담당자와 납기를 설정하였나요?\n□ 액션 아이템 설명 @담당자 ~07/00 (요일)" 
    },
    { id: 4, type: "custom", title: "미팅 템플릿", description: "외부 클라이언트 미팅용", aiFormat: "결정 사항 위주 요약", actionItem: "내부 담당자 지정", sensitivity: "medium", content: "미팅 내용" },
  ]);

  const [formData, setFormData] = useState<Omit<Template, 'id' | 'type'>>({
    title: "", description: "", aiFormat: "", actionItem: "", sensitivity: "medium", content: ""
  });

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setFormData({
          title: template.title, description: template.description, aiFormat: template.aiFormat,
          actionItem: template.actionItem, sensitivity: template.sensitivity, content: template.content
        });
      }
    } else {
      setFormData({ title: "", description: "", aiFormat: "", actionItem: "", sensitivity: "medium", content: "" });
    }
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { scenarioId: "template_setting", customMessage: "우측 패널에서 템플릿을 수정하고, AI 결과물을 바로 확인해보세요! 🐹✨" } 
    });
    window.dispatchEvent(event);
  }, []);

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => setIsToastVisible(false), 3000); 
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  const showToast = (message: string, subMessage?: string) => {
    setToastMessage(message); setToastSubMessage(subMessage || ""); setIsToastVisible(true);
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIPreview = async () => {
    if (!formData.title.trim()) { showToast("미리보기를 생성하려면 템플릿 이름을 먼저 작성해주세요."); return; }
    
    setIsGenerating(true);
    handleFormChange("content", "✨ AI가 템플릿 출력 예시를 생성 중입니다...\n잠시만 기다려주세요.");

    try {
      const promptContext = `
        사용자가 새로운 회의록 템플릿을 설정하고 있습니다. 아래의 설정값들을 반영하여, 실제 회의가 끝난 후 AI가 작성해줄 법한 "회의록 결과물 예시"를 마크다운 형식으로 1개만 작성해주세요.
        [설정값]
        - 템플릿 이름: ${formData.title}
        - 템플릿 설명: ${formData.description || "없음"}
        - AI 요약 포맷: ${formData.aiFormat || "일반적인 회의록 형식"}
        - 액션 아이템 지침: ${formData.actionItem || "담당자 및 기한 명시"}
        - 주제 이탈 감지 민감도: ${formData.sensitivity}
      `;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "당신은 전문적인 비즈니스 회의록 템플릿 작성 전문가입니다." },
            { role: "user", content: promptContext }
          ],
          temperature: 0.7, max_tokens: 1000
        })
      });

      if (!response.ok) throw new Error("API 요청 실패");
      const data = await response.json();
      handleFormChange("content", data.choices[0].message.content);
    } catch (error) {
      console.error("AI Generation Error:", error);
      handleFormChange("content", "생성 중 오류가 발생했습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDelete = () => {
    if (deleteModalId !== null) {
      setTemplates(prev => prev.filter(t => t.id !== deleteModalId));
      if (selectedTemplateId === deleteModalId) setSelectedTemplateId(null); 
      if (defaultTemplateId === deleteModalId) setDefaultTemplateId(-1); 
      setDeleteModalId(null); showToast("템플릿이 삭제되었습니다.");
    }
  };

  const saveTemplate = () => {
    if (!formData.title.trim()) { showToast("템플릿 이름을 작성해주세요."); return; }
    if (selectedTemplateId) {
      setTemplates(prev => prev.map(t => t.id === selectedTemplateId ? { ...t, ...formData } : t));
      showToast("정상적으로 템플릿이 수정되었습니다.");
    } else {
      const newId = Date.now();
      setTemplates(prev => [...prev, { id: newId, type: "custom", ...formData }]);
      setSelectedTemplateId(newId); showToast("정상적으로 템플릿이 등록되었습니다.");
    }
  };

  const handleSetDefault = () => {
    if (selectedTemplateId) { setDefaultTemplateId(selectedTemplateId); showToast("기본 템플릿으로 지정되었습니다."); }
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.id === defaultTemplateId) return -1;
    if (b.id === defaultTemplateId) return 1;
    return a.id - b.id; 
  });
  console.log("현재 불러온 api 키:", OPENAI_API_KEY);
  return (
    <>
      <PageMeta title="템플릿 설정" description="회의록 템플릿 관리" />
      <Toast message={toastMessage} subMessage={toastSubMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      {/* 삭제 모달 */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[10000] bg-gray-900/40 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-[400px] rounded-3xl p-8 shadow-2xl flex flex-col items-center relative animate-zoom-in border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm font-black text-2xl">!</div>
            <p className="text-[18px] font-black text-gray-900 mb-2">정말 삭제하시겠습니까?</p>
            <p className="text-[14px] font-medium text-gray-500 text-center mb-8">삭제된 템플릿은 복구할 수 없습니다.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setDeleteModalId(null)} className="flex-1 py-3.5 rounded-xl text-[14px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={confirmDelete} className="flex-1 py-3.5 rounded-xl text-[14px] font-black text-white bg-red-500 hover:bg-red-600 shadow-md transition-all">삭제하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 최상단 래퍼 */}
      <div className="absolute inset-0 p-4 md:p-6 overflow-hidden bg-transparent">
        <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">

          {/* === 1. 좌측 영역: 템플릿 목록 === */}
          <aside className="w-full lg:w-[340px] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 shrink-0 bg-white min-h-[84px] flex items-center justify-between">
              <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2">
                <span className="text-gray-400"><ListIcon /></span> 템플릿 목록
              </h2>
              <button 
                onClick={() => { setSelectedTemplateId(null); setFormData({ title: "", description: "", aiFormat: "", actionItem: "", sensitivity: "medium", content: "" }); }}
                className="w-10 h-10 flex items-center justify-center bg-[#F4F9ED] text-[#91D148] rounded-xl hover:bg-[#91D148] hover:text-white transition-all shadow-sm"
                title="새 템플릿 추가"
              >
                <PlusIcon />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-gray-50/20 pb-10">
              {sortedTemplates.map(template => (
                <div 
                  key={template.id} 
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`group p-5 rounded-[20px] cursor-pointer border-2 transition-all flex flex-col gap-2 ${
                    selectedTemplateId === template.id ? "bg-white border-[#91D148] shadow-sm scale-[1.01]" : "bg-white border-transparent shadow-sm hover:border-gray-200"
                  }`}
                  style={{ borderLeft: selectedTemplateId === template.id ? '6px solid #91D148' : '6px solid #E2EBD5' }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`font-black text-[15px] truncate pr-4 ${selectedTemplateId === template.id ? 'text-gray-900' : 'text-gray-700'}`}>
                      {template.title}
                    </h3>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteModalId(template.id); }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TrashIcon />
                    </button>
                  </div>
                  <p className="text-[12px] text-gray-400 font-bold truncate">{template.description || "설명 없음"}</p>
                  
                  {template.id === defaultTemplateId && (
                    <div className="mt-2 flex">
                      <span className="text-[11px] font-black text-[#91D148] bg-[#F4F9ED] px-2.5 py-1 rounded-md border border-[#91D148]/20">기본 템플릿</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* === 2. 중앙 영역: 템플릿 수정 (모두 textarea + rows={2} 적용) === */}
          <main className="flex-1 min-w-[360px] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 shrink-0 bg-white min-h-[84px] flex items-center justify-between">
              <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2.5">
                <span className="text-[#3b82f6]"><EditIcon /></span> 
                {selectedTemplateId ? "템플릿 수정" : "새 템플릿 작성"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-white">
              <div>
                <label className="text-[13px] font-bold text-gray-800 mb-1.5 block">템플릿 이름 <span className="text-red-500">*</span></label>
                <textarea 
                  value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="예) 주간 회의록 템플릿"
                  rows={1}
                  className="w-full text-[14px] font-bold border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#91D148] bg-gray-50 focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-gray-800 mb-1.5 block">템플릿 설명</label>
                <textarea 
                  value={formData.description} onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="해당 템플릿의 목적이나 설명을 적어주세요"
                  rows={2}
                  className="w-full text-[14px] font-medium border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#91D148] bg-gray-50 focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-800 mb-1.5">AI 요약 포맷 지시어</label>
                <textarea 
                  value={formData.aiFormat} onChange={(e) => handleFormChange('aiFormat', e.target.value)}
                  placeholder="예) 서술형 줄글로 작성 등"
                  rows={2}
                  className="w-full text-[14px] font-medium border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#91D148] bg-gray-50 focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-800 mb-1.5">액션 아이템 추출 지침</label>
                <textarea 
                  value={formData.actionItem} onChange={(e) => handleFormChange('actionItem', e.target.value)}
                  placeholder="구체적인 작업 항목을 어떻게 추출할지 적어주세요."
                  rows={3}
                  className="w-full text-[14px] font-medium border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#91D148] resize-none bg-gray-50 focus:bg-white transition-all custom-scrollbar"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col">
                <div className="flex items-center gap-2">
                  <label className="text-[13px] font-bold text-gray-800 shrink-0">이탈 감지 민감도</label>
                  <span className="text-[12px] text-gray-500 font-medium truncate">
                    : {formData.sensitivity === 'low' ? '자유로운 발언이 필요한 경우' : 
                       formData.sensitivity === 'high' ? '주제 이탈 엄격 감지 (안건 중심)' : 
                       '보통 상황에 적합'}
                  </span>
                </div>
                <div className="flex gap-2 p-1.5 bg-gray-200/50 rounded-lg w-full mt-2.5">
                  {["low", "medium", "high"].map((level) => {
                    const labels = { low: "낮음", medium: "보통", high: "높음" };
                    const isSelected = formData.sensitivity === level;
                    return (
                      <button
                        key={level} onClick={() => handleFormChange('sensitivity', level)}
                        className={`flex-1 py-1.5 text-[12px] rounded-md transition-all ${isSelected ? 'bg-[#cae7a7] text-gray-900 font-black shadow-sm' : 'text-gray-500 font-bold hover:text-gray-800'}`}
                      >
                        {labels[level as keyof typeof labels]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button 
                onClick={handleSetDefault} disabled={selectedTemplateId === defaultTemplateId || selectedTemplateId === null}
                className={`px-5 py-3 text-[13px] font-bold rounded-xl transition-all ${
                  selectedTemplateId === defaultTemplateId
                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed border border-transparent'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#91D148] hover:text-[#91D148]'
                }`}
              >
                {selectedTemplateId === defaultTemplateId ? "현재 기본 템플릿" : "기본 템플릿 지정"}
              </button>
              
              <button 
                onClick={saveTemplate}
                className="px-8 py-3 bg-[#91D148] text-white font-black text-[13px] rounded-xl hover:bg-[#82bd41] shadow-sm transition-all active:scale-95"
              >
                {selectedTemplateId ? "변경사항 저장" : "새 템플릿 등록"}
              </button>
            </div>
          </main>

          {/* === 3. 우측 영역: AI 출력 예시 === */}
          <aside className="flex-[1.5] min-w-[480px] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 shrink-0 bg-white min-h-[84px] flex items-center justify-between">
              <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2.5">
                <span className="text-[#7000FF]"><SparklesIcon /></span> 템플릿 출력 예시
              </h2>
              <button 
                type="button" onClick={generateAIPreview} disabled={isGenerating}
                className="bg-[#91D148] text-white text-[15px] font-bold px-20 py-2 rounded-xl flex items-center gap-1.5 hover:bg-[#cae7a7] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm active:scale-95"
              >
                {isGenerating ? (
                  <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> AI 생성 중...</>
                ) : "✨ AI 예시 자동생성"}
              </button>
            </div>
            
            <div className="flex-1 flex flex-col p-6 overflow-hidden bg-gray-50/30">
              <textarea 
                value={formData.content} onChange={(e) => handleFormChange('content', e.target.value)}
                className={`w-full flex-1 border bg-white rounded-2xl p-6 text-[14px] font-medium leading-relaxed outline-none focus:border-[#7000FF]/50 resize-none custom-scrollbar shadow-sm transition-colors ${
                  isGenerating ? "border-[#7000FF]/30 text-[#7000FF] font-bold animate-pulse" : "border-gray-200 text-gray-800"
                }`}
                placeholder="[AI 예시 자동생성] 버튼을 누르면 설정한 값들을 바탕으로 AI가 예시 문서를 작성해줍니다."
                readOnly={isGenerating}
              />
            </div>
          </aside>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D6E8C3; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #91D148; }
      `}</style>
    </>
  );
};

export default TemplateSettings;