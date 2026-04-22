import React, { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import { EventInput } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import CapybaraZone from "../components/common/CapybaraZone";
import { createPortal } from "react-dom";

// === 1. 데이터 타입 정의 ===
interface MeetingEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps: {
    calendar: "Primary" | "Danger" | "Warning" | "Success";
    projectName: string;
    projectFullName: string;
    location: string;
    participants: string[];
    description: string;
    manager: string; // 책임자(PM)
    departments: string; // 참여부서
    nature: string; // 회의 성격
    duration: string; // 소요 시간
    agendas: string[]; // 안건
    undecidedAgendas: string[]; // 미결정 안건
    materialLink?: { title: string; url: string }; // 사전자료
    history?: { id: string; title: string; date: string }[]; // 연결된 히스토리
    meetingCount?: number;
  };
}

// === 헬퍼 함수: 날짜 포맷 ===
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// === 실시간 상태 판단 로직 ===
const getStatusBadge = (startStr: string) => {
  const now = new Date(); // 현재 시간 기준: 2026-04-22 16:49
  const start = new Date(startStr);
  
  if (start < now) {
    return { label: "완료", style: "bg-gray-400 text-white" };
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diffTime = startDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "D-Day", style: "bg-white text-[#91D148]" };
  return { label: `D-${diffDays}`, style: "bg-white/20 text-white border border-white/30" };
};

// === 2. 회의 상세 정보 모달 컴포넌트 (원본 유지) ===
const MeetingDetailContent: React.FC<{ 
  meeting: MeetingEvent; 
  onClose: () => void;
}> = ({ meeting, onClose }) => {
  const colorMap = { Primary: "#4D7CFE", Danger: "#FF6B6B", Warning: "#FF9F43", Success: "#91D148" };
  const getDayOfWeek = (dateStr: string) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date(dateStr).getDay()];
  };

  const status = getStatusBadge(meeting.start);
  const projectColor = colorMap[meeting.extendedProps.calendar];

  return (
    <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
      <div 
        className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10 shrink-0"
        style={{ borderLeft: `6px solid ${projectColor}` }}
      >
        <div>
          <p className="text-[12px] font-bold text-gray-400 mb-1">{meeting.extendedProps.projectName}</p>
          <h2 className="text-[24px] font-black text-gray-900 leading-tight">{meeting.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 text-[22px] font-bold"
        >
          ✕
        </button>
      </div>

      <div className="p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar no-scrollbar">
        <div className="border border-gray-100 rounded-[24px] p-7 bg-white shadow-sm">
          <p className="text-[12px] font-black text-gray-400 mb-5 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-3 bg-gray-200 rounded-full" /> 회의 개요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs">일자 및 시간</span>
              <p className="text-gray-800 font-black text-[15px]">
                {meeting.start.split('T')[0].replace(/-/g, '.')} ({getDayOfWeek(meeting.start)}) | {meeting.start.split('T')[1].slice(0, 5)} ~ {meeting.end?.split('T')[1].slice(0, 5)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs">소요 시간</span>
              <p className="text-gray-800 font-black text-[15px]">{meeting.extendedProps.duration}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs">장소 / 접속 정보</span>
              <p className="text-gray-800 font-black text-[15px]">{meeting.extendedProps.location}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs">상태 및 성격</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-black border ${status.label === '완료' ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-[#F4F9ED] text-[#91D148] border-[#91D148]/20'}`}>
                  {status.label}
                </span>
                <span className="text-gray-800 font-black text-[15px]">{meeting.extendedProps.nature}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-100 rounded-[24px] p-7 bg-white shadow-sm">
          <p className="text-[12px] font-black text-gray-400 mb-5 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-3 bg-gray-200 rounded-full" /> 프로젝트 정보
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-1">프로젝트 명</span>
                <p className="text-gray-800 font-black">{meeting.extendedProps.projectFullName}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-1">책임자 (PM)</span>
                <p className="text-gray-800 font-bold">{meeting.extendedProps.manager}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-1">참여 부서</span>
                <p className="text-gray-800 font-bold">{meeting.extendedProps.departments}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-2">참여자</span>
                <div className="flex flex-wrap gap-1.5">
                  {meeting.extendedProps.participants.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-[11px] font-bold border border-gray-100">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#F4F9ED]/40 border border-[#91D148]/10 rounded-[24px] p-7">
            <p className="text-[12px] font-black text-[#91D148] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#91D148] rounded-full" /> 논의 안건
            </p>
            <ul className="space-y-3">
              {meeting.extendedProps.agendas.map((item, i) => (
                <li key={i} className="text-[13px] text-gray-700 font-bold flex gap-3 leading-relaxed">
                  <span className="text-[#91D148]">Q.</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50/30 border border-red-100 rounded-[24px] p-7">
            <p className="text-[12px] font-black text-red-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> 미결정 안건
            </p>
            <ul className="space-y-3">
              {meeting.extendedProps.undecidedAgendas.map((item, i) => (
                <li key={i} className="text-[13px] text-gray-700 font-bold flex gap-3 leading-relaxed">
                  <span className="text-red-400">•</span> {item}
                </li>
              ))}
              {meeting.extendedProps.undecidedAgendas.length === 0 && (
                <p className="text-[12px] text-gray-300 italic">현재 모든 안건이 결정되었습니다.</p>
              )}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-50 pt-8">
          <div>
            <span className="text-[11px] font-black text-gray-400 block mb-4 uppercase tracking-widest">사전 공유 자료</span>
            {meeting.extendedProps.materialLink ? (
              <a href={meeting.extendedProps.materialLink.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#91D148] transition-all group w-full">
                <span className="text-xl group-hover:scale-110 transition-transform">📎</span>
                <div className="overflow-hidden">
                  <p className="text-[13px] font-black text-gray-800 truncate">{meeting.extendedProps.materialLink.title}</p>
                  <p className="text-[10px] text-gray-400">클릭하여 자료 확인</p>
                </div>
              </a>
            ) : (
              <p className="text-gray-300 text-sm italic">등록된 사전 자료가 없습니다.</p>
            )}
          </div>
          <div>
            <span className="text-[11px] font-black text-gray-400 block mb-4 uppercase tracking-widest">연결된 히스토리</span>
            <div className="space-y-2">
              {meeting.extendedProps.history?.map((h) => (
                <button key={h.id} className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex justify-between items-center group border border-transparent">
                  <span className="text-[12px] font-bold text-gray-700 group-hover:text-[#91D148]">{h.title}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{h.date}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 pb-6">
          <button className="px-8 py-4 bg-[#91D148] text-white font-black rounded-xl shadow-lg shadow-[#91D148]/20 hover:brightness-105 transition-all active:scale-95 text-[15px] flex items-center gap-2">
            <span>✨</span> 브리핑 카드 보기
          </button>
        </div>
      </div>
    </div>
  );
};

// === 3. 메인 캘린더 컴포넌트 ===
const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const currentTimeStr = useMemo(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
  }, []);

  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState("");
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingEvent | null>(null);
  
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const hexColors = { Primary: "#4D7CFE", Danger: "#FF6B6B", Warning: "#FF9F43", Success: "#91D148" };

  useEffect(() => {
    const mockData: MeetingEvent[] = [
      { id: "1", title: "신규 프로젝트 기획 및 UI/UX 방향성 수립 회의", start: "2026-04-25T10:00:00", end: "2026-04-25T11:30:00", extendedProps: { calendar: "Success", projectName: "AI 바라 고도화", projectFullName: "AI 미팅 에이전트 서비스 바라(BARA) 고도화 프로젝트", location: "본사 4층 대회의실 (A-1)", manager: "김철수 팀장", departments: "디지털혁신부", participants: ["김철수", "이영희", "박지민", "최유진"], nature: "정기 주간 회의", duration: "90분", agendas: ["통합 UI 구조 확정", "모바일 앱 메인 탭 구조 변경안 검토"], undecidedAgendas: ["푸시 알림 세부 정책 수립"], materialLink: { title: "UI 기획안_v1.2.pdf", url: "#" }, history: [{ id: "h1", title: "1차 기획 방향성 회의", date: "2026.04.18" }], description: "" } },
      { id: "2", title: "바라(BARA) 서비스 디자인 2차 리뷰", start: "2026-04-22T14:00:00", end: "2026-04-22T15:30:00", extendedProps: { calendar: "Primary", projectName: "BARA 디자인", projectFullName: "바라 서비스 아이덴티티 고도화", location: "온라인 (Zoom)", manager: "이영희 수석", departments: "디자인팀", participants: ["이영희", "홍길동", "박지민"], nature: "디자인 리뷰", duration: "90분", agendas: ["컬러 시스템 점검", "아이콘 에셋 최종 점검"], undecidedAgendas: ["다크모드 지원 여부"], materialLink: { title: "디자인 가이드.figma", url: "#" }, history: [], description: "" } }
    ];
    setEvents(mockData);
    setTimeout(() => updateTitle(), 100);
  }, []);

  const updateTitle = () => { if (calendarRef.current) setCalendarTitle(calendarRef.current.getApi().view.title); };
  
  const projectColorMap = useMemo(() => {
    const map: any = {};
    events.forEach(ev => { if (!map[ev.extendedProps.projectName]) map[ev.extendedProps.projectName] = ev.extendedProps.calendar; });
    return map;
  }, [events]);

  const consistentEvents = useMemo(() => events.map(ev => ({ ...ev, extendedProps: { ...ev.extendedProps, calendar: projectColorMap[ev.extendedProps.projectName] } })), [events, projectColorMap]);
  const projectLegends = useMemo(() => Object.entries(projectColorMap).map(([name, type]: any) => ({ name, type })), [projectColorMap]);

  const dailyMeetings = useMemo(() => {
    return consistentEvents.filter(ev => ev.start.startsWith(selectedDate)).sort((a, b) => a.start.localeCompare(b.start));
  }, [consistentEvents, selectedDate]);

  const handleViewChange = (viewType: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      api.changeView(viewType);
      setCurrentView(viewType);
      setSelectedDate(todayStr);
      updateTitle();
      if (viewType !== 'dayGridMonth') {
        setTimeout(() => { api.scrollToTime(currentTimeStr); }, 50);
      }
    }
  };

  const moveDate = (direction: 'prev' | 'next') => {
    const api = calendarRef.current?.getApi();
    if (api) { direction === 'prev' ? api.prev() : api.next(); updateTitle(); }
  };

  return (
    <>
      <PageMeta title="회의일정관리 | 회의바라" description="월별, 주별, 일별 회의 일정을 관리합니다." />
      <div className="flex gap-6 h-[calc(100vh-140px)] animate-fade-in relative overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="flex flex-col gap-4 mb-6 px-4 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <h2 className="text-[28px] font-black text-gray-900 tracking-tight">{calendarTitle}</h2>
                <div className="flex gap-2">
                  <button onClick={() => moveDate('prev')} className="w-10 h-10 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center font-bold shadow-sm transition-all active:scale-95 text-gray-400 hover:text-gray-800">〈</button>
                  <button onClick={() => moveDate('next')} className="w-10 h-10 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center font-bold shadow-sm transition-all active:scale-95 text-gray-400 hover:text-gray-800">〉</button>
                </div>
              </div>
              <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                {[{ label: "MONTHLY", view: "dayGridMonth" }, { label: "WEEKLY", view: "timeGridWeek" }, { label: "DAILY", view: "timeGridDay" }].map((item) => (
                  <button key={item.label} onClick={() => handleViewChange(item.view)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${currentView === item.view ? "bg-[#91D148] text-white shadow-md shadow-[#91D148]/20" : "text-gray-400 hover:text-gray-600"}`}>{item.label}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-5 bg-gray-50/50 py-2.5 px-4 rounded-2xl w-fit border border-gray-100/50">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mr-2">PROJECTS</span>
              <div className="flex items-center gap-6">
                {projectLegends.map((legend, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hexColors[legend.type as keyof typeof hexColors] }} />
                    <span className="text-[12px] font-bold text-gray-600 whitespace-nowrap">{legend.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden flex flex-col relative">
            <div className={`flex-1 px-8 py-6 ${currentView === 'dayGridMonth' ? 'custom-month-grid' : 'custom-time-grid'}`}>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={koLocale}
                headerToolbar={false}
                events={consistentEvents}
                selectable={true}
                dateClick={(arg) => setSelectedDate(arg.dateStr)}
                eventClick={(info) => {
                  if (currentView === "dayGridMonth") {
                    setSelectedDate(info.event.startStr.split('T')[0]);
                  } else {
                    const meeting = consistentEvents.find(e => e.id === info.event.id);
                    if (meeting) { setSelectedMeeting(meeting); openModal(); }
                  }
                }}
                eventContent={(arg) => currentView === "dayGridMonth" ? renderMonthEvent(arg) : renderWeekEvent(arg, hexColors)}
                height={currentView === 'dayGridMonth' ? 'auto' : '100%'}
                stickyHeaderDates={currentView !== 'dayGridMonth'}
                dayCellContent={(args) => args.dayNumberText.replace("일", "")}
                dayCellClassNames={(arg) => formatDate(arg.date) === selectedDate ? 'is-selected' : ''}
                dayHeaderContent={(args) => {
                  const dateKey = formatDate(args.date);
                  const isSelected = currentView !== 'dayGridMonth' && dateKey === selectedDate;
                  const isToday = args.isToday;
                  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  const dayName = dayNames[args.date.getDay()];
                  return (
                    <div className={`calendar-header-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`} onClick={() => setSelectedDate(dateKey)}>
                      <span className="day-name">{dayName}</span>
                      {currentView !== 'dayGridMonth' && (
                        <div className="day-date-circle">
                          <span className="day-date">{args.date.getDate()}</span>
                        </div>
                      )}
                    </div>
                  );
                }}
                slotMinTime="07:00:00"
                slotMaxTime="24:00:00"
                slotDuration="00:30:00"
                nowIndicator={true}
                allDaySlot={false}
                fixedWeekCount={false}
              />
            </div>
          </div>
        </div>

        {currentView === "dayGridMonth" && (
          <div className="hidden lg:flex w-[380px] flex-col h-full overflow-hidden shrink-0 animate-fade-in">
            <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0 pt-8">
                <div className="px-7 mb-6 flex justify-between items-end shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-black text-[#91D148] uppercase tracking-tighter">Daily Briefing</span>
                    <span className="text-[22px] font-black text-gray-900 tracking-tight leading-none">{selectedDate.replace(/-/g, '.')}</span>
                  </div>
                  <button onClick={() => setSelectedDate(todayStr)} className="text-[12px] font-bold text-gray-400 hover:text-[#91D148] underline underline-offset-4">오늘로</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-5 no-scrollbar">
                  {dailyMeetings.length > 0 ? dailyMeetings.map((meeting) => (
                    <div key={meeting.id} onClick={() => { setSelectedMeeting(meeting); openModal(); }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#91D148]/30 transition-all border-l-8 cursor-pointer shrink-0 group" style={{ borderLeftColor: hexColors[meeting.extendedProps.calendar as keyof typeof hexColors] }}>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[12px] font-black text-[#91D148] bg-[#F4F9ED] px-2 py-1 rounded">{meeting.start.split('T')[1].slice(0, 5)}</span>
                          <span className="text-[11px] font-bold text-gray-400 truncate max-w-[150px]">{meeting.extendedProps.projectName}</span>
                        </div>
                        <h4 className="font-black text-gray-800 text-[16px] line-clamp-2 group-hover:text-[#91D148] transition-colors leading-snug">{meeting.title}</h4>
                        <p className="text-[13px] text-gray-500 font-medium flex items-center gap-1.5"><span className="grayscale opacity-70">📍</span> {meeting.extendedProps.location}</p>
                      </div>
                      <button className="mt-5 w-full py-2.5 bg-gray-50 text-gray-400 group-hover:bg-[#91D148] group-hover:text-white rounded-xl font-black text-xs transition-all">상세 정보 보기</button>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
                      <div className="text-5xl mb-4 opacity-50">🐹</div>
                      <p className="text-[14px] font-black text-center">등록된 일정이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 bg-white border-t border-gray-50 shrink-0">
                <button className="w-full py-4 bg-[#91D148] text-white font-black rounded-2xl shadow-lg shadow-[#91D148]/10 hover:brightness-105 transition-all">이 날짜에 회의 등록</button>
              </div>
            </div>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[860px] w-full p-0 rounded-[28px] overflow-hidden">
          {selectedMeeting && <MeetingDetailContent meeting={selectedMeeting} onClose={closeModal} />}
        </Modal>
        {typeof document !== "undefined" && createPortal(<CapybaraZone />, document.body)}
      </div>

      <style>{`
        .fc { font-family: inherit !important; border: none !important; }
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #f8f8f8 !important; }

        .custom-month-grid { overflow-y: auto !important; height: 100%; }
        .custom-month-grid .fc-scroller { height: auto !important; overflow-y: visible !important; }
        
        .custom-time-grid { height: 100%; overflow: hidden; display: flex; flex-direction: column; }
        .custom-time-grid .fc-view-harness { flex-grow: 1; }
        .custom-time-grid .fc-scroller { overflow-y: auto !important; height: 100% !important; }
        
        /* 헤더 스타일 보정 */
        .fc .fc-col-header-cell-cushion { padding: 0 !important; width: 100%; }

        .calendar-header-cell { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 6px; 
          width: 100%; 
          padding: 12px 0; 
          cursor: pointer; 
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        .calendar-header-cell .day-name { font-size: 13px; font-weight: 800; color: #bbb; text-transform: uppercase; }
        .calendar-header-cell .day-date-circle { 
          width: 36px; 
          height: 36px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border-radius: 50%; 
          transition: all 0.2s; 
        }
        .calendar-header-cell .day-date { font-size: 16px; font-weight: 900; color: #333; }
        
        .calendar-header-cell.is-today .day-date-circle { background-color: #91D148 !important; }
        .calendar-header-cell.is-today .day-date { color: #fff !important; }

        .calendar-header-cell.is-selected { 
          border: 2px solid #91D148 !important; 
          border-radius: 16px;
          background-color: rgba(145, 209, 72, 0.03);
          z-index: 2;
        }
        .calendar-header-cell.is-selected .day-name { color: #91D148; }

        .fc-daygrid-day.is-selected { box-shadow: inset 0 0 0 2px #91D148 !important; background-color: rgba(145, 209, 72, 0.05) !important; z-index: 2; }
        .fc-timegrid-slot { height: 55px !important; border-bottom: 1px solid #f9f9f9 !important; }
        .fc-timegrid-slot-label-cushion { font-size: 11px !important; font-weight: 800 !important; color: #999 !important; }

        /* === 실시간 시간선 (타임라인 결합형 설계) === */
        .fc-timegrid-now-indicator-container { overflow: visible !important; }
        .fc-timegrid-now-indicator-line { 
          border-color: #91D148 !important; 
          border-top-width: 2px !important; 
          z-index: 100 !important; 
          left: -64px !important; 
          width: calc(100% + 64px) !important;
          pointer-events: none;
        }
        .fc-timegrid-now-indicator-line::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background: #91D148;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(145, 209, 72, 0.4);
          z-index: 101;
        }
        .fc-timegrid-now-indicator-arrow { display: none !important; } 

        .fc-scroller::-webkit-scrollbar { width: 8px; }
        .fc-scroller::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        
        .fc-event { cursor: pointer; border-radius: 12px !important; border: none !important; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

const renderMonthEvent = (eventInfo: any) => {
  const { calendar } = eventInfo.event.extendedProps;
  const colorMap: any = { Danger: "bg-[#FF6B6B]", Primary: "bg-[#4D7CFE]", Success: "bg-[#91D148]", Warning: "bg-[#FF9F43]" };
  return <div className={`w-full h-6 rounded-md shadow-sm ${colorMap[calendar] || 'bg-gray-400'}`} />;
};

const renderWeekEvent = (eventInfo: any, hexColors: any) => {
  const { calendar, projectName } = eventInfo.event.extendedProps;
  const status = getStatusBadge(eventInfo.event.startStr);
  
  const isCompleted = status.label === '완료';
  const bgColor = isCompleted ? "#E0E0E0" : (hexColors[calendar as keyof typeof hexColors] || "#91D148");
  const textColor = isCompleted ? "#9E9E9E" : "white";
  
  return (
    <div 
      className={`flex flex-col h-full w-full p-2.5 gap-1.5 rounded-xl border-l-[6px] shadow-sm overflow-hidden group transition-all ${isCompleted ? '' : 'hover:brightness-95'}`} 
      style={{ 
        backgroundColor: bgColor + (isCompleted ? '' : 'E6'), 
        borderLeftColor: isCompleted ? '#BDBDBD' : 'rgba(0,0,0,0.15)',
        color: textColor 
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black whitespace-nowrap shadow-sm ${status.style}`}>
          {status.label}
        </span>
        <span className={`text-[8px] font-bold opacity-70 truncate uppercase tracking-tighter ${isCompleted ? 'grayscale' : ''}`}>
          {projectName}
        </span>
      </div>
      <div className={`text-[12px] font-black leading-[1.3] line-clamp-2 ${isCompleted ? 'opacity-60' : 'drop-shadow-sm'}`}>
        {eventInfo.event.title}
      </div>
    </div>
  );
};

export default Calendar;