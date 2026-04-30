import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import SpeakerEditModal from "../../components/meetings/SpeakerEditModal";
import MemberAddModal from "../../components/meetings/MemberAddModal";
import Toast from "../../components/common/Toast"; 
import CapybaraZone from "../../components/common/CapybaraZone";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- 타입 정의 ---
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

interface Agenda {
  id: number;
  text: string;
  isCompleted: boolean;
  summary: string;
}

interface ScriptItem {
  id: number;
  time: number;
  user: string;
  text: string;
}

interface SummaryItem {
  time: number;
  title: string;
  content: string[];
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

  // 깨끗한 상태로 초기화 (더미 데이터 제거 완료)
  const [meetingTitle, setMeetingTitle] = useState("새로운 회의");
  const [meetingDate, setMeetingDate] = useState(new Date().toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
  const [meetingMembers, setMeetingMembers] = useState<string[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [liveScript, setLiveScript] = useState<ScriptItem[]>([]);
  const [fullSummary, setFullSummary] = useState<SummaryItem[]>([]);
  const [meetingKeywords, setMeetingKeywords] = useState<string[]>([]);
  const [meetingLogs, setMeetingLogs] = useState<MeetingLog[]>([]);

  // 발화자 수정 모드 구분용 (일괄 vs 개별)
  const [speakerEditMode, setSpeakerEditMode] = useState<'bulk' | 'single'>('bulk');
  const [editingScriptId, setEditingScriptId] = useState<number | null>(null);

  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isBaraTyping, setIsBaraTyping] = useState(false); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scriptEndRef = useRef<HTMLDivElement>(null); 

  const [isStopModalOpen, setIsStopModalOpen] = useState(false); 
  const [isCarryOverModalOpen, setIsCarryOverModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); 
  
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState(""); 

  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const [waveforms, setWaveforms] = useState<number[]>(Array(35).fill(4));
  const [isDeviationDetected, setIsDeviationDetected] = useState(false);
  const [currentBaraId, setCurrentBaraId] = useState("meeting_normal");

  const MEETING_TOTAL_TIME = 60 * 60; // 60분

  // STT (Web Speech API) 관련 Ref 및 상태
  const recognitionRef = useRef<any>(null);
  const [interimTranscript, setInterimTranscript] = useState("");

  const activeSpeakers = Array.from(new Set(liveScript.map(script => script.user)));
  const filteredLogs = meetingLogs.filter(log => log.title.includes(searchTerm) || log.keywords.some(k => k.includes(searchTerm)));

  const emitBara = (scenarioId: string, progress?: number, customMessage?: string, timeLeft?: string) => {
    const event = new CustomEvent('UPDATE_BARA', { detail: { scenarioId, progress, customMessage, timeLeft } });
    window.dispatchEvent(event);
  }

  const handleSpeakerChange = (newName: string) => {
    if (speakerEditMode === 'bulk') {
      setLiveScript(prev => prev.map(script => script.user === selectedSpeaker ? { ...script, user: newName } : script));
    } else if (speakerEditMode === 'single' && editingScriptId !== null) {
      setLiveScript(prev => prev.map(script => script.id === editingScriptId ? { ...script, user: newName } : script));
    }
  };

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => setIsToastVisible(false), 3000); 
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  // STT (Web Speech API) 세팅
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true; 
      recognitionRef.current.lang = 'ko-KR'; 

      recognitionRef.current.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (final) {
          setLiveScript(prev => [
            ...prev,
            {
              id: Date.now(),
              time: recordingTime, 
              user: "현장 음성", 
              text: final.trim()
            }
          ]);
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecording && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (e) { console.error(e); }
        }
      };
    } else {
      console.warn("이 브라우저는 Web Speech API를 지원하지 않습니다.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 타이머 및 STT 실행/중지 처리
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let waveformInterval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      waveformInterval = setInterval(() => {
        setWaveforms(Array(35).fill(0).map(() => Math.floor(Math.random() * 16) + 4));
      }, 200);

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) { /* 이미 실행중 */ }
      }
    } else {
      setWaveforms(Array(35).fill(4));
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }

    return () => {
      clearInterval(interval);
      clearInterval(waveformInterval);
    };
  }, [isRecording]);

  useEffect(() => {
    const completedCount = agendas.filter(a => a.isCompleted).length;
    const progress = agendas.length > 0 ? Math.floor((completedCount / agendas.length) * 100) : 0;
    
    const getVirtualTimeLeft = (sec: number) => {
      const remain = Math.max(MEETING_TOTAL_TIME - sec, 0);
      return `${Math.floor(remain / 60).toString().padStart(2, '0')}:${(remain % 60).toString().padStart(2, '0')}`;
    };

    const timeLeftStr = getVirtualTimeLeft(recordingTime);

    if (recordingTime >= MEETING_TOTAL_TIME && !isCarryOverModalOpen) {
      setIsCarryOverModalOpen(true);
    }

    if (!isGenerating && !isStopModalOpen) {
      emitBara(currentBaraId, progress, undefined, timeLeftStr);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingTime]);

  useEffect(() => {
    const completedCount = agendas.filter(a => a.isCompleted).length;
    const calculatedProgress = agendas.length > 0 ? Math.floor((completedCount / agendas.length) * 100) : 0;
    if (isGenerating) { emitBara("generating", calculatedProgress); return; }
    if (!isStopModalOpen && !isCarryOverModalOpen) emitBara(currentBaraId, calculatedProgress);
  }, [agendas, currentBaraId, isStopModalOpen, isCarryOverModalOpen, isGenerating]);

  useEffect(() => {
    setChatList([{ id: Date.now(), sender: "bara", text: "안녕하세요! 회의바라입니다. 무엇이든 물어보세요! 실시간으로 답변해 드릴게요. 🐹", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatList, isBaraTyping, activeSideTab]); 

  useEffect(() => {
    if (activeTab === "script") {
      scriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveScript, interimTranscript, activeTab]);

  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => navigate(`/meeting/${id}/result`), 5000); 
      return () => clearTimeout(timer);
    }
  }, [isGenerating, navigate, id]);
  
  // 💡 LLM 요약 상태 및 API 호출 함수 (Vite 환경변수 반영 & 에러 핸들링 강화)
  const [isSummarizing, setIsSummarizing] = useState(false);

  const generateLiveSummary = async () => {
    if (liveScript.length === 0) return;
    setIsSummarizing(true);
    const scriptText = liveScript.map((item) => `[${item.user}] ${item.text}`).join("\n");

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error("VITE_OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해 주세요.");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`, 
        },
        body: JSON.stringify({
          model: "gpt-5-mini", 
          response_format: { type: "json_object" }, 
          messages: [
            {
              role: "system",
              content: `당신은 회의 스크립트를 분석하는 전문 AI 어시스턴트입니다. 
제공된 대화 내용을 바탕으로 실시간 요약과 핵심 키워드를 JSON 형식으로만 반환하세요.
반드시 아래의 JSON 구조를 엄격하게 지켜주세요.
{
  "summary": [
    { "time": 0, "title": "안건 또는 주제명", "content": ["요약 포인트 1", "요약 포인트 2"] }
  ],
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`
            },
            { role: "user", content: scriptText },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API 오류: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const parsedData = JSON.parse(data.choices[0].message.content);

      if (parsedData.summary) setFullSummary(parsedData.summary);
      if (parsedData.keywords) setMeetingKeywords(parsedData.keywords);

      setToastMessage("AI 실시간 요약이 업데이트되었습니다! ✨");
      setIsToastVisible(true);
    } catch (error: any) {
      console.error("LLM 요약 중 에러 발생:", error);
      setToastMessage(`요약 실패: ${error.message}`);
      setIsToastVisible(true);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage = inputValue;
    setChatList(prev => [...prev, { id: Date.now(), sender: "me", text: userMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInputValue("");
    setIsBaraTyping(true);

    setTimeout(() => {
      let responseText = "지금 진행 중인 내용에 집중해서 듣고 있어요! 도움이 필요하면 구체적으로 말씀해주세요. 🐹";
      if (userMessage.includes("요약")) responseText = "지금까지 진행된 내용을 분석하여 요약 중입니다! 📝";
      else if (userMessage.includes("안건") || userMessage.includes("진행")) {
        const completed = agendas.filter(a => a.isCompleted).length;
        const nextAgenda = agendas.find(a => !a.isCompleted)?.text || "없음";
        responseText = `현재 총 ${agendas.length}개의 안건 중 ${completed}개가 완료되었어요. 다음 다룰 안건은 '${nextAgenda}' 입니다. 🎯`;
      } else if (userMessage.includes("시간") || userMessage.includes("얼마나")) {
        responseText = `회의 시작 후 ${Math.floor(recordingTime / 60)}분 ${recordingTime % 60}초 경과했습니다. 좋은 페이스네요! ⏱️`;
      } else {
        const randomResponses = ["네, 확인했습니다! 이 부분은 나중에 회의록 키워드에 잘 정리해 둘게요. ✨", "음, 그 부분은 발화자 분이 좀 더 명확히 말씀해주시면 기록하기 좋을 것 같아요! 👀", "대화 흐름을 놓치지 않고 꼼꼼히 듣고 있습니다. 🐹"];
        responseText = randomResponses[Math.floor(Math.random() * randomResponses.length)];
      }
      setIsBaraTyping(false);
      setChatList(prev => [...prev, { id: Date.now(), sender: "bara", text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500); 
  };

  const handleAddMembers = (selected: any[]) => setMeetingMembers(prev => Array.from(new Set([...prev, ...selected.map(m => m.name)])));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const unresolvedAgendasCount = agendas.filter(a => !a.isCompleted).length;

  return (
    <>
      <PageMeta title={`실시간 회의 - ${id}`} description="실시간 회의 진행 화면" />
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
              <img src="/images/bara/Bara_Load.gif" alt="열심히 요약 중인 바라" className="w-full object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}/>
              <div className="hidden text-6xl">🐹📝</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 h-screen bg-white overflow-hidden relative p-6">
          <div className="flex-1 flex flex-col gap-6 p-4 overflow-hidden">
            <div className={`rounded-2xl p-6 space-y-4 shadow-sm border transition-colors duration-500 ${isDeviationDetected ? 'bg-red-50 border-red-200' : 'bg-[#F4F9ED] border-[#91D148]/10'} shrink-0`}>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{meetingTitle}</h1>
                {isDeviationDetected && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black animate-bounce shadow-md">안건 이탈 주의!</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {meetingMembers.length > 0 ? meetingMembers.map(name => (
                  <div key={name} className="relative group">
                    <span className="px-4 py-1.5 bg-white text-[#91D148] border border-[#91D148]/20 font-bold rounded-lg shadow-sm flex items-center transition-all group-hover:pr-8">{name}</span>
                    <button onClick={() => setMeetingMembers(prev => prev.filter(n => n !== name))} className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#91D148] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                  </div>
                )) : (
                  <span className="text-gray-400 text-sm font-medium">참석자가 없습니다.</span>
                )}
                <span onClick={() => setIsMemberModalOpen(true)} className="text-gray-400 ml-2 cursor-pointer hover:text-[#91D148] font-medium">+ 회의자 추가</span>
                <span className="ml-auto text-gray-500 font-bold px-1 text-[13px]">{meetingDate}</span>
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
                  {agendas.length > 0 ? agendas.map((agenda) => (
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
                  )) : (
                    <div className="flex justify-center items-center h-40 text-gray-400 font-bold">등록된 안건이 없습니다.</div>
                  )}
                </section>
              ) : activeTab === "live-summary" ? (
                <div className="animate-fade-in space-y-8">
                  <div className="flex items-center justify-between gap-2 bg-[#F4F9ED]/50 p-4 rounded-xl border border-[#91D148]/10 mb-6">
                    <div className="flex items-center gap-2 text-[#91D148] font-bold">
                      <span className="text-xl">💡</span>
                      <p>AI가 대화 흐름을 파악하여 실시간으로 요약하고 있습니다.</p>
                    </div>
                    
                    <button 
                      onClick={generateLiveSummary}
                      disabled={isSummarizing || liveScript.length === 0}
                      className="px-4 py-2 bg-white border border-[#91D148] text-[#91D148] rounded-lg font-bold shadow-sm hover:bg-[#91D148] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSummarizing ? "분석 중..." : "AI 최신화 🔄"}
                    </button>
                  </div>
                  {fullSummary.length > 0 ? fullSummary.map((summary, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-gray-100 text-gray-600 font-medium animate-fade-in-up">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#91D148] rounded-full border-4 border-white"></div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">{summary.title}</h3>
                      <ul className="list-disc list-inside space-y-2 ml-2">
                        {summary.content.map((txt, i) => <li key={i}>{txt}</li>)}
                      </ul>
                    </div>
                  )) : (
                    <div className="text-center text-gray-400 font-bold mt-10">요약될 내용이 아직 없습니다. 회의를 진행해 주세요!</div>
                  )}
                </div>
              ) : activeTab === "script" ? (
                <div className="animate-fade-in relative pl-4 border-l border-gray-100 ml-2 space-y-6 pb-10">
                  {liveScript.length > 0 ? liveScript.map((item) => (
                    <div key={item.id} className="group relative space-y-2 animate-fade-in-up">
                      <div className="absolute -left-[21px] top-2 w-3 h-3 bg-white border-2 border-gray-200 rounded-full group-hover:border-[#91D148] transition-colors"></div>
                      <button 
                        onClick={() => {
                          setSpeakerEditMode('single');
                          setSelectedSpeaker(item.user);
                          setEditingScriptId(item.id);
                          setIsModalOpen(true);
                        }}
                        className="font-bold text-gray-900 text-sm flex items-center gap-1.5 hover:text-[#91D148] transition-colors group mb-1 focus:outline-none"
                      >
                        {item.user}
                        <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#91D148]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <div className="text-[15px] text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl group-hover:bg-[#F4F9ED]/60 transition-all">{item.text}</div>
                    </div>
                  )) : (
                    <div className="text-gray-400 font-bold pt-10 text-center">말씀을 시작하시면 여기에 텍스트가 표시됩니다.</div>
                  )}

                  {isRecording && interimTranscript && (
                     <div className="group relative space-y-2 animate-fade-in">
                       <div className="absolute -left-[21px] top-2 w-3 h-3 bg-[#91D148] border-2 border-white rounded-full animate-pulse"></div>
                       <div className="font-bold text-gray-400 text-sm mb-1">인식 중...</div>
                       <div className="text-[15px] text-gray-500 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-dashed border-[#91D148]/50 italic">
                         {interimTranscript}
                       </div>
                     </div>
                  )}
                  <div ref={scriptEndRef} />
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
                  <button onClick={() => setIsRecording(!isRecording)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    {isRecording ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="10" y1="4" x2="10" y2="20"></line><line x1="14" y1="4" x2="14" y2="20"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>}
                  </button>
                  <button 
                    onClick={() => { setIsStopModalOpen(true); }} 
                    className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50 shadow-sm transition-colors"
                  >
                    <div className="w-2.5 h-2.5 bg-[#FF6B6B] rounded-sm"></div><span className="text-[13px] font-bold text-[#495057]">녹음 종료</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

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
                    {meetingKeywords.map(tag => (
                      <button key={tag} onClick={() => setSearchTerm(tag)} className={`px-3 py-1.5 rounded-full text-[12px] font-extrabold transition-all border ${searchTerm === tag ? "bg-[#91D148] text-white border-[#91D148]" : "bg-gray-200 text-gray-600 border-transparent hover:bg-gray-300"}`}>{tag}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
              {activeSideTab === "keywords" ? (
                <div className="grid grid-cols-2 gap-4 animate-fade-in pb-10 overflow-y-auto no-scrollbar">
                  {meetingKeywords.length > 0 ? meetingKeywords.map((kw, idx) => (
                    <div key={idx} onClick={() => { setActiveSideTab("keyword-search"); setSearchTerm(kw); }} className="bg-gray-200/80 border border-gray-300 py-6 px-4 rounded-[20px] flex items-center justify-center shadow-sm hover:bg-[#91D148] hover:text-white cursor-pointer group">
                      <span className="text-[16px] font-black text-gray-800 group-hover:text-white break-all">{kw}</span>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center text-gray-400 font-bold mt-10">생성된 키워드가 없습니다.</div>
                  )}
                </div>
              ) : activeSideTab === "keyword-search" ? (
                <div className="space-y-6 animate-fade-in overflow-y-auto no-scrollbar pt-2">
                  {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                    <div key={log.id} className="p-6 border-l-[6px] border-[#91D148] rounded-2xl bg-white space-y-4 shadow-sm">
                      <h4 className="font-black text-[17px] text-gray-900 leading-tight">{log.title}</h4>
                      <div className="text-[12px] space-y-1.5 text-gray-800">
                        <p className="flex font-bold"><span className="w-14 text-gray-500 font-medium">날짜:</span> {log.date}</p>
                        <p className="flex font-bold"><span className="w-14 text-gray-500 font-medium">키워드:</span> <span className="text-[#91D148] font-black">{log.keywords.join(", ")}</span></p>
                        <div className="mt-4 p-4 bg-[#F4F9ED]/50 rounded-xl border border-[#91D148]/10 text-[13px] italic">" {log.content} "</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-gray-400 font-bold mt-10">검색 결과가 없습니다.</div>
                  )}
                </div>
              ) : activeSideTab === "chat" ? (
                <div className="flex flex-col h-full animate-fade-in w-full">
                  <div className="flex-1 overflow-y-auto space-y-5 p-1 no-scrollbar pb-4">
                    {chatList.map((chat) => (
                      <div key={chat.id} className={`flex flex-col ${chat.sender === "me" ? "items-end" : "items-start"}`}>
                        {chat.sender === "bara" && <span className="text-[11px] font-black text-[#91D148] mb-1 ml-1">BARA 🐹</span>}
                        <div className="flex items-end gap-2 max-w-[90%]">
                          {chat.sender === "me" && <span className="text-[10px] text-gray-400 mb-1">{chat.time}</span>}
                          <div className={`p-4 rounded-[20px] text-[14px] font-bold shadow-md leading-relaxed ${chat.sender === "me" ? "bg-[#91D148] text-white rounded-tr-none" : chat.text.includes("🚨") || chat.text.includes("😡") ? "bg-red-500 text-white rounded-tl-none" : "bg-white text-gray-800 rounded-tl-none border border-[#91D148]/10"}`}>{chat.text}</div>
                        </div>
                      </div>
                    ))}
                    {isBaraTyping && (
                      <div className="flex flex-col items-start animate-fade-in mt-2">
                        <span className="text-[11px] font-black text-[#91D148] mb-1 ml-1">BARA 🐹</span>
                        <div className="px-5 py-4 rounded-[20px] bg-white text-gray-800 rounded-tl-none border border-[#91D148]/10 shadow-sm flex items-center gap-1.5">
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
                      <input 
                        type="text" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        onKeyDown={(e) => { if (!isComposing && e.key === "Enter") handleSendMessage(); }} 
                        onCompositionStart={() => setIsComposing(true)} 
                        onCompositionEnd={() => setIsComposing(false)} 
                        placeholder="바라에게 물어보세요" 
                        disabled={isBaraTyping}
                        className="w-full bg-white border-2 border-[#91D148]/30 rounded-2xl py-3 pl-4 pr-12 text-sm font-bold focus:border-[#91D148] outline-none shadow-sm disabled:bg-gray-50" 
                      />
                      <button onClick={handleSendMessage} disabled={isBaraTyping} className="absolute right-1.5 w-9 h-9 bg-[#91D148] text-white rounded-xl flex items-center justify-center hover:bg-[#82bd41] shadow-sm disabled:bg-gray-300 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeSideTab === "speakers" ? (
                <div className="space-y-4 animate-fade-in overflow-y-auto no-scrollbar pt-2">
                  {activeSpeakers.length > 0 ? activeSpeakers.map((speakerName, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-[#91D148]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#F4F9ED] rounded-full flex items-center justify-center text-[#91D148] font-bold">🔊</div>
                        <span className="font-bold text-gray-800 text-[15px]">{speakerName}</span>
                      </div>
                      <button onClick={() => { setSpeakerEditMode('bulk'); setSelectedSpeaker(speakerName); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-[#91D148] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                    </div>
                  )) : (
                    <div className="text-center text-gray-400 font-bold mt-10">참여한 발화자가 없습니다.</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      
      <MemberAddModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onAdd={handleAddMembers} />
      <SpeakerEditModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingScriptId(null); }} 
        currentSpeaker={selectedSpeaker} 
        meetingMembers={meetingMembers}
        mode={speakerEditMode}
        onSave={handleSpeakerChange} 
      />

      {isStopModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          <div className="relative bg-white rounded-[24px] p-10 w-[420px] shadow-2xl text-center animate-fade-in">
            <h2 className="text-[20px] font-black text-gray-900 mb-4">녹음을 종료하시겠습니까?</h2>
            {unresolvedAgendasCount > 0 ? (
              <div className="mb-8">
                <p className="text-[14px] font-black text-red-500 mb-2 flex items-center justify-center gap-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  미해결 안건이 {unresolvedAgendasCount}개 남아있습니다!
                </p>
                <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                  지금 종료하시면 남은 안건은 <span className="font-bold text-gray-800">미결정 상태로 이월</span>되며,<br />이후 회의록이 자동으로 생성됩니다.
                </p>
              </div>
            ) : (
              <p className="text-[13px] font-medium text-gray-600 mb-8 leading-relaxed">
                모든 안건이 성공적으로 완료되었습니다! 🎉<br />종료 후 회의록이 자동으로 생성됩니다.
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setIsStopModalOpen(false)} className="flex-1 py-3.5 bg-[#F1F3F5] text-[#495057] font-bold rounded-xl hover:bg-gray-200 transition-all">아니오</button>
              <button 
                onClick={() => { 
                  setIsStopModalOpen(false); 
                  setIsGenerating(true); 
                  setCurrentBaraId("generating"); 
                  setToastMessage(unresolvedAgendasCount > 0 ? "미결정 안건을 이월하고 회의록을 생성합니다! 🐹" : "회의록 생성을 시작합니다! 🐹");
                  setToastSubMessage("");
                  setIsToastVisible(true);
                }} 
                className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] transition-all shadow-md"
              >네, 종료합니다</button>
            </div>
          </div>
        </div>
      )}

      {isCarryOverModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          <div className="relative bg-white rounded-[24px] p-10 w-[420px] shadow-2xl text-center animate-fade-in">
            <h2 className="text-[20px] font-black text-gray-900 mb-3">⏰ 지정된 회의 시간이 종료되었습니다.</h2>
            <p className="text-[14px] font-medium text-gray-600 mb-8 leading-relaxed">
              회의를 마무리하고 하단의 <strong className="text-red-500">[녹음 종료]</strong> 버튼을<br />직접 눌러 회의록을 생성해 주세요.
            </p>
            <div className="flex justify-center">
              <button onClick={() => setIsCarryOverModalOpen(false)} className="w-full py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] shadow-[0_4px_12px_rgba(145,209,72,0.3)] transition-all">확 인</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveMeeting;