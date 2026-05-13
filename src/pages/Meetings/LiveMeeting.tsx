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

interface ChatMessage {
  id: number;
  sender: "me" | "bara" | "other";
  text: string;
  time: string;
  user?: string;
  target?: string;
}

interface Agenda {
  id: number;
  text: string;
  isCompleted: boolean;
  summary?: string;
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
  
  const [role, setRole] = useState<'host' | 'participant'>('host');
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(true);
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  
  const [chatTab, setChatTab] = useState<'general' | 'ai'>('general');
  const [chatTarget, setChatTarget] = useState("all"); 

  const [meetingTitle, setMeetingTitle] = useState("[주간 정기] 신규 프로젝트 UI/UX 개선안 검토 회의");
  const [meetingDate, setMeetingDate] = useState(new Date().toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
  const [meetingMembers, setMeetingMembers] = useState<string[]>(["김철수", "이영희", "박지민"]);
  
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [speakerEditMode, setSpeakerEditMode] = useState<'bulk' | 'single'>('single');
  const [editingScriptId, setEditingScriptId] = useState<number | null>(null);

  const [isStopModalOpen, setIsStopModalOpen] = useState(false); 
  const [isCarryOverModalOpen, setIsCarryOverModalOpen] = useState(false);
  const [hasShownCarryOverWarning, setHasShownCarryOverWarning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); 
  
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState(""); 

  const [agendas, setAgendas] = useState<Agenda[]>([
    { id: 1, text: "[미결정] 이전 회의록 기반 알림센터 통합안 리뷰", isCompleted: true },
    { id: 2, text: "[신규] 메인 피드 레이아웃 B안 확정 여부 논의", isCompleted: false },
    { id: 3, text: "[신규] 옵셔널 설정 유도 팝업 UX 논의", isCompleted: false },
    { id: 4, text: "[신규] 추가 지표 도입 우선순위 결정", isCompleted: false },
  ]);
  const [activeAgendaId, setActiveAgendaId] = useState<number>(2);
  const [liveScript, setLiveScript] = useState<ScriptItem[]>([]);
  const [fullSummary, setFullSummary] = useState<SummaryItem[]>([]);
  const [meetingKeywords, setMeetingKeywords] = useState<string[]>([]);
  
  const [teamChatList, setTeamChatList] = useState<ChatMessage[]>([]);
  const [baraChatList, setBaraChatList] = useState<ChatMessage[]>([
    { id: 1, sender: "bara", text: "안녕하세요! 회의바라입니다. 무엇이든 물어보세요! 실시간으로 답변해 드릴게요. 🐹", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isBaraTyping, setIsBaraTyping] = useState(false); 

  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const [waveforms, setWaveforms] = useState<number[]>(Array(35).fill(4));
  const [currentBaraId, setCurrentBaraId] = useState("meeting_normal");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const MEETING_TOTAL_TIME = 60 * 60; // 60분

  const recognitionRef = useRef<any>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isAgendaDropdownOpen, setIsAgendaDropdownOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const scriptEndRef = useRef<HTMLDivElement>(null); 
  
  const recordingTimeRef = useRef(0);

  // ---------------------------------------------------------
  // 🎥 [데모 전용] 가상 커서 및 자동 조작 로직
  // ---------------------------------------------------------
  const [cursor, setCursor] = useState({ x: -100, y: -100, visible: false, clicking: false });

  useEffect(() => {
    let isCancelled = false;
    
    // 💡 딜레이를 주는 핵심 함수
    const wait = async (ms: number) => {
      await new Promise(res => setTimeout(res, ms));
      if (isCancelled) throw new Error("cancelled");
    };

    // 마우스를 타겟 ID로 이동 (기본 이동 애니메이션 대기 포함)
    const moveCursor = async (elementId: string) => {
      const el = document.getElementById(elementId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCursor(prev => ({ ...prev, visible: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
      }
      await wait(500); 
    };

    // 마우스를 임의의 좌표(x, y)로 이동
    const moveCursorCoords = async (x: number, y: number) => {
      setCursor(prev => ({ ...prev, visible: true, x, y }));
      await wait(500);
    };

    // 마우스 클릭 모션 (크기 축소 및 파동)
    const clickCursor = async () => {
      setCursor(prev => ({ ...prev, clicking: true }));
      await wait(200);
      setCursor(prev => ({ ...prev, clicking: false }));
      await wait(200); // 클릭 완료 후 약간의 텀
    };

    const runDemo = async () => {
      try {
        // ==========================================
        // 👑 [주최자 뷰 시나리오] - (채팅 시연 없음)
        // ==========================================
        await wait(4500); // 2초 대기 후 시작
        
        await moveCursor("demo-briefing-btn");
        await clickCursor();
        setIsBriefingModalOpen(false);

        await wait(1800); // 다음 액션까지 1.5초 대기
        await moveCursor("demo-header-dropdown");
        await clickCursor();
        setIsHeaderDropdownOpen(true);

        await wait(1800);
        await moveCursor("demo-add-member");
        await clickCursor();
        setIsMemberModalOpen(true);

        await wait(1800);
        await moveCursorCoords(window.innerWidth / 2, window.innerHeight / 2 + 50);
        await clickCursor();
        handleAddMembers([{ name: "최유진" }, { name: "강동원" }]);
        setIsMemberModalOpen(false);

        await wait(1800);
        await moveCursor("demo-header-dropdown");
        await clickCursor();
        setIsHeaderDropdownOpen(false);

        await wait(1800);
        await moveCursor("demo-agenda-input-2");
        await clickCursor();
        
        // 안건 입력 시연 (글자당 50ms 딜레이)
        setAgendas(prev => prev.map(a => a.id === 2 ? { ...a, text: "" } : a));
        const textToType = "[신규] 추가 레이아웃 논의";
        let currentString = "";
        for (const char of textToType) {
          currentString += char;
          setAgendas(prev => prev.map(a => a.id === 2 ? { ...a, text: currentString } : a));
          await wait(50); // 💡 글자 타이핑 속도 조절
        }

        await wait(2000);
        await moveCursor("demo-agenda-btn-2");
        await clickCursor();
        setAgendas(prev => prev.map(a => a.id === 2 ? { ...a, isCompleted: true } : a));

        await wait(2000);
        await clickCursor(); // 제자리 클릭 (토글)
        setAgendas(prev => prev.map(a => a.id === 2 ? { ...a, isCompleted: false } : a));
        setCursor(prev => ({ ...prev, visible: false }));

        // ==========================================
        // 🙋‍♂️ [참여자 뷰 시나리오]
        // ==========================================
        await wait(20000); // 이전 데모 흐름(확장 기능 시연 등) 대기
        setCursor(prev => ({ ...prev, clicking: true }));
        await moveCursor("demo-role-participant-btn");
        await clickCursor();
        setRole('participant');
        setChatTab('general'); // 진입 시 기본적으로 제너럴(팀원 코멘트) 탭

        await wait(1800);
        await moveCursor("demo-agenda-dropdown-header");
        await clickCursor();
        setIsAgendaDropdownOpen(true);

        await wait(1800);
        await clickCursor(); // 제자리 클릭
        setIsAgendaDropdownOpen(false);

        // 실시간 STT 기록 시뮬레이션
        await wait(1800);
        setLiveScript(prev => [
          ...prev,
          { id: Date.now(), time: recordingTimeRef.current, user: "박지민", text: "이번 B안의 피드 레이아웃에서 여백이 너무 좁은 것 같아요." },
          { id: Date.now() + 1, time: recordingTimeRef.current + 2, user: "이영희", text: "맞아요. 모바일 가독성을 고려해서 8px 정도 늘리는 건 어떨까요?" }
        ]);

        // AI 실시간 요약 및 키워드 출력
        await wait(2500);
        setFullSummary([{ time: 0, title: "메인 피드 레이아웃 논의", content: ["피드 여백 협소 문제 제기", "모바일 가독성 개선 위해 여백 8px 확대 제안"] }]);
        setMeetingKeywords(["여백", "가독성", "모바일_UX"]);
        setToastMessage("AI 실시간 요약이 업데이트되었습니다! ✨");
        setIsToastVisible(true);

        // 💡 [복구완료] 참여자 뷰에서 일반 팀원 코멘트 작성 시연
        await wait(2000);
        await moveCursor("demo-chat-input");
        await clickCursor();
        
        const generalChatText = "저도 동의합니다!";
        const inputElGen = document.getElementById("demo-chat-input") as HTMLInputElement;
        const nativeInputValueSetterGen = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        let genStr = "";
        
        for (const char of generalChatText) {
          genStr += char;
          setInputValue(genStr);
          if (inputElGen && nativeInputValueSetterGen) {
            nativeInputValueSetterGen.call(inputElGen, genStr);
            inputElGen.dispatchEvent(new Event("input", { bubbles: true }));
          }
          await wait(50); 
        }

        await wait(1500);
        await moveCursor("demo-chat-send-btn");
        await clickCursor();
        document.getElementById("demo-chat-send-btn")?.click(); 

        // 💡 팀원 코멘트 전송 후 '바라에게 질문' 탭으로 이동
        await wait(2000);
        await moveCursor("demo-ai-tab-btn");
        await clickCursor();
        setChatTab('ai');

        await wait(1500);
        await moveCursor("demo-chat-input");
        await clickCursor();
        
        // 바라 채팅창 타이핑 시연
        const wikiQuery = "팀 위키에서 UI 가이드라인 찾아줘";
        const inputEl = document.getElementById("demo-chat-input") as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        let queryStr = "";
        
        for (const char of wikiQuery) {
          queryStr += char;
          setInputValue(queryStr);
          
          if (inputEl && nativeInputValueSetter) {
            nativeInputValueSetter.call(inputEl, queryStr);
            inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          }
          await wait(50); // 💡 글자 타이핑 속도 조절
        }

        await wait(1800);
        await moveCursor("demo-chat-send-btn");
        await clickCursor();
        document.getElementById("demo-chat-send-btn")?.click(); // 실제 전송 트리거

        // 카피바라 상태 변화 시연
        await wait(4000);
        setCurrentBaraId("meeting_caution");

        await wait(3000);
        setCurrentBaraId("meeting_warning");

        await wait(3000);
        setCurrentBaraId("meeting_normal");

        // ==========================================
        // 🔄 [다시 주최자 뷰 전환 및 종료 시나리오]
        // ==========================================
        await wait(2000);
        setCursor(prev => ({ ...prev, visible: true }));
        await moveCursor("demo-role-host-btn");
        await clickCursor();
        setRole('host');
        setChatTab('general');

        await wait(2500); // 전환 후 자연스럽게 잠시 화면을 보여주며 대기

        // 바로 종료 버튼으로 이동
        await moveCursor("demo-stop-recording-btn");
        await clickCursor();
        setIsStopModalOpen(true);

        await wait(1800);
        await moveCursor("demo-confirm-stop-btn");
        await clickCursor();
        setIsStopModalOpen(false);
        setIsGenerating(true);
        setCurrentBaraId("generating");
        setCursor(prev => ({ ...prev, visible: false }));

      } catch (e: any) {
        if (e.message !== "cancelled") console.error(e);
      }
    };

    runDemo();

    return () => { isCancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ---------------------------------------------------------

  const currentAgenda = agendas.find(a => a.id === activeAgendaId) || agendas[0];
  const completedAgendasCount = agendas.filter(a => a.isCompleted).length;
  const progressPercent = agendas.length > 0 ? Math.round((completedAgendasCount / agendas.length) * 100) : 0;
  const unresolvedAgendasCount = agendas.length - completedAgendasCount;

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
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

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
              time: recordingTimeRef.current, 
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

  useEffect(() => {
    let interval: NodeJS.Timeout; let waveformInterval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      waveformInterval = setInterval(() => setWaveforms(Array(35).fill(0).map(() => Math.floor(Math.random() * 16) + 4)), 200);
      if (recognitionRef.current) { try { recognitionRef.current.start(); } catch (e) {} }
    } else {
      setWaveforms(Array(35).fill(4));
      if (recognitionRef.current) recognitionRef.current.stop();
    }
    return () => { clearInterval(interval); clearInterval(waveformInterval); };
  }, [isRecording]);

  useEffect(() => {
    const getVirtualTimeLeft = (sec: number) => {
      const remain = Math.max(MEETING_TOTAL_TIME - sec, 0);
      return `${Math.floor(remain / 60).toString().padStart(2, '0')}:${(remain % 60).toString().padStart(2, '0')}`;
    };
    const timeLeftStr = getVirtualTimeLeft(recordingTime);

    if (recordingTime >= MEETING_TOTAL_TIME && !hasShownCarryOverWarning) {
      setIsCarryOverModalOpen(true);
      setHasShownCarryOverWarning(true); 
    }

    if (!isGenerating && !isStopModalOpen) emitBara(currentBaraId, progressPercent, undefined, timeLeftStr);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingTime]);

  useEffect(() => {
    if (isGenerating) { emitBara("generating", progressPercent); return; }
    if (!isStopModalOpen && !isCarryOverModalOpen) emitBara(currentBaraId, progressPercent);
  }, [agendas, currentBaraId, isStopModalOpen, isCarryOverModalOpen, isGenerating, progressPercent]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [teamChatList, baraChatList, isBaraTyping, chatTab]); 
  useEffect(() => { scriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [liveScript, interimTranscript]);

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => setIsToastVisible(false), 3000); 
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => navigate(`/meeting/${id}/result`), 2000); 
      return () => clearTimeout(timer);
    }
  }, [isGenerating, navigate, id]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage = inputValue;

    const newMsg: ChatMessage = { 
      id: Date.now(), 
      sender: "me", 
      text: userMessage, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      target: chatTab === 'general' ? chatTarget : undefined 
    };

    if (chatTab === 'general') {
      setTeamChatList(prev => [...prev, newMsg]);
      setInputValue("");
    } else {
      setBaraChatList(prev => [...prev, newMsg]);
      setInputValue("");
      setIsBaraTyping(true);

      setTimeout(() => {
        let responseText = "지금 진행 중인 내용에 집중해서 듣고 있어요! 도움이 필요하면 구체적으로 말씀해주세요. 🐹";
        
        // 💡 데모 시연용 위키 답변 로직 적용
        if (userMessage.includes("위키") || userMessage.includes("가이드라인")) {
          responseText = "팀 위키에서 [UI/UX 디자인 가이드라인 v2.4] 문서를 찾았습니다. 피드 레이아웃의 경우 기본 여백을 16px로 권장하고 있으나, 모바일 사용성 개선 시 8px 단위 조절이 가능하다고 명시되어 있습니다. 📚";
        } else if (userMessage.includes("요약")) {
          responseText = "지금까지 진행된 내용을 분석하여 요약 중입니다! 📝";
        } else if (userMessage.includes("안건") || userMessage.includes("진행")) {
          const nextAgenda = agendas.find(a => !a.isCompleted)?.text || "없음";
          responseText = `현재 총 ${agendas.length}개의 안건 중 ${completedAgendasCount}개가 완료되었어요. 다음 다룰 안건은 '${nextAgenda}' 입니다. 🎯`;
        } else if (userMessage.includes("시간") || userMessage.includes("얼마나")) {
          responseText = `회의 시작 후 ${Math.floor(recordingTime / 60)}분 ${recordingTime % 60}초 경과했습니다. 좋은 페이스네요! ⏱️`;
        } else {
          const randomResponses = ["네, 확인했습니다! 이 부분은 나중에 회의록 키워드에 잘 정리해 둘게요. ✨", "음, 그 부분은 발화자 분이 좀 더 명확히 말씀해주시면 기록하기 좋을 것 같아요! 👀", "대화 흐름을 놓치지 않고 꼼꼼히 듣고 있습니다. 🐹"];
          responseText = randomResponses[Math.floor(Math.random() * randomResponses.length)];
        }
        
        setIsBaraTyping(false);
        setBaraChatList(prev => [...prev, { id: Date.now(), sender: "bara", text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }, 1500); 
    }
  };

  const generateLiveSummary = async () => {
    if (liveScript.length === 0) return;
    setIsSummarizing(true);
    const scriptText = liveScript.map((item) => `[${item.user}] ${item.text}`).join("\n");

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("VITE_OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해 주세요.");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini", 
          response_format: { type: "json_object" }, 
          messages: [
            {
              role: "system",
              content: `당신은 회의 스크립트를 분석하는 전문 AI 어시스턴트입니다. 제공된 대화 내용을 바탕으로 실시간 요약과 핵심 키워드를 JSON 형식으로만 반환하세요.
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

  const handleAgendaTextChange = (id: number, newText: string) => {
    setAgendas(prev => prev.map(a => a.id === id ? { ...a, text: newText } : a));
  };

  const handleAddMembers = (selected: any[]) => setMeetingMembers(prev => Array.from(new Set([...prev, ...selected.map(m => m.name)])));

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col font-sans overflow-hidden">
      <PageMeta title={`실시간 회의 - ${id}`} description="실시간 회의 진행 화면" />
      <Toast message={toastMessage} subMessage={toastSubMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      
      {/* 💡 렌더링 최상단에 데모용 가상 마우스 커서 부착 */}
      {cursor.visible && (
        <div
          style={{
            position: "fixed",
            top: cursor.y,
            left: cursor.x,
            width: "32px",
            height: "32px",
            pointerEvents: "none",
            zIndex: 999999,
            transform: `translate(-10%, -10%) ${cursor.clicking ? "scale(0.8)" : "scale(1)"}`,
            transition: "top 0.6s cubic-bezier(0.25, 1, 0.5, 1), left 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.1s",
          }}
        >
          <svg viewBox="0 0 24 24" fill="black" stroke="white" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4l5.5 17.5 3.5-7.5 7.5-3.5z" />
          </svg>
          {cursor.clicking && (
            <div className="absolute top-0 left-0 w-8 h-8 bg-[#91D148] opacity-60 rounded-full animate-ping" style={{ transform: 'translate(-25%, -25%)' }} />
          )}
        </div>
      )}

      <style>{`
        @keyframes walkBara {
          0% { left: 0%; transform: translateX(-50%); }
          100% { left: 100%; transform: translateX(-50%); }
        }
      `}</style>

      {role === 'host' && createPortal(
        <CapybaraZone 
          mode="floating" 
          teamChatList={teamChatList}
          inputValue={inputValue} 
          onInputChange={setInputValue} 
          onSendMessage={handleSendMessage}
          chatTarget={chatTarget}
          onChatTargetChange={setChatTarget}
          meetingMembers={meetingMembers}
        />, 
        document.body
      )}

      <header className="bg-[#CAE7A7] border-b border-black/5 flex items-center px-6 py-3 shrink-0 shadow-md justify-between h-[64px] relative z-[100]">
        <div className="flex flex-wrap items-center gap-3 relative">
          <div className="relative">
            {/* 💡 데모용 ID 부착 1 */}
            <button 
              id="demo-header-dropdown"
              onClick={() => setIsHeaderDropdownOpen(!isHeaderDropdownOpen)}
              className="bg-white px-4 py-2 rounded-lg shadow-sm border border-white/60 flex items-center h-[36px] gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <h1 className="text-[13px] font-black text-gray-900">{meetingTitle}</h1>
              <span className={`text-gray-500 text-[10px] transform transition-transform ${isHeaderDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {isHeaderDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-gray-200 shadow-xl rounded-2xl p-5 flex flex-col gap-4 z-50 animate-fade-in-up">
                <div>
                  {/* 💡 데모용 ID 부착 2 */}
                  <div className="text-[12px] font-black text-gray-400 mb-3 flex items-center gap-1">
                    👥 참여자 목록 
                    <button id="demo-add-member" onClick={() => setIsMemberModalOpen(true)} className="ml-2 text-[10px] text-[#91D148] hover:underline">+ 추가</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meetingMembers.map(name => (
                       <span key={name} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-[13px] font-bold border border-gray-200 shadow-sm">{name}</span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-1">
                  <button 
                    onClick={() => { setIsBriefingModalOpen(true); setIsHeaderDropdownOpen(false); }} 
                    className="w-full bg-[#F4F9ED] hover:bg-[#91D148] hover:text-white text-[#91D148] px-4 py-3 rounded-xl text-[13px] font-black transition-all flex items-center justify-center gap-2 shadow-sm border border-[#91D148]/20"
                  >
                    📄 회의 브리핑 카드 열기
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg shadow-sm border border-red-100 h-[36px]">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-black tracking-tight">녹음 중</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl shrink-0 border border-gray-200 shadow-inner">
            {/* 💡 데모용 ID 부착: 주최자 뷰 버튼 */}
            <button id="demo-role-host-btn" onClick={() => { setRole('host'); setChatTab('general'); }} className={`px-4 py-1.5 rounded-lg text-[12px] font-black transition-all ${role === 'host' ? 'bg-gray-200 shadow-inner text-[#6B8E23]' : 'bg-white shadow-sm text-gray-500 hover:text-gray-800'}`}>
              👑 주최자 뷰
            </button>
            <button id="demo-role-participant-btn" onClick={() => setRole('participant')} className={`px-4 py-1.5 rounded-lg text-[12px] font-black transition-all ${role === 'participant' ? 'bg-gray-200 shadow-inner text-blue-600' : 'bg-white shadow-sm text-gray-500 hover:text-gray-800'}`}>
              🙋 참여자 뷰
            </button>
          </div>
        </div>
      </header>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-white z-50 animate-fade-in">
          <h2 className="text-[32px] font-black text-gray-800 mb-4 tracking-widest">LOADING...</h2>
          <p className="text-gray-500 font-bold mb-16">회의록을 생성하고 있습니다 🐹</p>
          <div className="relative w-full max-w-[800px] h-2 bg-[#D6E6F5] rounded-full overflow-visible">
            <div className="absolute bottom-0 pb-2 flex justify-center items-end w-[120px]" style={{ animation: 'walkBara 4s linear infinite' }}>
              <img src="/images/bara/Bara_Load.gif" alt="요약 중" className="w-full object-contain drop-shadow-sm mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
              <div className="hidden text-6xl">🐹📝</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex bg-[#F8F9FA] p-6 gap-6 overflow-hidden relative z-10">
          
          {/* ========================================== */}
          {/* ⬅️ 좌측 패널 (주최자: 안건 / 참여자: 스크립트) */}
          {/* ========================================== */}
          <div className="w-[45%] flex flex-col bg-white rounded-[24px] shadow-sm border border-gray-200 shrink-0 relative">
            
            {role === 'host' ? (
              <>
                <div className="p-8 border-b border-gray-100 bg-white rounded-t-[24px] sticky top-0 z-10 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[17px] font-black text-gray-500 uppercase tracking-wider">안건 진행률</span>
                    <span className="text-[15px] font-black text-[#91D148]">{progressPercent}%</span>
                  </div>
                  
                  <div className="relative mt-8 mb-1 w-full -mt-[1px]">
                    <div className="absolute bottom-full -mb-3 -ml-8 transition-all duration-700 z-10" style={{ left: `${progressPercent}%` }}>
                        <img src="/images/bara/Bara_Load.gif" alt="Bara" className="w-13 h-13 object-contain filter drop-shadow-sm" />
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-[#5FBEE7] rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                  
                  <h2 className="text-[30px] font-black text-[#1a1a1a] leading-tight flex items-center gap-2 mt-3">
                    <span className="text-2xl"></span> {currentAgenda.text}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-3 bg-gray-50/30">
                  {agendas.map(agenda => {
                    const isActive = agenda.id === activeAgendaId;
                    return (
                      <div 
                        key={agenda.id} 
                        onClick={() => setActiveAgendaId(agenda.id)}
                        className={`p-3 px-3 rounded-2xl border-1 transition-all flex items-center gap-4 cursor-pointer group ${isActive ? 'border-[#91D148] bg-[#F4F9ED]/50 shadow-md scale-[1.01]' : 'border-gray-100 bg-white hover:border-[#CAE7A7]'}`}
                      >
                        <div className="flex-1 relative">
                          {/* 💡 데모용 ID 부착 3 */}
                          <input 
                            id={agenda.id === 2 ? "demo-agenda-input-2" : undefined}
                            type="text"
                            value={agenda.text}
                            onChange={(e) => handleAgendaTextChange(agenda.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()} 
                            className={`w-full bg-transparent border-none outline-none font-bold text-[15px] py-0 focus:ring-0 transition-colors ${agenda.isCompleted ? 'text-gray-300 line-through' : 'text-gray-800'}`}
                          />
                        </div>
                        {/* 💡 데모용 ID 부착 4 */}
                        <button 
                          id={agenda.id === 2 ? "demo-agenda-btn-2" : undefined}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAgendas(prev => prev.map(a => a.id === agenda.id ? { ...a, isCompleted: !a.isCompleted } : a));
                          }}
                          className={`text-[12px] font-black px-6 py-1.5 rounded-lg transition-all whitespace-nowrap ${agenda.isCompleted ? 'bg-gray-200 text-gray-500 shadow-inner' : 'bg-[#91D148] text-white hover:bg-[#7cb93b] shadow-sm'}`}
                        >
                          {agenda.isCompleted ? '완료됨' : '완료'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white rounded-b-[24px] shrink-0">
                  <div className="flex items-center bg-white w-full px-4 py-1 gap-4">
                    <div className="text-gray-500 font-mono font-black text-[24px] w-16 text-center">{formatTime(recordingTime)}</div>
                    <div className="flex items-center gap-1 h-3 flex-1 justify-center w-full">
                      {waveforms.slice(0, 30).map((h, i) => <div key={i} style={{ height: `${Math.min(h, 12)}px` }} className="w-[4px] bg-gray-300 rounded-full transition-all"></div>)}
                    </div>
                    <button onClick={() => setIsRecording(!isRecording)} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">{isRecording ? "⏸" : "▶"}</button>
                    {/* 💡 데모용 ID 부착: 녹음 종료 버튼 */}
                    <button 
                      id="demo-stop-recording-btn"
                      onClick={() => setIsStopModalOpen(true)} 
                      className="bg-white text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg font-black text-[12px] hover:bg-gray-50 hover:text-red-500 transition-all flex items-center gap-1"
                    >
                      <div className="w-2 h-2 bg-[#FF6B6B] square-sm"></div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div id="demo-agenda-dropdown-header" className="bg-[#F4F9ED]/50 border-b border-[#91D148]/10 px-8 min-h-[64px] py-4 rounded-t-[24px] shrink-0 flex items-center justify-between cursor-pointer select-none relative z-30" onClick={() => setIsAgendaDropdownOpen(!isAgendaDropdownOpen)}>
                  <div className="flex items-center gap-4 flex-1 pr-4">
                    <span className="text-[16px] font-black text-gray-900 whitespace-nowrap">현재 안건</span>
                    <h2 className="text-[16px] font-black text-[#4a6316] leading-snug break-keep">{currentAgenda.text}</h2>
                  </div>
                  <span className={`text-[#4a6316] font-bold text-[12px] transform transition-transform shrink-0 ${isAgendaDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  
                  {isAgendaDropdownOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl p-6 flex flex-col gap-3 animate-fade-in z-50 rounded-b-[24px]">
                      <div className="text-[12px] font-black text-gray-400 mb-1">전체 안건 리스트</div>
                      {agendas.map(a => (
                        <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border ${a.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 shadow-sm'}`}>
                          <span className="text-lg mt-0.5">{a.isCompleted ? '✅' : '⏳'}</span>
                          <span className={`text-[15px] font-bold ${a.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>{a.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 rounded-b-[24px] relative z-10">
                  {liveScript.length > 0 ? liveScript.map((item, index) => {
                    const isLatest = index === liveScript.length - 1 && !interimTranscript;
                    return (
                      <div key={item.id} className={`p-5 rounded-2xl border transition-all relative group animate-fade-in-up ${isLatest ? 'bg-white border-[#91D148]/30 shadow-sm' : 'bg-white border-gray-100 opacity-70'}`}>
                        <div className="font-black text-sm mb-2 flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setSpeakerEditMode('single');
                              setSelectedSpeaker(item.user);
                              setEditingScriptId(item.id);
                              setIsModalOpen(true);
                            }}
                            className={`flex items-center gap-1 hover:text-[#91D148] transition-colors focus:outline-none ${isLatest ? 'text-gray-900' : 'text-gray-600'}`}
                          >
                            {item.user} 
                            <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#91D148]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          </button>
                          <span className="text-gray-400 font-bold">{formatTime(item.time)}</span>
                        </div>
                        <p className={`font-bold text-[15px] ${isLatest ? 'text-gray-800' : 'text-gray-500'}`}>{item.text}</p>
                      </div>
                    );
                  }) : (
                     <div className="text-gray-400 font-bold pt-10 text-center">회의를 진행하시면 실시간 음성(STT)이 이곳에 기록됩니다.</div>
                  )}
                  {isRecording && interimTranscript && (
                    <div className="bg-[#F4F9ED]/40 p-5 rounded-2xl border border-dashed border-[#91D148]/50 shadow-sm">
                      <div className="font-black text-[#91D148] text-[12px] mb-2 animate-pulse">인식 중...</div>
                      <p className="text-gray-800 font-bold text-[15px]">{interimTranscript}</p>
                    </div>
                  )}
                  <div ref={scriptEndRef} />
                </div>
              </>
            )}
          </div>

          {/* ========================================== */}
          {/* ➡️ 중앙 패널: AI 실시간 요약 */}
          {/* ========================================== */}
          <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-8 min-h-[64px] py-4 border-b border-[#91D148]/10 bg-[#F4F9ED]/50 flex justify-between items-center shrink-0">
              <span className="text-[16px] font-black text-gray-900">실시간 요약</span>
              <button 
                onClick={generateLiveSummary}
                disabled={isSummarizing || liveScript.length === 0}
                className="flex items-center gap-2 bg-white px-7 py-1.5 rounded-full shadow-sm border border-[#91D148]/20 cursor-pointer hover:bg-[#CAE7A7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-[11px] font-black text-[#8A38F5]">{isSummarizing ? "분석 중..." : "동기화"}</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 flex flex-col bg-white">
              <div className="space-y-10 flex-1">
                {fullSummary.length > 0 ? fullSummary.map((s, i) => (
                  <div key={i} className="relative pl-8 border-l-4 border-[#CAE7A7] animate-fade-in">
                    <div className="absolute -left-[14px] top-0 w-6 h-6 bg-[#91D148] rounded-full border-4 border-white shadow-md"></div>
                    <h4 className="text-[18px] font-black text-gray-900 mb-4">{s.title}</h4>
                    <ul className="space-y-3">{s.content.map((c, j) => <li key={j} className="text-gray-600 font-bold text-[15px]">• {c}</li>)}</ul>
                  </div>
                )) : (
                  <div className="text-center text-gray-400 font-bold mt-10">요약될 내용이 아직 없습니다. 회의를 진행해 주세요!</div>
                )}
              </div>
              
              {meetingKeywords.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 shrink-0 animate-fade-in">
                  <h5 className="text-[13px] font-black text-gray-400 mb-3 uppercase tracking-wider">주요 도출 키워드</h5>
                  <div className="flex flex-wrap gap-2">
                    {meetingKeywords.map((kw, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-[13px] font-bold border border-gray-200">#{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* 💬 우측 사이드바 (참여자 뷰 전용) */}
          {/* ========================================== */}
          {role === 'participant' && (
            <aside className="w-[360px] bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden shrink-0">
              <div className="h-[220px] w-full bg-[#F4F9ED] border-b border-[#91D148]/20 relative overflow-hidden shrink-0 flex items-center justify-center">
                <div className="w-full h-full relative flex items-center justify-center">
                  <CapybaraZone mode="embedded" />
                </div>
              </div>

              <div className="flex border-b border-gray-100 p-2 gap-2 bg-white shrink-0">
                <button onClick={() => setChatTab('general')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-black rounded-xl transition-all border ${chatTab === 'general' ? 'bg-gray-100 shadow-inner border-gray-200 text-gray-800' : 'bg-white shadow-sm border-gray-100 text-gray-500 hover:text-gray-700'}`}>
                  💬 팀원 코멘트
                </button>
                <button id="demo-ai-tab-btn" onClick={() => setChatTab('ai')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-black rounded-xl transition-all border ${chatTab === 'ai' ? 'bg-gray-100 shadow-inner border-gray-200 text-[#7cb93b]' : 'bg-white shadow-sm border-gray-100 text-gray-500 hover:text-gray-700'}`}>
                  <img src="/images/favicon.ico" alt="Bara" className={`w-3.5 h-3.5 object-contain transition-all ${chatTab !== 'ai' ? 'opacity-40 grayscale' : ''}`} /> 바라에게 질문
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/30">
                {chatTab === 'general' ? (
                  teamChatList.map(chat => (
                    <div key={chat.id} className={`flex flex-col ${chat.sender === "me" ? "items-end" : "items-start"} animate-fade-in-up`}>
                      {chat.target && chat.target !== "all" && (
                        <span className="text-[10px] font-black text-[#91D148] mb-1 px-1">🔒 {chat.target}에게만</span>
                      )}
                      {chat.sender !== "me" ? (
                        <span className="text-[10px] font-black text-gray-500 mb-1 px-1">{chat.user || "팀원"}</span>
                      ) : (
                        <span className="text-[10px] font-black text-[#91D148] mb-1 px-1">나(참여자)</span>
                      )}
                      <div className="flex items-end gap-2 max-w-[90%]">
                        {chat.sender === "me" && <span className="text-[10px] text-gray-400 mb-1 shrink-0">{chat.time}</span>}
                        <div className={`px-3 py-2.5 rounded-2xl text-[13px] font-bold shadow-sm leading-relaxed ${chat.sender === "me" ? "bg-gray-800 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-700 rounded-tl-none"}`}>
                          {chat.text}
                        </div>
                        {chat.sender !== "me" && <span className="text-[10px] text-gray-400 mb-1 shrink-0">{chat.time}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  baraChatList.map(chat => (
                    <div key={chat.id} className={`flex flex-col ${chat.sender === "me" ? "items-end" : "items-start"} animate-fade-in-up`}>
                      {chat.sender === "bara" && <span className="text-[11px] font-black text-[#91D148] mb-1 ml-1">BARA 🐹</span>}
                      <div className="flex items-end gap-2 max-w-[90%]">
                        {chat.sender === "me" && <span className="text-[10px] text-gray-400 mb-1 shrink-0">{chat.time}</span>}
                        <div className={`p-3 rounded-[20px] text-[13px] font-bold shadow-sm leading-relaxed ${chat.sender === "me" ? "bg-[#91D148] text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-[#91D148]/10"}`}>
                          {chat.text}
                        </div>
                        {chat.sender !== "me" && <span className="text-[10px] text-gray-400 mb-1 shrink-0">{chat.time}</span>}
                      </div>
                    </div>
                  ))
                )}

                {chatTab === 'ai' && isBaraTyping && (
                  <div className="flex flex-col items-start mt-2">
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

              <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-2">
                {chatTab === 'general' && (
                  <div className="flex px-1">
                    <select 
                      value={chatTarget} 
                      onChange={(e) => setChatTarget(e.target.value)} 
                      className="text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#CAE7A7] cursor-pointer"
                    >
                      <option value="all">모두에게 보내기</option>
                      {meetingMembers.map(name => ( <option key={name} value={name}>{name}에게 귓속말</option> ))}
                    </select>
                  </div>
                )}
                <div className="relative">
                  {/* 💡 데모용 ID 부착: 채팅 인풋 및 전송 */}
                  <input 
                    id="demo-chat-input"
                    type="text" 
                    value={inputValue} 
                    onChange={e => setInputValue(e.target.value)} 
                    onKeyDown={e => { if (!isComposing && e.key === "Enter") handleSendMessage(); }} 
                    onCompositionStart={() => setIsComposing(true)} 
                    onCompositionEnd={() => setIsComposing(false)} 
                    placeholder={chatTab === 'general' ? "코멘트 입력" : "바라에게 질문"}
                    disabled={chatTab === 'ai' && isBaraTyping}
                    className="w-full border-2 border-gray-100 rounded-xl py-3 pl-4 pr-12 text-[13px] font-black focus:border-[#CAE7A7] outline-none transition-all bg-gray-50 disabled:bg-gray-200" 
                  />
                  <button id="demo-chat-send-btn" onClick={handleSendMessage} disabled={chatTab === 'ai' && isBaraTyping} className="absolute right-1.5 top-1.5 w-9 h-9 bg-[#91D148] text-white rounded-lg flex items-center justify-center shadow-md hover:bg-[#82bd41] transition-colors disabled:bg-gray-300">➔</button>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}

      <MemberAddModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onAdd={handleAddMembers} />
      <SpeakerEditModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingScriptId(null); }} currentSpeaker={selectedSpeaker} meetingMembers={meetingMembers} mode={speakerEditMode} onSave={handleSpeakerChange} />

      {isBriefingModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden animate-zoom-in">
            <div className="bg-[#CAE7A7] p-10 flex justify-between items-start">
              <div>
                <span className="bg-white/50 px-3 py-1 rounded text-[12px] font-black text-gray-800">PRE-MEETING BRIEFING</span>
                <h2 className="text-[32px] font-black text-gray-900 mt-4 leading-tight">{meetingTitle}</h2>
              </div>
              <button onClick={() => setIsBriefingModalOpen(false)} className="text-3xl font-bold text-gray-800 hover:scale-110 transition-transform">✕</button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8 text-[15px]">
                <div className="space-y-4">
                  <p className="flex flex-col"><span className="text-gray-400 font-black text-xs uppercase">DATE</span><span className="font-bold text-gray-800">{meetingDate}</span></p>
                  <p className="flex flex-col"><span className="text-gray-400 font-black text-xs uppercase">TIME</span><span className="font-bold text-gray-800">14:00 ~ 15:30</span></p>
                </div>
                <div className="space-y-4">
                  <p className="flex flex-col"><span className="text-gray-400 font-black text-xs uppercase">LOCATION</span><span className="font-bold text-gray-800">본사 4층 소회의실 2호</span></p>
                  <p className="flex flex-col"><span className="text-gray-400 font-black text-xs uppercase">ATTENDEES</span><span className="font-bold text-gray-800">{meetingMembers.join(", ")}</span></p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">📌 주요 아젠다</h3>
                <div className="space-y-3">
                  {agendas.map(a => <p key={a.id} className="bg-gray-50 px-5 py-3 rounded-xl text-[21px] font-bold text-gray-700">· {a.text}</p>)}
                </div>
              </div>
              {/* 💡 데모용 ID 부착 5 */}
              <button id="demo-briefing-btn" onClick={() => setIsBriefingModalOpen(false)} className="w-full bg-[#CAE7A7] py-5 rounded-2xl font-black text-gray-900 text-lg shadow-lg hover:shadow-xl transition-all">확인 완료</button>
            </div>
          </div>
        </div>
      )}

      {isStopModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          <div className="relative bg-white rounded-[24px] p-10 w-[420px] shadow-2xl text-center animate-fade-in">
            <h2 className="text-[20px] font-black text-gray-900 mb-4">녹음을 종료하시겠습니까?</h2>
            {unresolvedAgendasCount > 0 ? (
              <div className="mb-8">
                <p className="text-[14px] font-black text-red-500 mb-2 flex items-center justify-center gap-1">미해결 안건이 {unresolvedAgendasCount}개 남아있습니다!</p>
                <p className="text-[13px] font-medium text-gray-600 leading-relaxed">지금 종료하시면 남은 안건은 <span className="font-bold text-gray-800">미결정 상태로 이월</span>되며,<br />이후 회의록이 자동으로 생성됩니다.</p>
              </div>
            ) : (
              <p className="text-[13px] font-medium text-gray-600 mb-8 leading-relaxed">모든 안건이 성공적으로 완료되었습니다! 🎉<br />종료 후 회의록이 자동으로 생성됩니다.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setIsStopModalOpen(false)} className="flex-1 py-3.5 bg-[#F1F3F5] text-[#495057] font-bold rounded-xl hover:bg-gray-200 transition-all">아니오</button>
              {/* 💡 데모용 ID 부착: 네, 종료합니다 버튼 */}
              <button 
                id="demo-confirm-stop-btn"
                onClick={() => { setIsStopModalOpen(false); setIsGenerating(true); setCurrentBaraId("generating"); }} 
                className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] transition-all shadow-md"
              >
                네, 종료합니다
              </button>
            </div>
          </div>
        </div>
      )}

      {isCarryOverModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          <div className="relative bg-white rounded-[24px] p-10 w-[420px] shadow-2xl text-center animate-fade-in">
            <h2 className="text-[20px] font-black text-gray-900 mb-3">⏰ 지정된 회의 시간이 종료되었습니다.</h2>
            <p className="text-[14px] font-medium text-gray-600 mb-8 leading-relaxed">회의를 마무리하고 좌측 하단의 <strong className="text-red-500">[녹음 종료]</strong> 버튼을<br />직접 눌러 회의록을 생성해 주세요.</p>
            <div className="flex justify-center">
              <button onClick={() => setIsCarryOverModalOpen(false)} className="w-full py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] transition-all">확 인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMeeting;