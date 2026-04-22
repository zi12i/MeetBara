import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone";
import MemberAddModal from "../../components/meetings/MemberAddModal"; 
import Toast from "../../components/common/Toast";
import { createPortal } from "react-dom";
import DatePicker from "../../components/common/DatePicker"; 
import MeetingFormModal from "../../components/meetings/MeetingFormModal";

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

const upcomingMeetings = [
  { id: 1, title: "AI 에이전트 고도화 논의", date: "2026.05.14", time: "14:00~15:30", room: "소회의실 2호", attendees: "김 PM 외 2명", color: "#FF9F43" },
  { id: 2, title: "하반기 채용 계획 킥오프", date: "2026.06.02", time: "10:00~11:00", room: "대회의실", attendees: "박 팀장 외 3명", color: "#f59e0b" },
  { id: 3, title: "디자인 가이드라인 검토", date: "2026.05.20", time: "11:00~12:00", room: "온라인", attendees: "이 디자이너 외 1명", color: "#36A2EB" },
  { id: 4, title: "테스트 스크롤용 회의 1", date: "2026.05.21", time: "10:00~11:00", room: "온라인", attendees: "테스트", color: "#94a3b8" },
  { id: 5, title: "테스트 스크롤용 회의 2", date: "2026.05.22", time: "10:00~11:00", room: "온라인", attendees: "테스트", color: "#94a3b8" },
  { id: 6, title: "테스트 스크롤용 회의 3", date: "2026.05.23", time: "10:00~11:00", room: "온라인", attendees: "테스트", color: "#94a3b8" },
  { id: 7, title: "테스트 스크롤용 회의 4", date: "2026.05.24", time: "10:00~11:00", room: "온라인", attendees: "테스트", color: "#94a3b8" },
];

export default function MeetingRegister() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const resetForm = () => {
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
  setSelectedMeetingId(null);
  setIsCreatingNew(true);
};
  const [meetingList, setMeetingList] = useState([
  {
    id: 1,
    title: "메인 서비스 UI 고도화",
    date: "2026.04.01",
    time: "14:00~15:00",
    room: "회의실 A",
    attendees: "김바라 외 2명",
    color: "#91D148",
  },
  {
    id: 2,
    title: "브랜드 마케팅 캠페인",
    date: "2026.04.10",
    time: "10:00~11:00",
    room: "회의실 B",
    attendees: "이팀장 외 3명",
    color: "#F47FB0",
  },
  {
    id: 3,
    title: "인프라 안정화 작업",
    date: "2026.03.15",
    time: "16:00~17:00",
    room: "온라인",
    attendees: "박CTO 외 1명",
    color: "#57A9F5",
  },
  {
    id: 4,
    title: "신규 유저 인터뷰 리서치",
    date: "2026.05.01",
    time: "13:00~14:00",
    room: "인터뷰룸",
    attendees: "최선임 외 2명",
    color: "#F4C84C",
  },
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
  
  // 💡 오늘 날짜 문자열(KST 로컬 시간 기준) 정확히 계산
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getLocalToday();

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
  {
    name: "메인 서비스 UI 고도화",
    color: "#91D148",
    owner: "김바라",
    period: "2026.04.01~2026.05.15",
  },
  {
    name: "브랜드 마케팅 캠페인",
    color: "#F47FB0",
    owner: "이팀장",
    period: "2026.04.10~2026.06.30",
  },
  {
    name: "인프라 안정화 작업",
    color: "#57A9F5",
    owner: "박CTO",
    period: "2026.03.15~2026.04.30",
  },
  {
    name: "신규 유저 인터뷰 리서치",
    color: "#F4C84C",
    owner: "최선임",
    period: "2026.05.01~2026.05.20",
  },
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteCompleteOpen, setIsDeleteCompleteOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [tempPendingAgendas, setTempPendingAgendas] = useState<any[]>([]);
  const [isRequiredModalOpen, setIsRequiredModalOpen] = useState(false);
  const handleSelectMeeting = (meeting: any) => {
      setSelectedMeetingId(meeting.id);
      setIsCreatingNew(false);

      setTitle(meeting.title);
      setSelectedProject(meeting.projectName || "");
      setDate(meeting.date.replaceAll(".", "-"));

      const [start, end] = meeting.time.split("~");
      setStartTime(start);
      setEndTime(end);

      setRoom(meeting.room === "장소 미정" ? "" : meeting.room);

      setSavedAgendas(meeting.savedAgendas || []);
      setSelectedPendingAgendas(meeting.selectedPendingAgendas || []);

      setAttendees(meeting.attendeesList || []);
      setSelectedTemplate(meeting.templateName || "");

      setIsFormModalOpen(true);
      };
  const handleMeetingClick = (meeting: {
  id: number;
  title: string;
  date: string;
  time: string;
  room: string;
  attendees: string;
  color: string;
}) => {
  setSelectedMeetingId(meeting.id);
  setTitle(meeting.title);
  setSelectedProject(meeting.projectName || "");
  setDate(meeting.date.replaceAll(".", "-"));

  const [start, end] = meeting.time.split("~");
  setStartTime(start);
  setEndTime(end);

  setRoom(meeting.room === "장소 미정" ? "" : meeting.room);

  if (meeting.attendees === "참석자 없음") {
    setAttendees([]);
  } else if (meeting.attendees.includes(" 외 ")) {
    const firstName = meeting.attendees.split(" 외 ")[0];
    setAttendees([firstName]);
  } else {
    setAttendees([meeting.attendees]);
  }

  setIsCreatingNew(false);
};
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
  setTempPendingAgendas((prev) => {
    const exists = prev.some((item) => item.id === agenda.id);

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

  if (!title.trim() || !date || !startTime || !endTime) {
  setIsRequiredModalOpen(true);
  return;
}
  
  if (startTime >= endTime) {
  setIsRequiredModalOpen(true);
  return;
}
  const selectedProjectInfo = projectOptions.find(
  (project) => project.name === selectedProject
  );
  const newMeeting = {
    id: Date.now(),
    title: title.trim(),
    projectName: selectedProject,
    date: formatDateToCard(date),
    time: `${startTime}~${endTime}`,
    room: room.trim() || "장소 미정",
    attendees: formatAttendeesText(attendees),
    attendeesList: attendees,
    templateName: selectedTemplate, 
    color: selectedProjectInfo?.color || "#91D148",
    savedAgendas: savedAgendas,
    selectedPendingAgendas: selectedPendingAgendas,
  };

  if (isCreatingNew) {
  setMeetingList((prev) => [newMeeting, ...prev]);
} else {
  setMeetingList((prev) =>
    prev.map((item) =>
      item.id === selectedMeetingId
        ? { ...item, ...newMeeting, id: item.id }
        : item
    )
  );
}
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
  setSelectedMeetingId(null);
  setIsCreatingNew(true);
};
 const handleDeleteMeeting = () => {
      if (selectedMeetingId === null) return;

      setMeetingList((prev) =>
        prev.filter((item) => item.id !== selectedMeetingId)
      );

      setSelectedMeetingId(null);
      setIsCreatingNew(true);

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

      setIsDeleteConfirmOpen(false);
      setIsDeleteCompleteOpen(true);
};
  return (
    <>
      <PageMeta title="회의바라 - 회의 등록" description="새로운 회의 일정 등록 및 관리" />
      <Toast message="회의가 성공적으로 예약되었습니다." subMessage="" isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      <div className="absolute inset-0 p-4 md:p-6 overflow-hidden bg-transparent">
        <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* === 좌측: 다가오는 회의 리스트 패널 === */}
          <div className="w-full lg:w-[400px] xl:w-[460px] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
            
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
                resetForm();
                setIsFormModalOpen(true);
              }}
                className={`w-full mt-4 py-3.5 rounded-xl font-black text-[14px] flex items-center justify-center gap-2 transition-all border-2 ${
                  isCreatingNew ? "bg-[#F4F9ED] text-[#91D148] border-[#91D148] shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-[#91D148]/50"
                }`}
              >
                <PlusIcon /> 새 회의 등록하기
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-gray-50/30">
              {meetingList.length > 0 ? (
               meetingList.map((meeting) => ( 
                  <div 
                    key={meeting.id}
                    onClick={() => handleSelectMeeting(meeting)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all border border-gray-200 border-l-[6px] overflow-hidden ${
                      selectedMeetingId === meeting.id
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
            
            <div className="p-8 pb-6 border-b border-gray-100 shrink-0 bg-white z-10">
                <div className="flex items-center justify-between mb-3">
  <span
    className={`text-[13px] font-black px-3.5 py-1.5 rounded-lg shadow-sm ${
      isCreatingNew ? "bg-[#91D148] text-white" : "bg-gray-200 text-gray-700"
    }`}
  >
    {isCreatingNew ? "새 회의 등록" : "예약된 회의 수정"}
  </span>

  {!isCreatingNew && (
    <button
      type="button"
      onClick={() => setIsDeleteConfirmOpen(true)}      
      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all"
    >
      삭제
    </button>
  )}
</div>
                
              
              <h2 className="text-[26px] lg:text-[30px] font-black text-gray-900 leading-tight tracking-tight">
                {isCreatingNew ? '새로운 일정을 기록해 볼까요?' : title}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
              <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-12">
                
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
                    회의 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예) AI 에이전트 서비스 주간 싱크"
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
                  />
                </div>

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
        const isSelected = selectedProject === project.name;

        return (
          <button
            key={project.name}
            type="button"
            onClick={() => {
              setSelectedProject(project.name);
              setIsProjectOpen(false);
            }}
            className={`w-full text-left px-5 py-4 border-b last:border-b-0 border-gray-100 transition-colors ${
              isSelected ? "bg-[#F8FBF2]" : "bg-white hover:bg-[#F8FBF2]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <div className="text-[16px] font-black text-gray-900">
                {project.name}
              </div>
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
                      날짜 <span className="text-red-500">*</span>
                    </label>
                    
                    {/* 💡 달력 호출 및 100% 꽉 차게 조절 */}
                    <div className="[&>div]:!w-full [&>div>div:first-child]:h-[54px] [&>div>div:first-child]:text-[15px]">
                      <DatePicker 
                        value={date} 
                        onChange={setDate}
                        placeholder="날짜 선택" 
                        minDate={today} // 오늘 날짜를 기준으로 과거 차단
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
                      placeholder="소회의실 1호 또는 화상 링크"
                      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
                      시작 시간 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
                      종료 시간 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
                    />
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
  onClick={() => {
    if (isPendingAgendaOpen) {
      setIsPendingAgendaOpen(false);
    } else {
      setTempPendingAgendas(selectedPendingAgendas);
      setIsPendingAgendaOpen(true);
    }
  }}
  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-[14px] font-black hover:bg-gray-50 transition-all shadow-sm"
>
  불러오기
</button>
  </div>

  {isPendingAgendaOpen && (
  <div className="mb-4 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
    <div className="max-h-[320px] overflow-y-auto">
      {pendingAgendaList.map((agenda) => {
        const isSelected = tempPendingAgendas.some(
          (item) => item.id === agenda.id
        );

        return (
          <button
            key={agenda.id}
            type="button"
            onClick={() => handleSelectPendingAgenda(agenda)}
            className={`relative w-full text-left px-5 py-5 pl-8 border-b last:border-b-0 border-gray-100 transition-colors ${
              isSelected
                ? "bg-[#F8FBF2]"
                : "bg-white hover:bg-[#F8FBF2]"
            }`}
          >
            {/* 왼쪽 색 띠 */}
            <span
              className="absolute left-0 top-0 h-full w-[6px]"
              style={{ backgroundColor: agenda.accentColor }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-gray-400 mb-2">
                  미결정발생일: {agenda.createdDate}
                </div>

                <div className="text-[18px] font-black text-gray-900 mb-3 leading-snug">
                  {agenda.title}
                </div>

                <div className="flex items-center gap-2 text-[14px] font-bold text-gray-500">
                  <span>프로젝트명:</span>
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: agenda.accentColor }}
                  />
                  <span className="text-gray-700">{agenda.projectName}</span>
                </div>
              </div>

              {/* 체크박스 */}
              <div
                className={`mt-1 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-[#91D148] bg-[#91D148]"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isSelected && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white">
  <div className="text-[13px] font-bold text-gray-500">
    {tempPendingAgendas.length}개 선택됨
  </div>

  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => {
        setTempPendingAgendas(selectedPendingAgendas);
        setIsPendingAgendaOpen(false);
      }}
      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-[13px] font-black border border-gray-200 hover:bg-gray-200 transition-all"
    >
      취소
    </button>

    <button
      type="button"
      onClick={() => {
        setSelectedPendingAgendas(tempPendingAgendas);
        setIsPendingAgendaOpen(false);
      }}
      className="px-4 py-2 rounded-lg bg-[#91D148] text-white text-[13px] font-black hover:opacity-90 transition-all"
    >
      확인
    </button>
  </div>
</div>  
  </div>
)}

  {selectedPendingAgendas.map((agenda) => (
  <div
    key={agenda.id}
    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm mb-4"
  >
    {/* 왼쪽 곡선 색 띠 */}
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

      <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-400">
        <span>프로젝트명:</span>
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: agenda.accentColor }}
        />
        <span className="text-gray-700 font-medium">{agenda.projectName}</span>
      </div>
    </div>

    <button
      type="button"
      onClick={() =>
    setSelectedPendingAgendas((prev) =>
          prev.filter((item) => item.id !== agenda.id)
        )
      }
      className="absolute right-4 top-4 text-gray-300 hover:text-red-500 transition-colors"
      aria-label="미결정 안건 삭제"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
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
                type="button"
                onClick={handleSubmit}
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
    <div className="w-[90%] max-w-[420px] rounded-2xl b
    g-white shadow-xl border border-gray-200 px-6 py-7">
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
  {/* 삭제 확인 팝업 */}
{isDeleteConfirmOpen && createPortal(
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
    <div className="w-[420px] rounded-[28px] bg-white shadow-xl border border-gray-200 px-8 py-8 text-center">
      <h3 className="text-[22px] font-black text-gray-900 mb-3">
        회의를 삭제하시겠습니까?
      </h3>
      <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
        삭제한 회의 정보는 복구할 수 없습니다.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setIsDeleteConfirmOpen(false)}
          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200 transition-all"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleDeleteMeeting}
          className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black hover:bg-red-600 transition-all"
        >
          삭제
        </button>
      </div>
    </div>
  </div>,
  document.body
)}

{/* 삭제 완료 팝업 */}
{isDeleteCompleteOpen && createPortal(
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
    <div className="w-[420px] rounded-[28px] bg-white shadow-xl border border-gray-200 px-8 py-8 text-center">
      <div className="flex justify-center mb-4 text-[#91D148]">
        <CheckCircleIcon />
      </div>

      <h3 className="text-[22px] font-black text-gray-900 mb-3">
        회의가 삭제되었습니다.
      </h3>
      <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
        선택한 회의 일정이 목록에서 삭제되었습니다.
      </p>

      <button
        type="button"
        onClick={() => setIsDeleteCompleteOpen(false)}
        className="w-full py-3 rounded-xl bg-[#91D148] text-white font-black hover:opacity-90 transition-all"
      >
        확인
      </button>
    </div>
  </div>,
  document.body
)}

{/* 필수 항목 안내 팝업 */}
{isRequiredModalOpen && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
    <div className="w-[420px] rounded-[28px] bg-white shadow-xl border border-gray-200 px-8 py-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <circle cx="12" cy="16.5" r="0.8" fill="#EF4444" stroke="none" />
          </svg>
        </div>
      </div>

      <h3 className="text-[22px] font-black text-gray-900 mb-3">
        필수 항목을 입력해주세요
      </h3>

      <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
       회의제목, 날짜, 시작 시간, 종료 시간은 <br />
      필수 입력 항목입니다.      </p>

      <button
        type="button"
        onClick={() => setIsRequiredModalOpen(false)}
        className="w-full py-3 rounded-xl bg-[#91D148] text-white font-black hover:opacity-90 transition-all"
      >
        확인
      </button>
    </div>
  </div>,
  document.body
)}
    </>
  );
}