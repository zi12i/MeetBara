import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import SpeakerEditModal from "../../components/meetings/SpeakerEditModal";
import MemberAddModal from "../../components/meetings/MemberAddModal";
import Toast from "../../components/common/Toast"; 

interface ChatMessage {
  id: number;
  sender: "me" | "bara";
  text: string;
  time: string;
}

interface MeetingLog {
  id: number;
  title: string;
  date: string;
  members: string;
  keywords: string[];
  content: string;
}

const LiveMeeting: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState("decisions");
  const [activeSideTab, setActiveSideTab] = useState("keyword-search"); 
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [meetingMembers, setMeetingMembers] = useState(["김철수", "이영희", "박지민"]);

  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 시스템 및 모달 상태
  const [isStopModalOpen, setIsStopModalOpen] = useState(false); 
  const [isCarryOverModalOpen, setIsCarryOverModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // ★ 로딩(생성 중) 화면 상태 추가
  
  // 토스트 상태
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState(""); 

  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const [waveforms, setWaveforms] = useState<number[]>(Array(35).fill(4));
  const [isDeviationDetected, setIsDeviationDetected] = useState(false);
  const [currentBaraId, setCurrentBaraId] = useState("meeting_normal");

  const [agendas, setAgendas] = useState([
    { id: 1, text: "메인 피드 레이아웃 개편안 검토", isCompleted: false, summary: "" },
    { id: 2, text: "알림센터 통합 구조 설계", isCompleted: false, summary: "" },
    { id: 3, text: "옵셔널 전환 설정 유도 방안", isCompleted: false, summary: "" },
    { id: 4, text: "추가 지표(체류시간) 도입 여부", isCompleted: false, summary: "" }
  ]);

  const fullScript = [
    { time: 1, user: "김철수", text: "아아, 마이크 테스트. 다들 들어오셨나요? 오늘 주간 정기 회의 시작할게요." },
    { time: 4, user: "이영희", text: "네, 첫 번째 안건인 메인 피드 레이아웃 개편안부터 보시죠." },
    { time: 8, user: "박지민", text: "어, 근데 우리 오늘 점심 뭐 먹죠? 근처에 새로 생긴 돈가스집 어때요? (안건 이탈)" },
    { time: 11, user: "김철수", text: "아, 넵. 다시 본론으로 돌아와서... 공지를 우선 통합하고 확장하시죠." },
    { time: 14, user: "이영희", text: "동의합니다. 그렇게 확정하시죠." },
    { time: 18, user: "김철수", text: "다음은 알림센터 통합 건입니다. 옵셔널로 가는 게 맞을 것 같아요." },
    { time: 23, user: "박지민", text: "네, 초기엔 옵셔널로 가고 나중에 설정 유도 팝업 띄우는 걸로 결정하죠." },
    { time: 31, user: "이영희", text: "그나저나 주말에 넷플릭스 보셨어요? 재미있던데..." },
  ];

  const fullSummary = [
    { time: 1, title: "회의 시작 및 도입", content: ["주간 정기 회의 시작", "메인 피드 개편 논의 시작"] },
    { time: 15, title: "메인 피드 레이아웃 결정", content: ["공지 중심으로 우선 통합", "추후 전체 통합 구조로 확장 예정"] },
    { time: 25, title: "알림센터 통합 구조 결정", content: ["초기 도입 시 옵셔널로 전환", "이후 단계에서 팝업을 통한 설정 유도"] }
  ];

  const meetingKeywords = ["메인피드", "알림센터", "검색필터", "옵셔널전환", "점심메뉴", "UX개선", "단계적통합", "구조설계"];
  const mockMeetingLogs: MeetingLog[] = [
    { id: 1, title: "신규 프로젝트 기획", date: "2026.03.28", members: "김철수, 이영희, 박지민", keywords: ["알림센터"], content: "공지 중심 통합..." }
  ];
  const filteredLogs = mockMeetingLogs.filter(log => log.title.includes(searchTerm) || log.keywords.some(k => k.includes(searchTerm)));

  const emitBara = (scenarioId: string, progress?: number) => {
    const event = new CustomEvent('UPDATE_BARA', { detail: { scenarioId, progress } });
    window.dispatchEvent(event);
  }

  // 1. 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        setWaveforms(prev => prev.map(() => Math.floor(Math.random() * 12) + 4));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // 2. AI 시나리오 엔진
  useEffect(() => {
    let targetBaraId = currentBaraId;
    let isDeviation = isDeviationDetected;

    if (recordingTime === 8) {
      targetBaraId = "meeting_caution";
      isDeviation = true;
      setChatList(prev => [...prev, { id: Date.now(), sender: "bara", text: "🚨 잠시만요! 현재 '점심 메뉴'에 대해 이야기하고 계신 것 같아요. 안건으로 돌아가볼까요? 🐹", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setActiveSideTab("chat");
    } else if (recordingTime === 15) {
      targetBaraId = "meeting_normal";
      isDeviation = false;
      setAgendas(prev => prev.map(a => a.id === 1 ? { ...a, isCompleted: true, summary: "공지 중심으로 우선 통합 후, 전체 통합 구조로 확장하기로 합의됨" } : a));
    } else if (recordingTime === 25) {
      setAgendas(prev => prev.map(a => a.id === 2 ? { ...a, isCompleted: true, summary: "옵셔널 전환 후, 이후 단계에서 설정 유도하는 것으로 결정됨" } : a));
    } else if (recordingTime === 32) {
      targetBaraId = "meeting_warning";
      isDeviation = true;
      setChatList(prev => [...prev, { id: Date.now(), sender: "bara", text: "😡 삐빅! 회의가 산으로 가고 있습니다! 당장 복귀하세요!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } 
    // 10분 전 토스트
    else if (recordingTime === 38) {
      targetBaraId = "meeting_normal";
      isDeviation = false;
      if (agendas.some(a => !a.isCompleted)) {
        const completedCount = agendas.filter(a => a.isCompleted).length;
        const progress = agendas.length > 0 ? Math.floor((completedCount / agendas.length) * 100) : 0;
        setToastMessage("회의 종료 10분 전 입니다.");
        setToastSubMessage(`진행률 : ${progress}%`);
        setIsToastVisible(true);
      }
    } 
    // 45초 이월 모달
    else if (recordingTime === 45) {
      if (agendas.some(a => !a.isCompleted)) {
        setIsRecording(false);
        setIsCarryOverModalOpen(true);
      }
    }

    if (targetBaraId !== currentBaraId && !isGenerating) setCurrentBaraId(targetBaraId);
    if (isDeviation !== isDeviationDetected && !isGenerating) setIsDeviationDetected(isDeviation);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingTime]);

  // 3. 진행률 동기화 (실제 안건 진행률 유지)
  useEffect(() => {
    // 1. 현재 달성된 실제 진행률(%) 계산
    const completedCount = agendas.filter(a => a.isCompleted).length;
    const calculatedProgress = agendas.length > 0 ? Math.floor((completedCount / agendas.length) * 100) : 0;

    // 2. 로딩(생성 중) 상태일 때는 강제로 100%가 아닌, '실제 진행률'을 보냄
    if (isGenerating) {
      emitBara("generating", calculatedProgress); 
      return;
    }

    // 3. 평소 회의 중일 때의 상태 동기화
    if (!isStopModalOpen && !isCarryOverModalOpen) {
      emitBara(currentBaraId, calculatedProgress);
    }
  }, [agendas, currentBaraId, isStopModalOpen, isCarryOverModalOpen, isGenerating]);

  useEffect(() => {
    setChatList([{ id: Date.now(), sender: "bara", text: "안녕하세요! 회의바라입니다. 알아서 안건 달성 여부를 체크할게요. 🐹", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatList, activeSideTab]);

  // ★ 4. 자동 라우팅 엔진: 로딩이 시작되면 5초 뒤에 결과 페이지로 이동!
  useEffect(() => {
    if (isGenerating) {
      // 5초 동안 귀여운 악어바라를 보여준 뒤 결과 화면으로 이동합니다.
      const timer = setTimeout(() => {
        navigate(`/meeting/${id}/result`);
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [isGenerating, navigate, id]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setChatList(prev => [...prev, { id: Date.now(), sender: "me", text: inputValue, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInputValue("");
  };

  const handleRemoveMember = (nameToRemove: string) => setMeetingMembers(prev => prev.filter(name => name !== nameToRemove));
  const handleAddMembers = (selected: any[]) => setMeetingMembers(prev => Array.from(new Set([...prev, ...selected.map(m => m.name)])));
  const handleEditSpeaker = (name: string) => { setSelectedSpeaker(name); setIsModalOpen(true); };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <PageMeta title={`실시간 회의 - ${id}`} description="실시간 회의 진행 화면" />
      <PageMeta title={`실시간 회의 - ${id}`} description="실시간 회의 진행 화면" />
      <Toast message={toastMessage} subMessage={toastSubMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />

      {/* ★ 수정됨: 뽈뽈뽈 걸어가는 바라 애니메이션 키프레임 */}
      <style>{`
        @keyframes walkBara {
          0% { left: 0%; transform: translateX(-50%); }
          100% { left: 100%; transform: translateX(-50%); }
        }
      `}</style>

      {/* ★ 메인 레이아웃 분기 처리: 로딩 중 vs 회의 중 */}
      {isGenerating ? (
        // === 로딩 (회의록 생성 중) 화면 ===
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm relative">
          <h2 className="text-[32px] font-black text-gray-800 mb-16 tracking-widest">LOADING...</h2>
          
          {/* 로딩 바 배경 */}
          <div className="relative w-full max-w-[800px] h-2 bg-[#D6E6F5] rounded-full">
            
            {/* ★ 뽈뽈뽈 걸어가는 바라 GIF 적용 */}
            <div 
              className="absolute bottom-0 pb-2 flex justify-center items-end w-[120px]" 
              style={{ animation: 'walkBara 4s linear infinite' }}
            >
              <img 
                src="/images/bara/Bara_Load.gif" 
                alt="열심히 요약 중인 바라" 
                className="w-full object-contain drop-shadow-sm" 
                onError={(e) => { 
                  // 혹시 이미지 경로가 틀렸을 때를 대비한 이모지 폴백
                  e.currentTarget.style.display = 'none'; 
                  e.currentTarget.nextElementSibling!.classList.remove('hidden'); 
                }}
              />
              <div className="hidden text-6xl">🐹📝</div>
            </div>
            
          </div>
        </div>
      ) : (
        // === 기존 실시간 회의 화면 ===
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] bg-white overflow-hidden relative">
          
          {/* 좌측 패널 */}
          <div className="flex-1 flex flex-col gap-6 p-4 overflow-hidden">
            <div className={`rounded-2xl p-6 space-y-4 shadow-sm border transition-colors duration-500 ${isDeviationDetected ? 'bg-red-50 border-red-200' : 'bg-[#F4F9ED] border-[#91D148]/10'} shrink-0`}>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">[주간 정기] 신규 프로젝트 UI/UX 개선안 검토 회의</h1>
                {isDeviationDetected && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black animate-bounce shadow-md">안건 이탈 주의!</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {meetingMembers.map(name => (
                  <div key={name} className="relative group">
                    <span className="px-4 py-1.5 bg-white text-[#91D148] border border-[#91D148]/20 font-bold rounded-lg shadow-sm flex items-center transition-all group-hover:pr-8">{name}</span>
                    <button onClick={() => setMeetingMembers(prev => prev.filter(n => n !== name))} className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#91D148] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                  </div>
                ))}
                <span onClick={() => setIsMemberModalOpen(true)} className="text-gray-400 ml-2 cursor-pointer hover:text-[#91D148] font-medium">+ 회의자 추가</span>
                <span className="ml-auto text-gray-500 font-bold px-1 text-[13px]">2026년 4월 16일 15:00</span>
              </div>
            </div>

            <div className="border-b border-gray-100 flex gap-10 px-2 shrink-0">
              {[{ id: "decisions", label: "오늘의 안건" }, { id: "live-summary", label: "실시간요약" }, { id: "script", label: "스크립트" }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 text-[16px] font-bold transition-all relative ${activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#91D148] rounded-full animate-fade-in"></div>}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 px-2 no-scrollbar pb-10">
              {activeTab === "decisions" ? (
                <section className="space-y-4 animate-fade-in">
                  {agendas.map((agenda) => (
                    <div key={agenda.id} className={`py-5 px-6 rounded-[24px] shadow-sm transform transition-all duration-500 border ${agenda.isCompleted ? 'bg-[#F4F9ED] border-[#91D148]/30' : 'bg-gray-100 border-gray-200'}`}>
                      <div className="flex items-center gap-5">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-500 ${agenda.isCompleted ? 'bg-[#91D148] border-[#91D148]' : 'bg-white border-gray-300'}`}>
                          {agenda.isCompleted && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <p className={`text-[17px] font-extrabold transition-all duration-500 ${agenda.isCompleted ? 'text-gray-900 line-through decoration-[#91D148] decoration-2 opacity-70' : 'text-gray-800'}`}>{agenda.text}</p>
                      </div>
                      {agenda.isCompleted && agenda.summary && (
                        <div className="mt-4 ml-11 p-4 bg-white rounded-xl border border-[#91D148]/20 animate-fade-in-up shadow-sm">
                          <p className="text-[13px] font-black text-[#91D148] mb-1 flex items-center gap-1"><span className="text-[16px]">🐹</span> 바라의 요약 노트</p>
                          <p className="text-[14px] font-bold text-gray-700 leading-relaxed pl-6">{agenda.summary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              ) : activeTab === "live-summary" ? (
                <div className="animate-fade-in space-y-8">
                  <div className="flex items-center gap-2 text-[#91D148] font-bold bg-[#F4F9ED]/50 p-3 rounded-xl border border-[#91D148]/10 mb-6">
                    <span className="text-xl">💡</span><p>AI가 대화 흐름을 파악하여 실시간으로 요약하고 있습니다.</p>
                  </div>
                  {fullSummary.filter(s => s.time <= recordingTime).map((summary, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-gray-100 text-gray-600 font-medium animate-fade-in-up">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#91D148] rounded-full border-4 border-white"></div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">{summary.title}</h3>
                      <ul className="list-disc list-inside space-y-2 ml-2">
                        {summary.content.map((txt, i) => <li key={i}>{txt}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : activeTab === "script" ? (
                <div className="animate-fade-in relative pl-4 border-l border-gray-100 ml-2 space-y-6 pb-10">
                  {fullScript.filter(item => item.time <= recordingTime).map((item, idx) => (
                    <div key={idx} className={`group relative space-y-2 animate-fade-in-up ${item.text.includes("점심") || item.text.includes("넷플릭스") ? 'border-2 border-red-200 rounded-2xl p-2 bg-red-50/30' : ''}`}>
                      <div className="absolute -left-[21px] top-2 w-3 h-3 bg-white border-2 border-gray-200 rounded-full group-hover:border-[#91D148] transition-colors"></div>
                      <span className="font-bold text-gray-900 text-sm block">{item.user}</span>
                      <div className="text-[15px] text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl group-hover:bg-[#F4F9ED]/60 transition-all">{item.text}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex justify-center w-full px-4 mb-8 shrink-0">
              <div className="flex items-center bg-[#F1F3F5] rounded-full px-10 py-2.5 shadow-sm border border-gray-200 gap-6">
                <div className="text-[#495057] font-mono font-bold text-[17px] tracking-tight">{formatTime(recordingTime)}</div>
                <div className="w-[1.5px] h-4 bg-gray-300"></div>
                <div className="flex items-center gap-[4px] h-5 w-[180px] justify-center">
                  {waveforms.map((height, i) => (<div key={i} style={{ height: `${height}px` }} className="w-[2.5px] bg-[#ADB5BD] rounded-full transition-all duration-500"></div>))}
                </div>
                <div className="w-[1.5px] h-4 bg-gray-300"></div>
                <div className="flex items-center gap-6">
                  <button className="text-gray-500 hover:text-gray-800"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg></button>
                  <button onClick={() => setIsRecording(!isRecording)} className="text-gray-500 hover:text-gray-800">
                    {isRecording ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="10" y1="4" x2="10" y2="20"></line><line x1="14" y1="4" x2="14" y2="20"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>}
                  </button>
                  <button 
                    onClick={() => { setIsRecording(false); setIsStopModalOpen(true); }} 
                    className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50 shadow-sm"
                  >
                    <div className="w-2.5 h-2.5 bg-[#FF6B6B] rounded-sm"></div><span className="text-[13px] font-bold text-[#495057]">녹음 종료</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 사이드 패널 */}
          <div className="w-full lg:w-[420px] bg-[#F4F9ED] flex flex-col shadow-inner overflow-hidden shrink-0">
            <div className="p-6 pb-2 space-y-6 shrink-0">
              <div className="flex justify-between border-b border-[#91D148]/20 pb-2">
                {[{ id: "keywords", label: "회의키워드" }, { id: "keyword-search", label: "키워드 검색" }, { id: "chat", label: "채팅창" }, { id: "speakers", label: "발화자" }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveSideTab(tab.id)} className={`pb-3 text-[13px] font-bold transition-all relative ${activeSideTab === tab.id ? "text-[#91D148]" : "text-gray-400 hover:text-gray-600"}`}>
                    {tab.label}
                    {activeSideTab === tab.id && <div className="absolute bottom-[-2px] left-0 w-full h-[4px] bg-[#91D148]"></div>}
                  </button>
                ))}
              </div>

              {activeSideTab === "keyword-search" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91D148]">🔍</span>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="키워드로 발언을 검색해 보세요" className="w-full bg-white border-2 border-transparent rounded-2xl py-3 pl-12 pr-10 text-sm font-black focus:border-[#91D148] outline-none shadow-sm transition-all" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["알림센터", "공지", "옵셔널전환", "체류시간"].map(tag => (
                      <button key={tag} onClick={() => setSearchTerm(tag)} className={`px-3 py-1.5 rounded-full text-[12px] font-extrabold transition-all border ${searchTerm === tag ? "bg-[#91D148] text-white border-[#91D148]" : "bg-gray-200 text-gray-600 border-transparent hover:bg-gray-300"}`}>{tag}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden px-6 pb-10">
              {activeSideTab === "keywords" ? (
                <div className="grid grid-cols-2 gap-4 animate-fade-in pb-10 overflow-y-auto no-scrollbar">
                  {meetingKeywords.map((kw, idx) => (
                    <div key={idx} onClick={() => { setActiveSideTab("keyword-search"); setSearchTerm(kw); }} className="bg-gray-200/80 border border-gray-300 py-6 px-4 rounded-[20px] flex items-center justify-center shadow-sm hover:bg-[#91D148] hover:text-white cursor-pointer group">
                      <span className="text-[16px] font-black text-gray-800 group-hover:text-white break-all">{kw}</span>
                    </div>
                  ))}
                </div>
              ) : activeSideTab === "keyword-search" ? (
                <div className="space-y-6 animate-fade-in overflow-y-auto no-scrollbar pt-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="p-6 border-l-[6px] border-[#91D148] rounded-2xl bg-white space-y-4 shadow-sm">
                      <h4 className="font-black text-[17px] text-gray-900 leading-tight">{log.title}</h4>
                      <div className="text-[12px] space-y-1.5 text-gray-800">
                        <p className="flex font-bold"><span className="w-14 text-gray-500 font-medium">날짜:</span> {log.date}</p>
                        <p className="flex font-bold"><span className="w-14 text-gray-500 font-medium">키워드:</span> <span className="text-[#91D148] font-black">{log.keywords.join(", ")}</span></p>
                        <div className="mt-4 p-4 bg-[#F4F9ED]/50 rounded-xl border border-[#91D148]/10 text-[13px] italic">" {log.content} "</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeSideTab === "chat" ? (
                <div className="flex flex-col h-full animate-fade-in relative">
                  <div className="flex-1 overflow-y-auto space-y-5 p-1 no-scrollbar">
                    {chatList.map((chat) => (
                      <div key={chat.id} className={`flex flex-col ${chat.sender === "me" ? "items-end" : "items-start"}`}>
                        {chat.sender === "bara" && <span className="text-[11px] font-black text-[#91D148] mb-1 ml-1">BARA 🐹</span>}
                        <div className="flex items-end gap-2 max-w-[90%]">
                          {chat.sender === "me" && <span className="text-[10px] text-gray-400 mb-1">{chat.time}</span>}
                          <div className={`p-4 rounded-[20px] text-[14px] font-bold shadow-md leading-relaxed ${chat.sender === "me" ? "bg-[#91D148] text-white rounded-tr-none" : chat.text.includes("🚨") || chat.text.includes("😡") ? "bg-red-500 text-white rounded-tl-none" : "bg-white text-gray-800 rounded-tl-none border border-[#91D148]/10"}`}>{chat.text}</div>
                        </div>
                      </div>
                    ))}
                    <div className="h-44 flex-shrink-0" /><div ref={chatEndRef} />
                  </div>
                  <div className="mt-2 relative z-10 pb-4 pr-[130px]">
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (!isComposing && e.key === "Enter") handleSendMessage(); }} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} placeholder="바라에게 물어보세요" className="w-full bg-white border-2 border-[#91D148]/30 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold focus:border-[#91D148] outline-none shadow-xl" />
                    <button onClick={handleSendMessage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#91D148] text-white rounded-xl flex items-center justify-center hover:bg-[#82bd41] shadow-lg"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>
                  </div>
                </div>
              ) : activeSideTab === "speakers" ? (
                <div className="space-y-4 animate-fade-in overflow-y-auto no-scrollbar pt-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-[#91D148]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#F4F9ED] rounded-full flex items-center justify-center text-[#91D148] font-bold">🔊</div>
                        <span className="font-bold text-gray-800 text-sm">참가자 {i}</span>
                      </div>
                      <button onClick={() => { setSelectedSpeaker(`참가자 ${i}`); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-[#91D148]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <MemberAddModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onAdd={handleAddMembers} />
      <SpeakerEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentSpeaker={selectedSpeaker} />

      {isStopModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          <div className="relative bg-white rounded-[24px] p-10 w-[380px] shadow-2xl text-center animate-fade-in">
            <h2 className="text-[18px] font-black text-gray-900 mb-2">녹음을 종료하시겠습니까?</h2>
            <p className="text-[13px] font-medium text-gray-500 mb-8 leading-relaxed">종료 후에는 회의록이 자동으로 생성되며<br />더 이상 실시간 기록을 할 수 없습니다.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => { 
                  setIsStopModalOpen(false); 
                  setIsRecording(true); 
                  let originBaraId = "meeting_normal";
                  if (recordingTime >= 8 && recordingTime < 20) originBaraId = "meeting_caution";
                  else if (recordingTime >= 20 && recordingTime < 33) originBaraId = "meeting_warning";
                  setCurrentBaraId(originBaraId);
                  const completedCount = agendas.filter(a => a.isCompleted).length;
                  const progress = agendas.length > 0 ? Math.floor((completedCount / agendas.length) * 100) : 0;
                  emitBara(originBaraId, progress); 
                }} 
                className="flex-1 py-3.5 bg-[#F1F3F5] text-[#495057] font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                아니오
              </button>
              <button 
                onClick={() => { 
                  // ★ 녹음 종료 확정 시: 생성 화면으로 전환, 바라존 100% 땀 뻘뻘, 토스트 띄우기
                  setIsStopModalOpen(false); 
                  setIsGenerating(true); 
                  setCurrentBaraId("generating"); 
                  setToastMessage("회의록 생성을 시작합니다! 🐹");
                  setToastSubMessage("");
                  setIsToastVisible(true);
                }} 
                className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] transition-all"
              >
                네
              </button>
            </div>
          </div>
        </div>
      )}

      {isCarryOverModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          <div className="relative bg-white rounded-[24px] p-10 w-[420px] shadow-2xl text-center animate-fade-in">
            <h2 className="text-[20px] font-black text-gray-900 mb-3">종료 시간이 다 되었습니다.</h2>
            <p className="text-[14px] font-medium text-gray-600 mb-8 leading-relaxed">지정된 회의 시간이 종료되었습니다.<br />해결되지 않은 안건을 이월하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={() => { setIsCarryOverModalOpen(false); setIsRecording(true); }} className="flex-1 py-3.5 bg-[#F1F3F5] text-[#495057] font-bold rounded-xl hover:bg-gray-200">아니오</button>
              <button 
                onClick={() => { 
                  setIsCarryOverModalOpen(false); 
                  setIsGenerating(true); 
                  setCurrentBaraId("generating");
                  setToastMessage("미결정 안건을 이월하고 회의록을 생성합니다! 🐹");
                  setToastSubMessage("");
                  setIsToastVisible(true);
                }} 
                className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] shadow-[0_4px_12px_rgba(145,209,72,0.3)]"
              >
                이월하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveMeeting;