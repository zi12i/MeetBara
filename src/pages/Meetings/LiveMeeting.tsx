import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import SpeakerEditModal from "../../components/meetings/SpeakerEditModal";
import MemberAddModal from "../../components/meetings/MemberAddModal";

// 채팅 메시지 타입 정의
interface ChatMessage {
  id: number;
  sender: "me" | "bara";
  text: string;
  time: string;
}

// 회의록 데이터 타입 정의
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
  
  // 탭 및 검색 상태 관리
  const [activeTab, setActiveTab] = useState("decisions");
  const [activeSideTab, setActiveSideTab] = useState("keyword-search"); 
  const [searchTerm, setSearchTerm] = useState("알림센터통합");
  
  // 모달 및 참여자 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [meetingMembers, setMeetingMembers] = useState(["김철수", "이영희", "박지민"]);

  // 채팅 관련 상태
  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 데이터 정의
  const meetingKeywords = ["메인피드", "알림센터", "검색필터", "CTR", "알림센터통합", "UX개선", "단계적통합", "구조설계"];

  const mockMeetingLogs: MeetingLog[] = [
    {
      id: 1,
      title: "신규 프로젝트 기획",
      date: "2026.03.28",
      members: "김철수, 이영희, 박지민, 최유진",
      keywords: ["알림센터", "알림센터통합", "공지", "확장"],
      content: "공지 중심으로 우선 통합 후, 전체 통합 구조로 확장하기로 합의"
    },
    {
      id: 2,
      title: "A/B 테스트 성과 리뷰 회의",
      date: "2026.03.21",
      members: "김철수, 이영희",
      keywords: ["알림센터", "CTR", "상승"],
      content: "CTR 기준 B안 15% 상승 확인"
    },
    {
      id: 3,
      title: "UX 성과 지표 정의 회의",
      date: "2026.03.25",
      members: "이영희, 최유진",
      keywords: ["추가지표", "알림센터", "체류시간"],
      content: "추가지표(체류시간) 포함 필요"
    }
  ];

  const filteredLogs = mockMeetingLogs.filter(log => 
    log.title.includes(searchTerm) || 
    log.content.includes(searchTerm) || 
    log.keywords.some(k => k.includes(searchTerm))
  );

  const scriptData = [
    { user: "참가자 1", text: "아아, 마이크 테스트. 다들 들어오셨나요? 네, 그럼 오늘 주간 정기 회의 바로 시작할게요." },
    { user: "참가자 3", text: "네, 제가 화면 공유 좀 할게요. 저번 회의 때 말씀하셨던 메인 피드 레이아웃인데요..." }
  ];

  // 초기 메시지 및 스크롤 로직
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: Date.now(),
      sender: "bara",
      text: "안녕하세요! 회의바라입니다. 궁금한 점이 있다면 무엇이든 물어보세요. 🐹",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatList([initialMessage]);
    return () => setChatList([]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatList, activeSideTab]);

  // 핸들러 함수들
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: "me",
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatList((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  const handleRemoveMember = (nameToRemove: string) => {
    setMeetingMembers(prev => prev.filter(name => name !== nameToRemove));
  };

  const handleAddMembers = (selected: any[]) => {
    const newNames = selected.map(m => m.name);
    setMeetingMembers(prev => Array.from(new Set([...prev, ...newNames])));
  };

  const handleEditSpeaker = (name: string) => {
    setSelectedSpeaker(name);
    setIsModalOpen(true);
  };

  return (
    <>
      <PageMeta title={`실시간 회의 - ${id}`} description="실시간 회의 진행 화면" />

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] bg-white overflow-hidden relative">
        
        {/* === 좌측 영역: 메인 콘텐츠 === */}
        <div className="flex-1 flex flex-col gap-6 p-4 overflow-hidden">
          <div className="bg-[#F4F9ED] rounded-2xl p-6 space-y-4 shadow-sm border border-[#91D148]/10 shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">[주간 정기] 신규 프로젝트 UI/UX 개선안 검토 회의</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {meetingMembers.map(name => (
                <div key={name} className="relative group">
                  <span className="px-4 py-1.5 bg-white text-[#91D148] border border-[#91D148]/20 font-bold rounded-lg shadow-sm flex items-center transition-all group-hover:pr-8">
                    {name}
                  </span>
                  <button 
                    onClick={() => handleRemoveMember(name)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#91D148] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              <span onClick={() => setIsMemberModalOpen(true)} className="text-gray-400 ml-2 cursor-pointer hover:text-[#91D148] font-medium">+ 회의자 추가</span>
              <span className="ml-auto text-gray-500 font-bold px-1 text-[13px]">2026년 4월 7일 (화) 14:00</span>
            </div>
          </div>

          {/* 메인 탭 메뉴 */}
          <div className="border-b border-gray-100 flex gap-10 px-2 shrink-0">
            {[{ id: "decisions", label: "결정완료안건" }, { id: "live-summary", label: "실시간요약" }, { id: "script", label: "스크립트" }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 text-[16px] font-bold transition-all relative ${activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#91D148] rounded-full animate-fade-in"></div>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 px-2 no-scrollbar pb-10">
            {activeTab === "decisions" ? (
              <section className="space-y-4 animate-fade-in">
                {["공지 중심 우선 통합 + 전체 구조 설계 후 확장으로 결정", "옵셔널 전환 + 이후 단계에서 설정 유도로 결정"].map((decision, idx) => (
                  <div key={idx} className="bg-gray-100 border border-gray-200 py-6 px-8 rounded-[24px] shadow-sm transform transition-all hover:scale-[1.01]">
                    <p className="text-[18px] font-extrabold text-gray-900 text-center leading-relaxed">{decision}</p>
                  </div>
                ))}
              </section>
            ) : activeTab === "live-summary" ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 text-[#91D148] font-bold bg-[#F4F9ED]/50 p-3 rounded-xl border border-[#91D148]/10 mb-6">
                  <span className="text-xl">💡</span>
                  <p>회의바라가 실시간 요약을 완료했어요</p>
                </div>
                <section className="space-y-10">
                  <div className="relative pl-6 border-l-2 border-gray-100 text-gray-600 font-medium">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#91D148] rounded-full border-4 border-white"></div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">주간 정기 회의 시작</h3>
                    <ul className="list-disc list-inside space-y-3 ml-2"><li>메인 피드 개편 논의 예정...</li></ul>
                  </div>
                </section>
              </div>
            ) : activeTab === "script" ? (
              <div className="animate-fade-in relative pl-4 border-l border-gray-100 ml-2 space-y-8 pb-10">
                {scriptData.map((item, idx) => (
                  <div key={idx} className="group relative space-y-2">
                    <div className="absolute -left-[21px] top-2 w-3 h-3 bg-white border-2 border-gray-200 rounded-full group-hover:border-[#91D148] transition-colors"></div>
                    <span className="font-bold text-gray-900 text-sm block">{item.user}</span>
                    <div className="text-[15px] text-gray-600 leading-relaxed bg-gray-50/50 p-5 rounded-2xl group-hover:bg-[#F4F9ED]/60 transition-all border border-transparent group-hover:border-[#91D148]/10">{item.text}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* 하단 컨트롤러 */}
          <div className="bg-gray-900 text-white rounded-2xl p-4 flex items-center gap-8 px-10 shadow-2xl shrink-0 mb-2">
            <span className="text-sm font-mono font-bold text-[#91D148]">00:40</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-[#91D148] w-[40%] shadow-[0_0_10px_#91D148]"></div></div>
            <div className="flex items-center gap-6 text-2xl">
              <button className="hover:text-[#91D148] transition-all">🎙️</button>
              <button className="bg-red-500 hover:bg-red-600 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all shadow-lg animate-pulse">녹음 종료</button>
            </div>
          </div>
        </div>

        {/* === 우측 영역: 사이드 패널 === */}
        <div className="w-full lg:w-[420px] bg-[#F4F9ED] flex flex-col shadow-inner overflow-hidden shrink-0">
          
          {/* 사이드 고정 헤더 (탭 & 검색바) */}
          <div className="p-6 pb-2 space-y-6 shrink-0">
            <div className="flex justify-between border-b border-[#91D148]/20 pb-2">
              {[{ id: "keywords", label: "회의키워드" }, { id: "keyword-search", label: "키워드 검색" }, { id: "chat", label: "채팅창" }, { id: "speakers", label: "발화자" }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveSideTab(tab.id)} className={`pb-3 text-[13px] font-bold transition-all relative ${activeSideTab === tab.id ? "text-[#91D148]" : "text-gray-400 hover:text-gray-600"}`}>
                  {tab.label}
                  {activeSideTab === tab.id && <div className="absolute bottom-[-2px] left-0 w-full h-[4px] bg-[#91D148]"></div>}
                </button>
              ))}
            </div>

            {/* 키워드 검색 탭일 때의 상단 검색바 & 뱃지 */}
            {activeSideTab === "keyword-search" && (
              <div className="space-y-4 animate-fade-in">
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91D148]">🔍</span>
                  <input 
                    type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="회의를 검색해바라바라바라"
                    className="w-full bg-white border-2 border-transparent rounded-2xl py-3 pl-12 pr-10 text-sm font-black focus:border-[#91D148] outline-none shadow-sm transition-all" 
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["알림센터통합", "UX개선", "단계적통합", "구조설계"].map(tag => (
                    <button key={tag} onClick={() => setSearchTerm(tag)} className={`px-3 py-1.5 rounded-full text-[12px] font-extrabold transition-all border ${searchTerm === tag ? "bg-[#91D148] text-white border-[#91D148]" : "bg-gray-200 text-gray-600 border-transparent hover:bg-gray-300"}`}>{tag}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 사이드 가변 컨텐츠 영역 */}
          <div className="flex-1 flex flex-col overflow-hidden px-6 pb-10">
            {activeSideTab === "keywords" ? (
              <div className="grid grid-cols-2 gap-4 animate-fade-in pb-10 overflow-y-auto no-scrollbar">
                {meetingKeywords.map((kw, idx) => (
                  <div key={idx} onClick={() => {setActiveSideTab("keyword-search"); setSearchTerm(kw);}} className="bg-gray-200/80 border border-gray-300 py-6 px-4 rounded-[20px] flex items-center justify-center shadow-sm hover:bg-[#91D148] hover:text-white transition-all cursor-pointer group">
                    <span className="text-[16px] font-black text-gray-800 group-hover:text-white text-center break-all">{kw}</span>
                  </div>
                ))}
              </div>
            ) : activeSideTab === "keyword-search" ? (
              <div className="space-y-6 animate-fade-in overflow-y-auto no-scrollbar pt-2">
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <div key={log.id} className="p-6 border-l-[6px] border-[#91D148] rounded-2xl bg-white space-y-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <h4 className="font-black text-[17px] text-gray-900 leading-tight">{log.title}</h4>
                    <div className="text-[12px] space-y-1.5 text-gray-800">
                      <p className="flex font-bold"><span className="w-14 text-gray-500 font-medium">날짜:</span> {log.date}</p>
                      <p className="flex font-bold"><span className="w-14 text-gray-500 font-medium">참여자:</span> {log.members}</p>
                      <p className="flex font-bold"><span className="w-14 text-gray-500 font-medium">키워드:</span> <span className="text-[#91D148] font-black">{log.keywords.join(", ")}</span></p>
                      <div className="mt-4 p-4 bg-[#F4F9ED]/50 rounded-xl border border-[#91D148]/10 text-[13px] leading-relaxed italic">
                        " {log.content} "
                      </div>
                    </div>
                  </div>
                )) : <div className="text-center py-20 text-gray-400 font-black">검색 결과가 없습니다 🐹</div>}
                {filteredLogs.length > 0 && (
                  <div className="flex justify-center gap-4 mt-8 pb-4">
                    <button className="w-8 h-8 rounded-lg bg-[#91D148] text-white font-bold text-xs">1</button>
                    <button className="w-8 h-8 rounded-lg bg-white text-gray-400 font-bold text-xs hover:bg-gray-100 border border-gray-100">2</button>
                  </div>
                )}
              </div>
            ) : activeSideTab === "chat" ? (
              <div className="flex flex-col h-full animate-fade-in relative">
                <div className="flex-1 overflow-y-auto space-y-5 p-1 no-scrollbar">
                  {chatList.map((chat) => (
                    <div key={chat.id} className={`flex flex-col ${chat.sender === "me" ? "items-end" : "items-start"}`}>
                      <div className="flex items-end gap-2 max-w-[90%]">
                        {chat.sender === "me" && <span className="text-[10px] text-gray-400 mb-1">{chat.time}</span>}
                        <div className={`p-4 rounded-[20px] text-[14px] font-bold shadow-md leading-relaxed ${chat.sender === "me" ? "bg-[#91D148] text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-[#91D148]/10"}`}>{chat.text}</div>
                        {chat.sender === "bara" && <span className="text-[10px] text-gray-400 mb-1">{chat.time}</span>}
                      </div>
                    </div>
                  ))}
                  <div className="h-44 flex-shrink-0" /><div ref={chatEndRef} />
                </div>
                <div className="mt-2 relative z-10 pb-4 pr-[130px]">
                  <input 
                    type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (!isComposing && e.key === "Enter") handleSendMessage(); }}
                    onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}
                    placeholder="바라에게 물어보세요"
                    className="w-full bg-white border-2 border-[#91D148]/30 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold focus:border-[#91D148] outline-none shadow-xl transition-all"
                  />
                  <button onClick={handleSendMessage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#91D148] text-white rounded-xl flex items-center justify-center hover:bg-[#82bd41] shadow-lg active:scale-95 transition-all">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  </button>
                </div>
              </div>
            ) : activeSideTab === "speakers" ? (
              <div className="space-y-4 animate-fade-in overflow-y-auto no-scrollbar pt-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-[#91D148]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F4F9ED] rounded-full flex items-center justify-center text-[#91D148] font-bold">🔊</div>
                      <span className="font-bold text-gray-800 text-sm">참가자 {i}</span>
                    </div>
                    <button onClick={() => handleEditSpeaker(`참가자 ${i}`)} className="p-2 text-gray-400 hover:text-[#91D148]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  </div>
                ))}
                <div className="h-40" />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <MemberAddModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onAdd={handleAddMembers} />
      <SpeakerEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentSpeaker={selectedSpeaker} />
    </>
  );
};

export default LiveMeeting;