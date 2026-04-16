import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import TemplateEditModal from "../../components/meetings/TemplateEditModal";
import ScriptEditModal, { CorrectionItem } from "../../components/meetings/ScriptEditModal";

const MeetingResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);

  const [templateContent, setTemplateContent] = useState(
`[주간 정기] 신규 프로젝트 UI/UX 개선안 검토 회의

• 일시: 2026년 4월 7일 (화) 14:00 ~ 15:30
• 참석자: 김철수(PM), 이영희(디자이너), 박지민(개발자), 최유진(마케팅)
• 회의 목적: 모바일 앱 메인 화면 개편안 확정 및 기술 검토`
  );

  const [scripts, setScripts] = useState([
    { id: 1, speaker: "김철수 (PM)", time: "00:12", text: "아아, 마이크 테스트. 다들 들어오셨나요? 네, 그럼 오늘 주간 정기 회의 바로 시작할게요. 오늘 의제는 크게 세 가지입니다. 메인 피드 개편, 검색 필터, 그리고 알림 센터 통합 건이에요." },
    { id: 2, speaker: "이영희 (디자이너)", time: "02:45", text: "네, 영희입니다. 제가 화면 공유 좀 할게요. 저번 회의 때 말씀하셨던 메인 피드 레이아웃인데요. 기존 리스트 방식에서 카드형으로 바꾼 시안입니다." },
    { id: 3, speaker: "이영희 (디자이너)", time: "04:22", text: "저희가 피그마가 아니라 피구마 로 작업한 프로토타입 데이터를 보면, 확실히 이미지 강조형인 B안이 클릭률(CTR) 면에서 15% 정도 높게 나왔어요." },
    { id: 4, speaker: "최유진 (마케팅)", time: "06:15", text: "오, B안 예쁘네요. 근데 영희 님, 상단 배너 섹션 말인데요. 지금 롤링 스톤즈 가 3초로 되어 있는데, 유저들이 테스트 다 읽기도 전에 넘어가더라고요. 한 5초로 늘리는 건 어떨까요?" },
    { id: 5, speaker: "김철수 (PM)", time: "08:30", text: "음, 좋은 의견입니다. 그럼 롤링 속도를 5초로 변경하는 것으로 결정하겠습니다. 다음 안건으로 넘어갈까요?" },
    { id: 6, speaker: "박지민 (개발자)", time: "12:15", text: "네, 검색 필터 부분인데요. 현재 API 응답 속도가 제한적인 상황입니다. 맞춤형 추천 로직이 들어가면 쿼리 복잡도가 올라갈 텐데 백핸드 최적화가 선행되어야 할 것 같습니다." }
  ]);

  // ★ 피드백 1번 반영: 부모 컴포넌트가 남은 교정 리스트 상태를 들고 있습니다.
  const [pendingCorrections, setPendingCorrections] = useState<CorrectionItem[]>([
    { id: "1", original: "피구마", suggested: "피그마", isApplied: true, isCustom: false, excludedScriptIds: [] },
    { id: "2", original: "롤링 스톤즈", suggested: "롤링 속도", isApplied: true, isCustom: false, excludedScriptIds: [] },
    { id: "3", original: "테스트 다 읽기도", suggested: "텍스트 다 읽기도", isApplied: true, isCustom: false, excludedScriptIds: [] },
    { id: "4", original: "백핸드", suggested: "백엔드", isApplied: true, isCustom: false, excludedScriptIds: [] },
  ]);

  useEffect(() => {
    const event = new CustomEvent('UPDATE_BARA', { detail: { scenarioId: "meeting_review" } });
    window.dispatchEvent(event);
  }, []);

  const handleApplyCorrections = (corrections: CorrectionItem[]) => {
    const activeCorrections = corrections.filter(c => c.isApplied && c.original.trim() !== "");
    if (activeCorrections.length === 0) return;

    // 1. 스크립트 교정 적용 (단, 사용자가 [제외]한 스크립트 ID는 건너뜀)
    setScripts(prevScripts => prevScripts.map(script => {
      let newText = script.text;
      activeCorrections.forEach(corr => {
        if (!corr.excludedScriptIds.includes(script.id)) {
          const regex = new RegExp(corr.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g");
          newText = newText.replace(regex, corr.suggested);
        }
      });
      return { ...script, text: newText };
    }));

    // 2. 적용 완료된 단어는 대기열(pendingCorrections)에서 영구 삭제
    const appliedIds = activeCorrections.map(c => c.id);
    setPendingCorrections(prev => prev.filter(c => !appliedIds.includes(c.id)));
  };

  const handleSingleApply = (correction: CorrectionItem) => {
    if (correction.original.trim() === "") return;
    
    // 1. 스크립트 교정 적용 (마찬가지로 제외한 ID는 건너뜀)
    setScripts(prevScripts => prevScripts.map(script => {
      if (!correction.excludedScriptIds.includes(script.id)) {
        const regex = new RegExp(correction.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g");
        return { ...script, text: script.text.replace(regex, correction.suggested) };
      }
      return script;
    }));

    // 2. 적용 완료된 단어 대기열에서 영구 삭제
    setPendingCorrections(prev => prev.filter(c => c.id !== correction.id));
  };

  return (
    <>
      <PageMeta title={`회의록 요약 결과 - ${id}`} description="AI 회의록 요약 결과 확인 및 수정" />

      <TemplateEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} initialContent={templateContent} onSave={setTemplateContent} />
      
      {/* ★ 모달에 남은 리스트(initialCorrections)를 넘겨줍니다. */}
      <ScriptEditModal 
        isOpen={isScriptModalOpen} 
        onClose={() => setIsScriptModalOpen(false)} 
        onApply={handleApplyCorrections} 
        onSingleApply={handleSingleApply} 
        originalScripts={scripts}
        initialCorrections={pendingCorrections} 
      />

      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)] bg-white p-6 overflow-hidden">
        
        {/* === 좌측 영역 === */}
        <div className="flex-[5.5] flex flex-col h-full overflow-hidden gap-6">
          <section className="flex-[1] flex flex-col min-h-0">
            <h3 className="text-[16px] font-black text-gray-800 border-b-2 border-gray-100 pb-2 mb-3 inline-block pr-6 border-b-[#91D148]/50 shrink-0">핵심 요약</h3>
            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar bg-[#F4F9ED]/50 border border-[#91D148]/30 rounded-lg p-5 shadow-sm">
              <ul className="space-y-3 text-[14px] font-bold text-gray-800 leading-relaxed">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#91D148]">▶</span><span><strong>UI/UX 개편:</strong> 사용자 체류 시간 증대를 위해 카드형 UI 도입 확정.</span></li>
              </ul>
            </div>
          </section>

          <section className="flex-[3] flex flex-col min-h-0">
            <div className="flex justify-between items-end mb-3 shrink-0">
              <h3 className="text-[16px] font-black text-gray-800 border-b-2 border-gray-100 pb-2 inline-block pr-6 border-b-[#91D148]/50">템플릿 요약</h3>
              <button onClick={() => setIsEditModalOpen(true)} className="bg-[#C8E6A5] text-[#4d7222] px-6 py-1.5 rounded-md font-bold hover:bg-[#b8dd8d] transition-colors shadow-sm text-sm">편 집</button>
            </div>
            <div className="flex-1 overflow-y-auto pr-3 no-scrollbar border-2 border-[#E2F1D1] rounded-lg p-8 bg-white shadow-sm relative">
              <div className="whitespace-pre-wrap text-[14px] font-medium text-gray-700 leading-relaxed">{templateContent}</div>
            </div>
          </section>
        </div>

        {/* === 우측 영역 === */}
        <div className="flex-[4.5] flex flex-col h-full border-l border-gray-100 pl-8 overflow-hidden">
          <h3 className="text-[16px] font-black text-gray-800 border-b-2 border-gray-100 pb-2 mb-3 inline-block pr-6 border-b-[#91D148]/50 shrink-0">스크립트 원문</h3>
          
          <div className="bg-[#EDF6E5]/40 rounded-xl p-5 flex flex-col flex-1 overflow-hidden border border-[#91D148]/20">
            <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100 shrink-0">
              <button className="text-[#628a31] hover:text-[#4d7222] transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></button>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative cursor-pointer"><div className="absolute top-0 left-0 h-full w-[15%] bg-[#91D148] rounded-full"></div><div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#628a31] rounded-full shadow"></div></div>
              <span className="text-[12px] font-mono font-bold text-gray-500">12:45 / 60:00</span>
            </div>

            <div className="flex justify-end mb-4 shrink-0">
              <button onClick={() => setIsScriptModalOpen(true)} className="bg-[#C8E6A5] text-[#4d7222] px-6 py-1.5 rounded-md font-bold hover:bg-[#b8dd8d] transition-colors shadow-sm text-sm">개선하기</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-3 no-scrollbar bg-white rounded-lg p-5 border border-gray-100 shadow-sm min-h-0">
              {scripts.map(script => (
                <div key={script.id} className="text-[14px] leading-relaxed text-gray-700">
                  <span className="font-bold text-gray-900">{script.speaker}:</span> {script.text} 
                  <button className="inline-flex items-center gap-1 ml-2 text-gray-400 hover:text-[#91D148] transition-colors group align-middle">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:fill-current"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <span className="text-[12px] font-bold whitespace-nowrap">{script.time}</span>
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => alert("회의록이 성공적으로 저장되었습니다!")} className="w-full mt-4 shrink-0 bg-[#C8E6A5] text-[#4d7222] py-4 rounded-lg text-[18px] font-black hover:bg-[#b8dd8d] transition-colors shadow-sm">
              저 장 하 기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MeetingResult;