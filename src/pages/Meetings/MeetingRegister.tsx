import React, { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone";
import MemberAddModal from "../../components/meetings/MemberAddModal"; 
import Toast from "../../components/common/Toast";
import { createPortal } from "react-dom";

// --- SVG 아이콘 컴포넌트 ---
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const UsersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CheckCircleIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

// --- 임시 데이터 ---
const projectLabels = [
  { id: "p1", name: "신규 프로젝트 기획", color: "#3b82f6" },
  { id: "p2", name: "A/B 테스트 리뷰", color: "#CAE7A7" },
  { id: "p3", name: "하반기 채용", color: "#f59e0b" },
  { id: "p4", name: "디자인 시스템", color: "#E2F3CA" },
];

// 스크롤 테스트를 위해 임시 데이터를 많이 넣었습니다!
export default function MeetingRegister() {
const [meetingList, setMeetingList] = useState([
  { id: 1, title: "AI 에이전트 고도화 논의", date: "2026.05.14", time: "14:00~15:30", room: "소회의실 2호", attendees: "김 PM 외 2명", color: "#FF9F43" },
  { id: 2, title: "하반기 채용 계획 킥오프", date: "2026.06.02", time: "10:00~11:00", room: "대회의실", attendees: "박 팀장 외 3명", color: "#f59e0b" },
  { id: 3, title: "디자인 가이드라인 검토", date: "2026.05.20", time: "11:00~12:00", room: "온라인", attendees: "이 디자이너 외 1명", color: "#36A2EB" },
  { id: 4, title: "테스트 스크롤용 회의 1", date: "2026.05.21", time: "10:00~11:00", room: "온라인", attendees: "테스트", color: "#94a3b8" },
  { id: 5, title: "테스트 스크롤용 회의 2", date: "2026.05.22", time: "10:00~11:00", room: "온라인", attendees: "테스트", color: "#94a3b8" },
  { id: 6, title: "테스트 스크롤용 회의 3", date: "2026.05.23", time: "10:00~11:00", room: "온라인", attendees: "테스트", color: "#94a3b8" },
  { id: 7, title: "테스트 스크롤용 회의 4", date: "2026.05.24", time: "10:00~11:00", room: "온라인", attendees: "테스트", color: "#94a3b8" },
]);
const formatDateToCard = (value: string) => {
  return value.replaceAll("-", ".");
};
const formatAttendeesText = (list: string[]) => {
  if (list.length === 0) return "참석자 없음";
  if (list.length === 1) return list[0];
  return `${list[0]} 외 ${list.length - 1}명`;
};
  const [title, setTitle] = useState("");
  
  const [date, setDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement | null>(null);

const today = new Date().toISOString().split("T")[0];

const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  if (!value) {
    setDate("");
    return;
  }

  // 오늘 이전 날짜 선택 불가
  if (value < today) {
    return;
  }

  const [year, month, day] = value.split("-").map(Number);

  // 연도 1~9999
  if (year < 1 || year > 9999) return;

  // 월 1~12
  if (month < 1 || month > 12) return;

  // 일 1~31
  if (day < 1 || day > 31) return;

  setDate(value);
};

const openDatePicker = () => {
  if (!dateInputRef.current) return;

  // 크롬 계열 브라우저에서는 달력 팝업을 바로 열 수 있음
  if (typeof dateInputRef.current.showPicker === "function") {
    dateInputRef.current.showPicker();
  } else {
    // showPicker 지원 안 하면 input에 포커스
    dateInputRef.current.focus();
  }
};
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [tempTemplate, setTempTemplate] = useState(""); 
    const templateOptions = [
  "회의록 템플릭",
  "성과보고서 템플릿",
  "미팅 템플릿",
  "1:1 미팅",
  "의사결정 회의",
];
  const [selectedProject, setSelectedProject] = useState("");
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const projectOptions = [
  "AI미팅 에이전트 고도화",
  "차세대 ERP UI 개선",
  "회의바라 고도화",
  "실시간 요약 기능",
  "팀 위키 구축",
];
  const [description, setDescription] = useState("");
  const [savedAgendas, setSavedAgendas] = useState<string[]>([]);
  const [isAgendaAlertOpen, setIsAgendaAlertOpen] = useState(false);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedSavedAgendaIndex, setSelectedSavedAgendaIndex] = useState<number | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [isPendingAgendaOpen, setIsPendingAgendaOpen] = useState(false);
  const [selectedPendingAgendas, setSelectedPendingAgendas] = useState<any[]>([]);  
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [isSendCompleteOpen, setIsSendCompleteOpen] = useState(false);
  const [briefingCard, setBriefingCard] = useState<null | {
  date: string;
  time: string;
  room: string;
  project: string;
  newAgendas: string[];
  pendingAgendas: {
    title: string;
    createdDate: string;
  }[];
}>(null);
const handleCreateBriefingCard = () => {
  const formattedTime =
    startTime && endTime ? `${startTime} ~ ${endTime}` : startTime || endTime || "";

  const pendingAgendaItems = selectedPendingAgendas.map((agenda) => ({
    title: agenda.title,
    createdDate: agenda.createdDate,
  }));

  setBriefingCard({
    date,
    time: formattedTime,
    room,
    project: selectedProject,
    newAgendas: savedAgendas,
    pendingAgendas: pendingAgendaItems,
  });
};
  const pendingAgendaList = [
  {
    id: 1,
    createdDate: "2026.04.08",
    title: "카드형 UI 레이아웃 최종확정",
    projectName: "AI미팅 에이전트 고도화",
    accentColor: "#FF7878",
    borderColor: "#91D148",
  },
  {
    id: 2,
    createdDate: "2026.04.08",
    title: "알림 센터 알림 통합 방식결정",
    projectName: "AI미팅 에이전트 고도화",
    accentColor: "#FF7878",
    borderColor: "#91D148",
  },
  {
    id: 3,
    createdDate: "2026.04.13",
    title: "고객사 요구사항 인터뷰 누락 확인",
    projectName: "금융권 차세대 ERP UI 개선",
    accentColor: "#F6A03D",
    borderColor: "#91D148",
  },
];
  useEffect(() => {
    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { scenarioId: "register", customMessage: "새로운 회의를 등록하시겠어요? 꼼꼼히 기록해서 관리해 드릴게요!" } 
    });
    window.dispatchEvent(event);
  }, []);

  const handleAddMembers = (selected: any[]) => {
    const newNames = selected.map(m => m.name);
    setAttendees(prev => Array.from(new Set([...prev, ...newNames])));
  };

  const handleRemoveMember = (nameToRemove: string) => {
    setAttendees(prev => prev.filter(name => name !== nameToRemove));
  };

  const handleSelectPendingAgenda = (agenda: any) => {
  setSelectedPendingAgendas((prev) => {
    const exists = prev.find((item) => item.id === agenda.id);

    // 이미 선택된 경우 → 제거 (토글)
    if (exists) {
      return prev.filter((item) => item.id !== agenda.id);
    }

    // 선택 안된 경우 → 추가
    return [...prev, agenda];
  });
};
  const handleAddAgenda = () => {
  const trimmedText = description.trim();

  if (trimmedText.length < 10) {
    setIsAgendaAlertOpen(true);
    return;
  }

  setSavedAgendas((prev) => [...prev, trimmedText]);
  setDescription("");
    setSelectedSavedAgendaIndex(null);
};
const handleCancelAgenda = () => {
  if (selectedSavedAgendaIndex === null) return;

  setSavedAgendas((prev) =>
    prev.filter((_, index) => index !== selectedSavedAgendaIndex)
  );

  setSelectedSavedAgendaIndex(null);
};
  const handleSubmit = (e: React.FormEvent) => {
  if (e) e.preventDefault();

  if (!selectedProject || !date || !startTime || !endTime) {
    alert("필수 항목을 모두 입력해주세요.");
    return;
  }

  if (startTime >= endTime) {
    alert("회의 종료 시간은 시작 시간보다 늦어야 합니다.");
    return;
  }

  const newMeeting = {
    id: Date.now(),
    title: selectedProject, 
    date: formatDateToCard(date),
    time: `${startTime}~${endTime}`,
    room: room.trim() || "장소 미정",
    attendees: formatAttendeesText(attendees),
    color: "#91D148",
  };

  setMeetingList((prev) => [newMeeting, ...prev]);
  setIsToastVisible(true);

  setTitle("");
  setDate("");
  setStartTime("");
  setEndTime("");
  setRoom("");
  setSelectedTemplate("");
  setSelectedProject("");
  setDescription("");
  setSavedAgendas([]);
  setAttendees([]);
  setSelectedSavedAgendaIndex(null);
  setSelectedPendingAgendas([]);
  setBriefingCard(null);
  setIsCreatingNew(true);
};
  const handleSelectMeeting = (meeting: any) => {
    setIsCreatingNew(false);
    setTitle(meeting.title);
  };
  return (
    <>
      <PageMeta title="회의바라 - 회의 등록" description="새로운 회의 일정 등록 및 관리" />
      <Toast message="회의가 성공적으로 예약되었습니다." subMessage="" isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      {/* 💡 핵심 솔루션: absolute inset-0 사용! */}
      {/* AppLayout이 만든 영역(Outlet 컨테이너)을 무시하고, 상/하/좌/우 공간을 꽉 채워버립니다. 
          따라서 전체 스크롤이 절대 생길 수 없는 완벽한 고정 뷰포트가 생성됩니다. */}
      <div className="absolute inset-0 p-4 md:p-6 overflow-hidden bg-transparent">
        
        {/* 이 내부 래퍼에서만 좌우 패널을 나누고 높이를 100% 씁니다. */}
        <div className="w-full h-full max-w-(--breakpoint-2xl) mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* === 좌측: 다가오는 회의 리스트 패널 === */}
          <div className="w-full lg:w-[400px] xl:w-[460px] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
            
            {/* 상단 고정 영역 */}
            <div className="p-6 pb-4 border-b border-gray-100 bg-white z-10 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2.5">
                  <span className="text-gray-800"><CalendarIcon /></span>
                  다가오는 회의
                  <span className="bg-gray-100 text-gray-500 text-[12px] px-2.5 py-1 rounded-full ml-1">{meetingList.length}건</span>
                </h2>
              </div>
              
              <button 
                onClick={() => {
                  setIsCreatingNew(true);
                  setTitle(""); setDate(""); setStartTime(""); setEndTime(""); setRoom(""); setAttendees([]); setDescription("");
                }}
                className={`w-full mt-4 py-3.5 rounded-xl font-black text-[14px] flex items-center justify-center gap-2 transition-all border-2 ${
                  isCreatingNew ? "bg-[#F4F9ED] text-[#91D148] border-[#91D148] shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-[#91D148]/50"
                }`}
              >
                <PlusIcon /> 새 회의 등록하기
              </button>
            </div>
            
            {/* 💡 이 패널의 컨텐츠만 상하로 독립적으로 스크롤됩니다 (flex-1 overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-gray-50/30">
              {meetingList.length > 0 ? (
               meetingList.map((meeting) => ( 
                  <div 
                    key={meeting.id}
                    onClick={() => handleSelectMeeting(meeting)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all border border-gray-200 border-l-[6px] overflow-hidden ${
                      !isCreatingNew && title === meeting.title 
                        ? "bg-white shadow-md border-r border-t border-b border-gray-200" 
                        : "bg-white shadow-sm hover:shadow-md hover:bg-gray-50/50"
                    }`}
                    style={{ borderLeftColor: meeting.color }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[12px] font-black px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">{meeting.date}</span>
                      <span className="text-[13px] font-bold text-gray-400">{meeting.time}</span>
                    </div>
                    <h3 className="font-bold text-[16px] text-gray-900 mb-4 leading-snug line-clamp-2">{meeting.title}</h3>
                    <div className="flex items-center gap-4 text-[13px] text-gray-500 font-medium">
                      <p className="flex items-center gap-1.5"><span className="text-gray-400"><MapPinIcon /></span> {meeting.room}</p>
                      <p className="flex items-center gap-1.5"><span className="text-gray-400"><UsersIcon /></span> {meeting.attendees}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 font-bold space-y-4">
                  <span className="text-[#91D148]/40"><CheckCircleIcon /></span>
                  <p>오늘 예정된 남은 회의가 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* === 우측: 회의 등록(또는 수정) 폼 패널 === */}
          <div className="flex-1 h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
            
            {/* 헤더 고정 영역 */}
            <div className="p-8 pb-6 border-b border-gray-100 shrink-0 bg-white z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[13px] font-black px-3.5 py-1.5 rounded-lg shadow-sm ${isCreatingNew ? 'bg-[#91D148] text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {isCreatingNew ? '새 회의 등록' : '예약된 회의 수정'}
                </span>
              </div>
              <h2 className="text-[26px] lg:text-[30px] font-black text-gray-900 leading-tight tracking-tight">
                {isCreatingNew ? '새로운 일정을 기록해 볼까요?' : title}
              </h2>
            </div>

            {/* 💡 오른쪽 폼 영역도 여기서 독립적으로 스크롤됩니다 (flex-1 overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
              <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-12">
                <div className="space-y-6">
                  
                  <div>
  <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
    프로젝트
  </label>

  <div className="relative">
    <button
      type="button"
      onClick={() => setIsProjectOpen((prev) => !prev)}
      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-left text-[15px] font-bold text-gray-900 shadow-sm hover:border-[#91D148]/40 transition-all"
    >
      {selectedProject || "프로젝트를 선택해주십시오"}
    </button>

    {isProjectOpen && (
      <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-30 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        <div className="max-h-[260px] overflow-y-auto">
          {projectOptions.map((project) => {
            const isSelected = selectedProject === project;

            return (
              <button
                key={project}
                type="button"
                onClick={() => {
                  setSelectedProject(project);
                  setIsProjectOpen(false);
                }}
                className={`w-full text-left px-5 py-4 border-b last:border-b-0 border-gray-100 transition-colors ${
                  isSelected ? "bg-[#F8FBF2]" : "bg-white hover:bg-[#F8FBF2]"
                }`}
              >
                <div className="text-[16px] font-black text-gray-900">
                  {project}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div>
    <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
      회의 일시 <span className="text-red-500">*</span>
    </label>

    <div className="relative">
      <input
        ref={dateInputRef}
        type="date"
        value={date}
        onChange={handleDateChange}
        min={today}
        max="9999-12-31"
        className="w-full bg-white border border-gray-200 rounded-xl pl-5 pr-14 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
      />

      <button
        type="button"
        onClick={openDatePicker}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#91D148] transition-colors"
        aria-label="날짜 선택"
      >
        <CalendarIcon />
      </button>
    </div>
  </div>

  <div>
    <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
      회의 시간 <span className="text-red-500">*</span>
    </label>

    <div className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="flex-1 bg-transparent text-[15px] font-bold text-gray-900 outline-none"
      />
      <span className="text-[15px] font-bold text-gray-500">~</span>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="flex-1 bg-transparent text-[15px] font-bold text-gray-900 outline-none"
      />
    </div>
  </div>

  <div>
    <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
      회의 장소
    </label>
    <input
      type="text"
      value={room}
      onChange={(e) => setRoom(e.target.value)}
      placeholder="장소를 입력하세요"
      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
    />
  </div>

 <div>
  <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
    템플릿 설정
  </label>

  <div className="relative">
    <button
      type="button"
      onClick={() => {
        setIsTemplateOpen((prev) => !prev);
        setTempTemplate(selectedTemplate);
      }}
      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-left text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm hover:border-[#91D148]/40"
    >
      {selectedTemplate || "템플릿명"}
    </button>

    {isTemplateOpen && (
      <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-30 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        <div className="max-h-[260px] overflow-y-auto">
          {templateOptions.map((template) => {
            const isSelected = tempTemplate === template;

            return (
              <button
                key={template}
                type="button"
                onClick={() => setTempTemplate(template)}
                className={`w-full text-left px-5 py-4 border-b last:border-b-0 border-gray-100 transition-colors ${
                  isSelected ? "bg-[#F8FBF2]" : "bg-white hover:bg-[#F8FBF2]"
                }`}
              >
                <div className="text-[16px] font-black text-gray-900">
                  {template}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSelectedTemplate(tempTemplate);
              setIsTemplateOpen(false);
            }}
            className="px-5 py-3 rounded-xl bg-[#F4F9ED] text-[#91D148] text-[14px] font-black border border-[#91D148]/20 hover:bg-[#EAF5DA] transition-all shadow-sm"
          >
            선택하기
          </button>
        </div>
      </div>
    )}
  </div>
</div>
</div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[14px] font-bold text-gray-700">참석자 ({attendees.length}명)</label>
                      <button type="button" onClick={() => setIsMemberModalOpen(true)} className="text-[#91D148] text-[13px] font-black hover:underline flex items-center gap-1.5"><PlusIcon /> 추가</button>
                    </div>
                    <div className="min-h-[72px] bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-2.5 items-start shadow-sm">
                      {attendees.length === 0 ? <span className="text-gray-400 text-[14px] font-medium m-auto">참석자를 추가해주세요.</span> : attendees.map(name => (
                        <span key={name} className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F4F9ED] border border-[#91D148]/20 rounded-lg text-[14px] font-bold text-gray-800 shadow-sm">
                          {name} <button type="button" onClick={() => handleRemoveMember(name)} className="text-gray-400 hover:text-red-500 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
  <div className="mb-6">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-[16px] font-black text-gray-800">미결정 안건</h3>

    <button
      type="button"
      onClick={() => setIsPendingAgendaOpen((prev) => !prev)}
      className="px-4 py-2 rounded-lg bg-[#F4F9ED] text-[#91D148] text-[13px] font-black border border-[#91D148]/20 hover:bg-[#EAF5DA] transition-all shadow-sm"
    >
      불러오기
    </button>
  </div>

  {isPendingAgendaOpen && (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      <div className="max-h-[260px] overflow-y-auto">
        {pendingAgendaList.map((agenda) => (
          <button
            key={agenda.id}
            type="button"
            onClick={() => handleSelectPendingAgenda(agenda)}
            className="w-full text-left px-5 py-4 border-b last:border-b-0 border-gray-100 hover:bg-[#F8FBF2] transition-colors"
          >
            <div className="text-[13px] font-bold text-gray-400 mb-1">
              미결정발생일: {agenda.createdDate}
            </div>
            <div className="text-[16px] font-black text-gray-900 mb-2">
              {agenda.title}
            </div>
            <div className="text-[14px] font-bold text-gray-500">
              프로젝트명: <span className="text-gray-700">{agenda.projectName}</span>
            </div>
          
          </button>
        ))}
      </div>
    </div>
  )}

  {selectedPendingAgendas.map((agenda) => (
  <div
    key={agenda.id}
    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm"
  >
    {/* 왼쪽 띠지 */}
    <div className="absolute left-0 top-0 h-full w-[16px]">
      <div
      className="absolute left-0 top-0 h-full w-[10px]"
      style={{ backgroundColor: agenda.accentColor }}
/>
      <div className="absolute left-[6px] top-0 h-full w-[20px] bg-white rounded-l-[20px]" />
    </div>

    <div className="pl-5">
      <div className="text-[14px] font-black text-gray-400 mb-3">
        미결정발생일: {agenda.createdDate}
      </div>

      <div className="text-[18px] font-bold text-gray-900 mb-4 leading-snug">
        {agenda.title}
      </div>

      <div className="space-y-1">
        <div className="text-[14px] font-semibold text-gray-400">
          프로젝트명:{" "}
          <span className="text-gray-700 font-medium">
            {agenda.projectName}
          </span>
        </div>
      </div>
    </div>
  </div>
))}


<div className="flex items-center justify-between mb-2.5">
  <label className="block text-[14px] font-bold text-gray-700">
    새 안건 입력 (10자 이상)
  </label>

  <div className="flex gap-2">
    <button
  type="button"
  onClick={handleCancelAgenda}
  disabled={selectedSavedAgendaIndex === null}
  className={`px-4 py-2 rounded-lg text-[13px] font-bold border transition-all ${
    selectedSavedAgendaIndex === null
      ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
      : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
  }`}
>
  취소하기
</button>

    <button
      type="button"
      onClick={handleAddAgenda}
      className="px-4 py-2 rounded-lg bg-[#F4F9ED] text-[#91D148] text-[13px] font-black border border-[#91D148]/20 hover:bg-[#EAF5DA] transition-all shadow-sm"
    >
      추가하기
    </button>
  </div>
</div>

  <div className="space-y-3">
    {savedAgendas.map((agenda, index) => {
  const isSelected = selectedSavedAgendaIndex === index;

  return (
    <button
      key={`${agenda}-${index}`}
      type="button"
      onClick={() => setSelectedSavedAgendaIndex(index)}
      className={`w-full text-left rounded-2xl border px-5 py-4 shadow-sm transition-all ${
        isSelected
          ? "border-[#91D148] bg-[#F4F9ED]"
          : "border-gray-200 bg-[#F9FBF6]"
      }`}
    >
      <div className="text-[15px] font-bold text-gray-900 whitespace-pre-wrap">
        {agenda}
      </div>
    </button>
  );
})}

    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="회의 전 참석자들에게 공유할 안건이나 참고 사항을 자유롭게 적어주세요."
      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-medium text-gray-800 focus:border-[#91D148] outline-none transition-all min-h-[140px] resize-y shadow-sm"
    />
    <div className="flex justify-end mt-6">
  <button
    type="button"
    onClick={handleCreateBriefingCard}
    className="px-6 py-3 rounded-xl bg-[#F4F9ED] text-[#91D148] text-[15px] font-black border border-[#91D148]/20 hover:bg-[#EAF5DA] transition-all shadow-sm"
  >
    사전 브리핑 카드 생성하기
  </button>
</div>
{briefingCard && (
  <div className="mt-8">
    <div className="rounded-[28px] border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-8 py-7 border-b border-gray-100 bg-[#F9FBF6]">
        <h3 className="text-[20px] font-black text-[#111827]">사전 브리핑 카드</h3>
      </div>

      <div className="px-8 py-7 space-y-6">
        <div className="text-[18px] font-bold text-[#344054] leading-relaxed">
          <span className="font-black">{briefingCard.date || "YYYY-MM-DD"}</span>{" "}
          <span className="font-black">{briefingCard.time || "HH:MM"}</span>{" "}
          <span className="font-black">{briefingCard.room || "회의장소"}</span>에서{" "}
          <span className="font-black">{briefingCard.project || "프로젝트명"}</span> 회의가 있습니다.
        </div>

        <div className="text-[17px] font-bold text-[#475467] leading-relaxed">
          신규안건 {briefingCard.newAgendas.length}건, 미결정 안건 {briefingCard.pendingAgendas.length}건으로 회의가 진행될 예정입니다.
        </div>

        {briefingCard.newAgendas.length > 0 && (
          <div className="space-y-3">
            <div className="text-[16px] font-black text-[#111827] mb-2">
              신규 안건
            </div>
            {briefingCard.newAgendas.map((agenda, index) => (
              <div
                key={`${agenda}-${index}`}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F9FBF6] px-5 py-4"
              >
                <div className="text-[15px] font-black text-[#111827]">
                  {agenda}
                </div>
              </div>
            ))}
          </div>
        )}

        {briefingCard.pendingAgendas.length > 0 && (
          <div className="space-y-3">
            <div className="text-[16px] font-black text-[#111827] mb-2">
              미결정 안건
            </div>
            {briefingCard.pendingAgendas.map((agenda, index) => (
              <div
                key={`${agenda.title}-${index}`}
                className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4"
              >
                <div className="text-[13px] font-bold text-[#98A2B3] mb-2">
                  미결정발생일: {agenda.createdDate}
                </div>
                <div className="text-[15px] font-black text-[#111827] leading-relaxed">
                  {agenda.title}
                </div>
                <div className="mt-2 text-[14px] font-medium text-[#667085] leading-relaxed">
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    
  <div className="mt-4 w-full flex justify-end">
  <div className="flex flex-wrap justify-end gap-3">
    <button
  type="button"
  onClick={() => setIsSendConfirmOpen(true)}
  className="px-5 py-3 rounded-xl bg-[#F4F9ED] text-[#91D148] text-[14px] font-black border border-[#91D148]/20 hover:bg-[#EAF5DA] transition-all shadow-sm"
>
  담당자 알림 전송
</button>

    <button
      type="button"
      className="px-5 py-3 rounded-xl bg-white text-[#344054] text-[14px] font-black border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
    >
      텍스트 복사하기
    </button>

    <button
      type="button"
      className="px-5 py-3 rounded-xl bg-white text-[#344054] text-[14px] font-black border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
    >
      PNG 복사하기
    </button>
  </div>
</div>
  </div>
)}

  </div>
</div>
</div>   
                </div>
              
                  </form>
                    </div>
            {/* 하단 고정 버튼 (절대 스크롤 안됨) */}
            <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex justify-end shrink-0 z-10">
              <button
                type="submit"
                className="bg-[#91D148] text-white px-12 py-4 rounded-xl font-black text-[17px] shadow-[0_4px_12px_rgba(145,209,72,0.3)] hover:bg-[#82bd41] transition-all flex items-center gap-2"
              > 
                {isCreatingNew ? '회의 예약하기' : '변경사항 저장'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {isAgendaAlertOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
    <div className="w-[90%] max-w-[420px] rounded-2xl bg-white shadow-xl border border-gray-200 px-6 py-7">
      <div className="text-center">
        <h3 className="text-[18px] font-black text-gray-900 mb-3">
          안건 등록 안내
        </h3>

        <p className="text-[15px] leading-7 text-gray-600 whitespace-pre-line">
          안건 등록을 위한 글자수가 부족합니다.
          {"\n"}
          10글자 이상으로 작성해주시기 바랍니다.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setIsAgendaAlertOpen(false)}
          className="min-w-[120px] px-6 py-3 rounded-xl bg-[#91D148] text-white font-black text-[15px] shadow-[0_4px_12px_rgba(145,209,72,0.28)] hover:bg-[#82bd41] transition-all"
        >
          확인
        </button>
      </div>
    </div>
  </div>
)}
<MemberAddModal
  isOpen={isMemberModalOpen}
  onClose={() => setIsMemberModalOpen(false)}
  onAdd={handleAddMembers}
/>
{isSendConfirmOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
    <div className="w-[90%] max-w-[420px] rounded-2xl bg-white shadow-xl border border-gray-200 px-6 py-7">
      
      <div className="text-center">
        <h3 className="text-[18px] font-black text-gray-900 mb-3">
          알림 전송
        </h3>

        <p className="text-[15px] leading-7 text-gray-600">
          작성된 사전 브리핑 카드를 담당자에게 발송하시겠습니까?
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setIsSendConfirmOpen(false)}
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold"
        >
          아니오
        </button>

        <button
          onClick={() => {
            setIsSendConfirmOpen(false);
            setIsSendCompleteOpen(true);
          }}
          className="px-6 py-3 rounded-xl bg-[#91D148] text-white font-black"
        >
          예
        </button>
      </div>
    </div>
  </div>
)}
{isSendCompleteOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
    <div className="w-[90%] max-w-[420px] rounded-2xl bg-white shadow-xl border border-gray-200 px-6 py-7">
      
      <div className="text-center">
        <h3 className="text-[18px] font-black text-gray-900 mb-3">
          발송 완료
        </h3>

        <p className="text-[15px] leading-7 text-gray-600">
          해당 회의의 카드 브리핑을 발송 완료하였습니다.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setIsSendCompleteOpen(false)}
          className="min-w-[120px] px-6 py-3 rounded-xl bg-[#91D148] text-white font-black text-[15px]"
        >
          확인
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}