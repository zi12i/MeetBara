import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import SpeakerEditModal from "../../components/meetings/SpeakerEditModal";
import MemberAddModal from "../../components/meetings/MemberAddModal";
import Toast from "../../components/common/Toast"; 
import CapybaraZone from "../../components/common/CapybaraZone";
import { createPortal } from "react-dom";

interface ChatMessage {
  id: number;
  sender: "me" | "bara";
  text: string;
  time: string;
}

interface Agenda {
  id: number;
  text: string;
  isCompleted: boolean;
  summary: string;
}

interface MeetingLog {
  id: number;
  title: string;
  date: string;
  members: string;
  keywords: string[];
  content: string;
}
const QuickMeeting: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); 
  
  const [activeTab, setActiveTab] = useState("decisions");
  const [activeSideTab, setActiveSideTab] = useState("chat");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  const [meetingTitle, setMeetingTitle] = useState(`[빠른 회의] ${new Date().toLocaleDateString()}`);
  const [meetingMembers, setMeetingMembers] = useState(["김바라"]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [meetingKeywords, setMeetingKeywords] = useState<string[]>([]);
  const [mockMeetingLogs, setMockMeetingLogs] = useState<MeetingLog[]>([]);

  const [speakerEditMode, setSpeakerEditMode] = useState<'bulk' | 'single'>('bulk');
  const [editingScriptId, setEditingScriptId] = useState<number | null>(null);

  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isBaraTyping, setIsBaraTyping] = useState(false); 
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isStopModalOpen, setIsStopModalOpen] = useState(false); 
  const [isGenerating, setIsGenerating] = useState(false); 
  
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState(""); 

  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const [waveforms, setWaveforms] = useState<number[]>(Array(35).fill(4));
  const [liveSummaries, setLiveSummaries] = useState<{time: number, title: string, content: string[]}[]>([]);

  const [liveScript, setLiveScript] = useState([
    { id: 1, time: 1, user: "김바라", text: "아, 다들 바쁘신데 갑자기 회의 잡아서 죄송해요. 메인 화면 UI 건으로 잠깐 얘기하시죠." },
    { id: 2, time: 18, user: "이영희", text: "네 들어왔습니다. 결제 버튼 위치 말씀이시죠?" },
    { id: 3, time: 26, user: "김바라", text: "네, 지금 하단에 있는데 위로 올리는 게 전환율에 좋을 것 같아요. 버튼 색상도 좀 더 쨍한 연두색으로 바꾸고요." },
    { id: 4, time: 33, user: "이영희", text: "좋네요. 상단 우측으로 이동시키고 브랜드 컬러 적용하는 걸로 확정하시죠." },
  ]);

  const activeSpeakers = Array.from(new Set(liveScript.filter(s => s.time <= recordingTime).map(script => script.user)));

  // 💡 핵심 1: CapybaraZone의 'status' 기능을 사용하도록 emitBara 수정
  const emitBara = (scenarioId: string, status?: string, customMessage?: string) => {
    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { scenarioId, status, customMessage } // progress 대신 status 전달
    });
    window.dispatchEvent(event);
  }

  const handleSpeakerChange = (newName: string) => {
    if (speakerEditMode === 'bulk') {
      setLiveScript(prev => prev.map(script => script.user === selectedSpeaker ? { ...script, user: newName } : script));
      setMeetingMembers(prev => prev.map(m => m === selectedSpeaker ? newName : m));
    } else if (speakerEditMode === 'single' && editingScriptId !== null) {
      setLiveScript(prev => prev.map(script => script.id === editingScriptId ? { ...script, user: newName } : script));
    }
  };

  // === 💡 퀵미팅 시연 시나리오 (이미지는 C_3 고정, 하단은 Status 문구 노출) ===
  useEffect(() => {
    if (!isRecording) return;

    if (recordingTime === 1) {
      // 💡 ID는 meeting_normal(C_3.png)로 고정하고 'status'만 보냄
      emitBara("meeting_normal", "대화 경청 중...", "빠른 회의를 시작합니다! 대화 내용을 실시간으로 요약해 드릴게요.");
    }
    else if (recordingTime === 10) {
      setMeetingTitle("메인 화면 결제 UI 개편 논의");
      setMeetingKeywords(["UI개편", "메인화면"]);
      emitBara("meeting_normal", "제목 작성 중...", "대화 주제를 분석하여 회의 제목을 업데이트했습니다! ✍️");
    } 
    else if (recordingTime === 20) {
      setMeetingMembers(prev => prev.includes("이영희") ? prev : [...prev, "이영희"]);
      setLiveSummaries([{ time: 1, title: "회의 도입", content: ["갑작스러운 UI 개편 논의 시작", "메인 화면 버튼 위치 검토"] }]);
      emitBara("meeting_normal", "참석자 인식 중...", "새로운 참석자 '이영희'님을 인식했습니다! 👋");
    } 
    else if (recordingTime === 36) {
      setAgendas([{ id: 1, text: "결제 버튼 위치 조정", isCompleted: true, summary: "결제 버튼을 상단 우측으로 이동하기로 합의됨" }]);
      setMeetingKeywords(prev => Array.from(new Set([...prev, "결제버튼", "전환율", "브랜드컬러"])));
      setLiveSummaries(prev => [...prev, { time: 30, title: "결제 버튼 위치 확정", content: ["상단 우측 이동 합의", "연두색 브랜드 컬러 적용 결정"] }]);
      emitBara("meeting_normal", "결정 포착!", "중요한 결정 사항을 포착하여 안건에 기록했습니다. 💡");
      setActiveTab("decisions"); 
    }
  }, [recordingTime, isRecording]);

  useEffect(() => {
    if (isGenerating) {
      // 종료 시에만 타이핑하는 이미지(C_5)로 변경
      emitBara("generating", "작성 중...", "회의가 종료되었습니다. 내용을 바탕으로 회의록을 작성 중입니다!");
      const timer = setTimeout(() => navigate(`/meeting/${id}/result`), 5000); 
      return () => clearTimeout(timer);
    }
  }, [isGenerating, navigate, id]);

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => setIsToastVisible(false), 3000); 
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatList, isBaraTyping, activeSideTab]); 


  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setChatList(prev => [...prev, { id: Date.now(), sender: "me", text: inputValue, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInputValue("");
    setIsBaraTyping(true);
    setTimeout(() => {
      setIsBaraTyping(false);
      setChatList(prev => [...prev, { id: Date.now(), sender: "bara", text: "꼼꼼하게 기록 중이니 걱정 마세요! 🐹📝", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500); 
  };

  const handleAddMembers = (selected: any[]) => setMeetingMembers(prev => Array.from(new Set([...prev, ...selected.map(m => m.name)])));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredLogs = mockMeetingLogs.filter(log => log.title.includes(searchTerm) || log.keywords.some(k => k.includes(searchTerm)));

  return (
    <>
      <PageMeta title={`빠른 회의 - ${id}`} description="실시간 빠른 회의 진행 화면" />
      <Toast message={toastMessage} subMessage={toastSubMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      <style>{`
        @keyframes walkBara {
          0% { left: 0%; transform: translateX(-50%); }
          100% { left: 100%; transform: translateX(-50%); }
        }
      `}</style>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center w-full h-screen bg-white rounded-2xl shadow-sm relative">
          <h2 className="text-[32px] font-black text-gray-800 mb-16 tracking-widest">LOADING...</h2>
          <div className="relative w-full max-w-[800px] h-2 bg-[#D6E6F5] rounded-full">
            <div className="absolute bottom-0 pb-2 flex justify-center items-end w-[120px]" style={{ animation: 'walkBara 4s linear infinite' }}>
              <img src="/images/bara/Bara_Load.gif" alt="요약 중" className="w-full object-contain drop-shadow-sm" />
            </div>
          </div>
        </div>
      ) : (
        /* 💡 레이아웃: absolute inset-0로 꽉 채우고 전체 스크롤 방지 */
        <div className="absolute inset-0 p-4 md:p-6 overflow-hidden bg-white">
          <div className="w-full h-full max-w-(--breakpoint-2xl) mx-auto flex flex-col lg:flex-row gap-6">
            
            {/* 좌측 패널: 안건, 요약, 스크립트 */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
              {/* 회의 정보 헤더 */}
              <div className="rounded-2xl p-6 space-y-4 shadow-sm border bg-[#F4F9ED] border-[#91D148]/20 shrink-0 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-[#91D148] text-white text-[12px] px-2 py-1 rounded-md">⚡ 빠른 회의</span>
                    {meetingTitle}
                  </h1>
                  <span className="text-gray-500 font-bold px-1 text-[13px]">
                    {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {meetingMembers.map(name => (
                    <div key={name} className="relative group animate-fade-in-up">
                      <span className="px-4 py-1.5 bg-white text-[#91D148] border border-[#91D148]/20 font-bold rounded-lg shadow-sm flex items-center transition-all group-hover:pr-8">{name}</span>
                      <button onClick={() => setMeetingMembers(prev => prev.filter(n => n !== name))} className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#91D148] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                    </div>
                  ))}
                  <span onClick={() => setIsMemberModalOpen(true)} className="text-gray-400 ml-2 cursor-pointer hover:text-[#91D148] font-medium">+ 참석자 수동 추가</span>
                </div>
              </div>

              {/* 탭 네비게이션 */}
              <div className="border-b border-gray-100 flex gap-10 px-2 shrink-0">
                {[{ id: "decisions", label: "오늘의 안건" }, { id: "live-summary", label: "실시간요약" }, { id: "script", label: "스크립트" }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 text-[16px] font-bold transition-all relative ${activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#91D148] rounded-full animate-fade-in"></div>}
                  </button>
                ))}
              </div>

              {/* 💡 컨텐츠 영역: 독립 스크롤 */}
              <div className="flex-1 overflow-y-auto space-y-6 px-2 no-scrollbar pb-10 min-h-0">
                {activeTab === "decisions" ? (
                  <section className="space-y-4 animate-fade-in h-full">
                    {agendas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl border border-gray-100">📝</div>
                        <p className="font-bold text-[16px]">아직 등록된 안건이 없습니다.</p>
                      </div>
                    ) : (
                      agendas.map((agenda) => (
                        <div key={agenda.id} className="py-5 px-6 rounded-[24px] shadow-sm bg-[#F4F9ED] border border-[#91D148]/30 animate-fade-in-up">
                          <div className="flex items-center gap-5">
                            <div className="w-6 h-6 rounded-full border-2 bg-[#91D148] border-[#91D148] flex items-center justify-center shrink-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <p className="text-[17px] font-extrabold text-gray-900 line-through decoration-[#91D148] decoration-2 opacity-80">{agenda.text}</p>
                          </div>
                          {agenda.summary && (
                            <div className="mt-4 ml-11 p-4 bg-white rounded-xl border border-[#91D148]/20 shadow-sm">
                              <p className="text-[13px] font-black text-[#91D148] mb-1 flex items-center gap-1"><span className="text-[16px]">🐹</span> 바라의 자동 요약</p>
                              <p className="text-[14px] font-bold text-gray-700 leading-relaxed pl-6">{agenda.summary}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </section>
                ) : activeTab === "live-summary" ? (
                  <div className="animate-fade-in space-y-8 h-full">
                    {liveSummaries.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center text-gray-400 font-bold">대화가 진행되면 실시간 요약을 생성합니다.</div>
                    ) : (
                      liveSummaries.map((summary, idx) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-gray-100 text-gray-600 font-medium animate-fade-in-up">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#91D148] rounded-full border-4 border-white"></div>
                          <h3 className="text-lg font-bold text-gray-800 mb-3">{summary.title}</h3>
                          <ul className="list-disc list-inside space-y-2 ml-2">
                            {summary.content.map((txt, i) => <li key={i}>{txt}</li>)}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                ) : activeTab === "script" ? (
                  <div className="animate-fade-in relative pl-4 border-l border-gray-100 ml-2 space-y-6 pb-10">
                    {liveScript.filter(item => item.time <= recordingTime).map((item) => (
                      <div key={item.id} className="group relative space-y-2 animate-fade-in-up">
                        <div className="absolute -left-[21px] top-2 w-3 h-3 bg-white border-2 border-gray-200 rounded-full group-hover:border-[#91D148] transition-colors"></div>
                        <button onClick={() => { setSpeakerEditMode('single'); setSelectedSpeaker(item.user); setEditingScriptId(item.id); setIsModalOpen(true); }} className="font-bold text-gray-900 text-sm flex items-center gap-1.5 hover:text-[#91D148] transition-colors group mb-1 focus:outline-none">{item.user}<svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#91D148]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                        <div className="text-[15px] text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl group-hover:bg-[#F4F9ED]/60 transition-all">{item.text}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* 녹음 상태바 */}
              <div className="flex justify-center w-full px-4 mb-8 shrink-0">
                <div className="flex items-center bg-[#F1F3F5] rounded-full px-10 py-2.5 shadow-sm border border-gray-200 gap-6">
                  <div className="text-[#495057] font-mono font-bold text-[17px] tracking-tight">{formatTime(recordingTime)}</div>
                  <div className="w-[1.5px] h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-[4px] h-5 w-[180px] justify-center">
                    {waveforms.map((height, i) => (<div key={i} style={{ height: `${height}px` }} className="w-[2.5px] bg-[#ADB5BD] rounded-full transition-all duration-500"></div>))}
                  </div>
                  <div className="w-[1.5px] h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setIsRecording(!isRecording)} className="text-gray-500 hover:text-gray-800">{isRecording ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="10" y1="4" x2="10" y2="20"></line><line x1="14" y1="4" x2="14" y2="20"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>}</button>
                    <button onClick={() => { setIsStopModalOpen(true); }} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50 shadow-sm"><div className="w-2.5 h-2.5 bg-[#FF6B6B] rounded-sm"></div><span className="text-[13px] font-bold text-[#495057]">녹음 종료</span></button>
                  </div>
                </div>
              </div>
            </div>

            {/* 💡 우측 사이드 패널: 별도 독립 스크롤 */}
            <div className="w-full lg:w-[420px] bg-[#F4F9ED] flex flex-col shadow-inner overflow-hidden shrink-0 min-h-0 relative rounded-tr-[24px] rounded-br-[24px]">
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
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6 min-h-0">
                {activeSideTab === "keywords" ? (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in pb-10 overflow-y-auto no-scrollbar">
                    {meetingKeywords.length === 0 ? <div className="col-span-2 flex items-center justify-center h-full text-gray-400 font-bold">키워드 추출 중...</div> : meetingKeywords.map((kw, idx) => (
                      <div key={idx} onClick={() => { setActiveSideTab("keyword-search"); setSearchTerm(kw); }} className="bg-gray-200/80 border border-gray-300 py-6 px-4 rounded-[20px] flex items-center justify-center shadow-sm hover:bg-[#91D148] hover:text-white cursor-pointer group animate-fade-in-up"><span className="text-[16px] font-black text-gray-800 group-hover:text-white break-all">{kw}</span></div>
                    ))}
                  </div>
                ) : activeSideTab === "keyword-search" ? (
                  <div className="space-y-6 animate-fade-in overflow-y-auto no-scrollbar pt-2 h-full">
                    {filteredLogs.length === 0 ? <div className="flex items-center justify-center h-full text-gray-400 font-bold">결과가 없습니다.</div> : filteredLogs.map((log) => (
                      <div key={log.id} className="p-6 border-l-[6px] border-[#91D148] rounded-2xl bg-white space-y-4 shadow-sm animate-fade-in-up">
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
                  <div className="flex flex-col h-full animate-fade-in w-full min-h-0">
                    <div className="flex-1 overflow-y-auto space-y-5 p-1 no-scrollbar pb-4">
                      {chatList.map((chat) => (
                        <div key={chat.id} className={`flex flex-col animate-fade-in-up ${chat.sender === "me" ? "items-end" : "items-start"}`}>
                          <div className="flex items-end gap-2 max-w-[90%]">
                            {chat.sender === "me" && <span className="text-[10px] text-gray-400 mb-1">{chat.time}</span>}
                            <div className={`p-4 rounded-[20px] text-[14px] font-bold shadow-sm leading-relaxed ${ chat.sender === "me" ? "bg-[#91D148] text-white rounded-tr-none" : "bg-white text-gray-800" }`}>{chat.text}</div>
                          </div>
                        </div>
                      ))}
                      {isBaraTyping && (
                        <div className="flex flex-col items-start animate-fade-in mt-2">
                          <div className="px-5 py-4 rounded-[20px] bg-white text-gray-800 shadow-sm flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-[#91D148]/60 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-[#91D148]/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 bg-[#91D148]/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="mt-auto pt-4 shrink-0">
                      <div className="relative flex items-center w-full">
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (!isComposing && e.key === "Enter") handleSendMessage(); }} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} placeholder="바라에게 물어보세요" disabled={isBaraTyping} className="w-full bg-white border-2 border-[#91D148]/30 rounded-2xl py-3 pl-4 pr-12 text-sm font-bold focus:border-[#91D148] outline-none shadow-sm disabled:bg-gray-50" />
                        <button onClick={handleSendMessage} disabled={isBaraTyping} className="absolute right-1.5 w-9 h-9 bg-[#91D148] text-white rounded-xl flex items-center justify-center hover:bg-[#82bd41] shadow-sm disabled:bg-gray-300 transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>
                      </div>
                    </div>
                  </div>
                ) : activeSideTab === "speakers" ? (
                  <div className="space-y-4 animate-fade-in overflow-y-auto no-scrollbar pt-2">
                    {activeSpeakers.map((speakerName, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-[#91D148]/30 transition-all">
                        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-[#F4F9ED] rounded-full flex items-center justify-center text-[#91D148] font-bold">🔊</div><span className="font-bold text-gray-800 text-[15px]">{speakerName}</span></div>
                        <button onClick={() => { setSpeakerEditMode('bulk'); setSelectedSpeaker(speakerName); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-[#91D148] transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
      <MemberAddModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onAdd={handleAddMembers} />
      <SpeakerEditModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingScriptId(null); }} currentSpeaker={selectedSpeaker} meetingMembers={meetingMembers} mode={speakerEditMode} onSave={handleSpeakerChange} />

      {isStopModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          <div className="relative bg-white rounded-[24px] p-10 w-[420px] shadow-2xl text-center animate-fade-in">
            <h2 className="text-[20px] font-black text-gray-900 mb-4">녹음을 종료하시겠습니까?</h2>
            <p className="text-[13px] font-medium text-gray-600 mb-8 leading-relaxed">종료 후 지금까지 진행된 대화를 바탕으로<br />회의록이 자동으로 생성됩니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsStopModalOpen(false)} className="flex-1 py-3.5 bg-[#F1F3F5] text-[#495057] font-bold rounded-xl hover:bg-gray-200 transition-all">취소</button>
              <button onClick={() => { setIsStopModalOpen(false); setIsGenerating(true); setToastMessage("빠른 회의록 생성을 시작합니다! 🐹"); setToastSubMessage(""); setIsToastVisible(true); }} className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] transition-all shadow-md">네, 종료합니다</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickMeeting;