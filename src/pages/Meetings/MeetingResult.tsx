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
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ★ 신규: 오디오 플레이어 동기화용 상태
  const [activeScriptId, setActiveScriptId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // 현재 재생 시간 (초 단위)
  const TOTAL_DURATION = 3600; // 전체 시간 (60분 = 3600초)

  const [templateContent, setTemplateContent] = useState(
`[주간 정기] 신규 프로젝트 UI/UX 개선안 검토 회의

• 일시: 2026년 4월 7일 (화) 14:00 ~ 15:30
• 참석자: 김철수(PM), 이영희(디자이너), 박지민(개발자), 최유진(마케팅)
• 회의 목적: 모바일 앱 메인 화면 개편안 확정 및 기술 검토

1. 주요 논의 사항
• 메인 피드 레이아웃 변경: 사용자 체류 시간을 높이기 위해 카드형 UI 도입 결정. 이영희 디자이너가 제시한 B안(이미지 강조형)으로 진행하기로 함.
• 검색 필터 고도화: 기존 3단계 필터에서 사용자 맞춤형 추천 필터 기능을 추가하기로 논의함. 박지민 개발자가 API 응답 속도 최적화 필요성 언급.
• 알림 센터 통합: 산재되어 있던 마케팅 알림과 서비스 알림을 하나의 탭으로 통합하여 가독성 개선.

2. 결정 사항
• 결정 01: 메인 페이지 상단 배너 순환 속도를 기존 3초에서 5초로 변경.
• 결정 02: 신규 온보딩 프로세스에서 '관심사 선택' 단계를 필수 항목에서 선택 항목으로 전환.
• 추가 결정: 차주 월요일 오전 10시 디자인 가이드라인 2차 검토 회의 소집.`
  );

  const [scripts, setScripts] = useState([
    { id: 1, speaker: "김철수 (PM)", time: "00:12", text: "아아, 마이크 테스트. 다들 들어오셨나요? 네, 그럼 오늘 주간 정기 회의 바로 시작할게요. 오늘 의제는 크게 세 가지입니다. 메인 피드 개편, 검색 필터, 그리고 알림 센터 통합 건이에요." },
    { id: 2, speaker: "이영희 (디자이너)", time: "02:45", text: "네, 영희입니다. 제가 화면 공유 좀 할게요. 저번 회의 때 말씀하셨던 메인 피드 레이아웃인데요. 기존 리스트 방식에서 카드형으로 바꾼 시안입니다." },
    { id: 3, speaker: "이영희 (디자이너)", time: "04:22", text: "저희가 피그마가 아니라 피구마 로 작업한 프로토타입 데이터를 보면, 확실히 이미지 강조형인 B안이 클릭률(CTR) 면에서 15% 정도 높게 나왔어요." },
    { id: 4, speaker: "최유진 (마케팅)", time: "06:15", text: "오, B안 예쁘네요. 근데 영희 님, 상단 배너 섹션 말인데요. 지금 롤링 스톤즈 가 3초로 되어 있는데, 유저들이 테스트 다 읽기도 전에 넘어가더라고요. 한 5초로 늘리는 건 어떨까요?" },
    { id: 5, speaker: "김철수 (PM)", time: "08:30", text: "음, 좋은 의견입니다. 그럼 롤링 속도를 5초로 변경하는 것으로 결정하겠습니다. 다음 안건으로 넘어갈까요?" },
    { id: 6, speaker: "박지민 (개발자)", time: "12:15", text: "네, 검색 필터 부분인데요. 현재 API 응답 속도가 제한적인 상황입니다. 맞춤형 추천 로직이 들어가면 쿼리 복잡도가 올라갈 텐데 백핸드 최적화가 선행되어야 할 것 같습니다." }
  ]);

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

  useEffect(() => {
    if (isSaving) {
      const event = new CustomEvent('UPDATE_BARA', { detail: { scenarioId: "generating" } });
      window.dispatchEvent(event);
      const timer = setTimeout(() => {
        navigate("/"); 
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, navigate]);

  // ★ 타이머 로직: isPlaying이 true면 1초마다 currentTime 증가
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < TOTAL_DURATION) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const handleApplyCorrections = (corrections: CorrectionItem[]) => {
    const activeCorrections = corrections.filter(c => c.isApplied && c.original.trim() !== "");
    if (activeCorrections.length === 0) return;

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

    const appliedIds = activeCorrections.map(c => c.id);
    setPendingCorrections(prev => prev.filter(c => !appliedIds.includes(c.id)));
  };

  const handleSingleApply = (correction: CorrectionItem) => {
    if (correction.original.trim() === "") return;
    setScripts(prevScripts => prevScripts.map(script => {
      if (!correction.excludedScriptIds.includes(script.id)) {
        const regex = new RegExp(correction.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g");
        return { ...script, text: script.text.replace(regex, correction.suggested) };
      }
      return script;
    }));
    setPendingCorrections(prev => prev.filter(c => c.id !== correction.id));
  };

  const handleExport = (format: string) => {
    setIsExportMenuOpen(false);
    alert(`회의록이 ${format} 형식으로 성공적으로 다운로드 되었습니다! 🐹📥`);
  };

  // ★ 시간 변환 헬퍼 함수
  const parseTimeToSeconds = (timeStr: string) => {
    const [min, sec] = timeStr.split(":").map(Number);
    return min * 60 + sec;
  };

  const formatTime = (totalSec: number) => {
    const min = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const sec = (totalSec % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  // ★ 스크립트 재생 아이콘 클릭 핸들러
  const handlePlayScript = (id: number, timeStr: string) => {
    setActiveScriptId(id); // 초록불 고정
    setCurrentTime(parseTimeToSeconds(timeStr)); // 진행바 이동
    setIsPlaying(true); // 자동 재생 시작
  };

  return (
    <>
      <PageMeta title={`회의록 요약 결과 - ${id}`} description="AI 회의록 요약 결과 확인 및 수정" />

      <style>{`
        @keyframes walkBara {
          0% { left: 0%; transform: translateX(-50%); }
          100% { left: 100%; transform: translateX(-50%); }
        }
      `}</style>

      {isSaving ? (
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm relative animate-fade-in">
          <h2 className="text-[32px] font-black text-gray-800 mb-4 tracking-widest">SAVING...</h2>
          <p className="text-gray-500 font-bold mb-16">회의록을 안전하게 DB에 저장하고 있습니다 🐹</p>
          <div className="relative w-full max-w-[800px] h-2 bg-[#D6E6F5] rounded-full overflow-visible">
            <div className="absolute bottom-0 pb-2 flex justify-center items-end w-[120px]" style={{ animation: 'walkBara 4s linear infinite' }}>
              <img src="/images/bara/Bara_Load.gif" alt="열심히 저장 중인 바라" className="w-full object-contain drop-shadow-sm mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
              <div className="hidden text-6xl">🐹💾</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)] bg-white p-6 overflow-hidden" onClick={() => { if(isExportMenuOpen) setIsExportMenuOpen(false); }}>
          
          <TemplateEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} initialContent={templateContent} onSave={setTemplateContent} />
          <ScriptEditModal isOpen={isScriptModalOpen} onClose={() => setIsScriptModalOpen(false)} onApply={handleApplyCorrections} onSingleApply={handleSingleApply} originalScripts={scripts} initialCorrections={pendingCorrections} />

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

              <div className="relative flex justify-end mt-4 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); setIsExportMenuOpen(!isExportMenuOpen); }} className="bg-[#C8E6A5] text-[#4d7222] px-8 py-2.5 rounded-md font-bold hover:bg-[#b8dd8d] transition-colors shadow-sm text-sm flex items-center gap-2">
                  내보내기 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isExportMenuOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                {isExportMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fade-in-up z-50">
                    <button onClick={() => handleExport("PDF")} className="w-full text-left px-5 py-3 text-[13px] font-bold text-gray-700 hover:bg-[#F4F9ED] hover:text-[#4d7222] border-b border-gray-50 transition-colors flex items-center gap-2"><span className="text-red-500">📄</span> PDF 파일 (.pdf)</button>
                    <button onClick={() => handleExport("Word")} className="w-full text-left px-5 py-3 text-[13px] font-bold text-gray-700 hover:bg-[#F4F9ED] hover:text-[#4d7222] border-b border-gray-50 transition-colors flex items-center gap-2"><span className="text-blue-500">📝</span> Word 파일 (.docx)</button>
                    <button onClick={() => handleExport("텍스트")} className="w-full text-left px-5 py-3 text-[13px] font-bold text-gray-700 hover:bg-[#F4F9ED] hover:text-[#4d7222] transition-colors flex items-center gap-2"><span className="text-gray-500">📃</span> 텍스트 파일 (.txt)</button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* === 우측 영역 === */}
          <div className="flex-[4.5] flex flex-col h-full border-l border-gray-100 pl-8 overflow-hidden">
            <h3 className="text-[16px] font-black text-gray-800 border-b-2 border-gray-100 pb-2 mb-3 inline-block pr-6 border-b-[#91D148]/50 shrink-0">스크립트 원문</h3>
            
            <div className="bg-[#EDF6E5]/40 rounded-xl p-5 flex flex-col flex-1 overflow-hidden border border-[#91D148]/20">
              
              {/* ★ 상단 오디오 플레이어 (실시간 동기화) */}
              <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100 shrink-0">
                {/* 재생/일시정지 버튼 토글 연동 */}
                <button onClick={() => setIsPlaying(true)} className={`transition-colors ${isPlaying ? 'text-[#4d7222]' : 'text-[#628a31] hover:text-[#4d7222]'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isPlaying ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isPlaying ? "1" : "2"}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
                <button onClick={() => setIsPlaying(false)} className={`transition-colors ${!isPlaying ? 'text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={!isPlaying ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>
                
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute top-0 left-0 h-full bg-[#91D148] rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#628a31] rounded-full shadow transition-all duration-1000 ease-linear z-10" style={{ left: `calc(${(currentTime / TOTAL_DURATION) * 100}% - 7px)` }}></div>
            </div>
                
                {/* 텍스트 타이머 실시간 반영 */}
                <span className="text-[12px] font-mono font-bold text-gray-500 w-24 text-right">
                  {formatTime(currentTime)} / 60:00
                </span>
              </div>

              <div className="flex justify-end mb-4 shrink-0">
                <button onClick={() => setIsScriptModalOpen(true)} className="bg-[#C8E6A5] text-[#4d7222] px-6 py-1.5 rounded-md font-bold hover:bg-[#b8dd8d] transition-colors shadow-sm text-sm">개선하기</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-3 no-scrollbar bg-white rounded-lg p-5 border border-gray-100 shadow-sm min-h-0">
                {scripts.map(script => {
                  // ★ 현재 스크립트가 활성화(Active) 상태인지 확인
                  const isActive = activeScriptId === script.id;

                  return (
                    <div key={script.id} className={`text-[14px] leading-relaxed transition-colors ${isActive ? 'text-gray-900 bg-[#F4F9ED]/50 -mx-2 px-2 py-1 rounded-lg' : 'text-gray-700'}`}>
                      <span className="font-bold text-gray-900">{script.speaker}:</span> {script.text} 
                      
                      {/* ★ 타임스탬프 클릭 시 재생 동기화 처리 */}
                      <button 
                        onClick={() => handlePlayScript(script.id, script.time)}
                        className={`inline-flex items-center gap-1 ml-2 transition-colors group align-middle focus:outline-none ${isActive ? 'text-[#91D148]' : 'text-gray-400 hover:text-[#91D148]'}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isActive ? 'fill-current' : 'group-hover:fill-current'}>
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span className="text-[12px] font-bold whitespace-nowrap">{script.time}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setIsSaveConfirmModalOpen(true)} 
                className="w-full mt-4 shrink-0 bg-[#C8E6A5] text-[#4d7222] py-4 rounded-lg text-[18px] font-black hover:bg-[#b8dd8d] transition-colors shadow-sm"
              >
                저 장 하 기
              </button>
            </div>
          </div>
        </div>
      )}

      {isSaveConfirmModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-fade-in text-center border border-gray-100 w-[380px]">
            <span className="text-[32px] mb-4">💾</span>
            <p className="text-[18px] font-black text-gray-900 mb-2">회의록을 최종 저장하시겠습니까?</p>
            <p className="text-[14px] font-bold text-gray-500 mb-8 px-4 leading-relaxed">
              저장 후에는 더 이상 내용을 <strong className="text-red-500">수정할 수 없으며</strong>,<br/>홈 화면으로 이동합니다.
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setIsSaveConfirmModalOpen(false)} className="flex-1 py-3.5 bg-[#F1F3F5] text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={() => { setIsSaveConfirmModalOpen(false); setIsSaving(true); }} className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] shadow-md transition-colors">저장 확정</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingResult;