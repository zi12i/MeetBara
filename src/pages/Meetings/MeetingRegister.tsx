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
  const [selectedProject, setSelectedProject] = useState(projectLabels[0].id);
  const [description, setDescription] = useState("");
  
  const [attendees, setAttendees] = useState<string[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(true);

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
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    setIsToastVisible(true);
    
    setTitle(""); setDate(""); setStartTime(""); setEndTime(""); setRoom(""); setAttendees([]); setDescription(""); setIsCreatingNew(true);
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
                  <span className="bg-gray-100 text-gray-500 text-[12px] px-2.5 py-1 rounded-full ml-1">{upcomingMeetings.length}건</span>
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
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting) => (
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
                    <label className="block text-[14px] font-bold text-gray-700 mb-2.5">연관 프로젝트 (색상 라벨)</label>
                    <div className="flex flex-wrap gap-3">
                      {projectLabels.map((proj) => (
                        <button key={proj.id} type="button" onClick={() => setSelectedProject(proj.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold transition-all border-2 ${ selectedProject === proj.id ? "bg-white border-[#91D148] shadow-sm text-gray-900" : "bg-white border-transparent hover:border-gray-200 text-gray-500 shadow-sm" }`}>
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: proj.color }}></span>{proj.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div>
    <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
      날짜 <span className="text-red-500">*</span>
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
                    <label className="block text-[14px] font-bold text-gray-700 mb-2.5">회의 안건 및 메모 (선택)</label>
                    {/* 데이터 길이에 상관없이 이 입력칸 아래로 스크롤 가능합니다. */}
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="회의 전 참석자들에게 공유할 안건이나 참고 사항을 자유롭게 적어주세요." className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-medium text-gray-800 focus:border-[#91D148] outline-none transition-all min-h-[300px] resize-y shadow-sm" />
                  </div>
                </div>
              </form>
            </div>

            {/* 하단 고정 버튼 (절대 스크롤 안됨) */}
            <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex justify-end shrink-0 z-10">
              <button onClick={handleSubmit} className="bg-[#91D148] text-white px-12 py-4 rounded-xl font-black text-[17px] shadow-[0_4px_12px_rgba(145,209,72,0.3)] hover:bg-[#82bd41] transition-all flex items-center gap-2">
                {isCreatingNew ? '회의 예약하기' : '변경사항 저장'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <MemberAddModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onAdd={handleAddMembers} />
    </>
  );
}