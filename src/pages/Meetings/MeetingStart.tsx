import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone";
import { createPortal } from "react-dom";

// --- SVG 아이콘 컴포넌트 ---
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const UsersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const MemoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const TargetIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const WarningIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const FolderIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const CheckCircleIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

// --- 시연을 위한 동적 데이터 생성 함수 ---
const generateTodayMeetings = () => {
  const now = new Date();
  
  const roundedNow = new Date(now);
  const minutes = roundedNow.getMinutes();
  const remainder = minutes % 10;
  if (remainder !== 0) {
    roundedNow.setMinutes(minutes + (10 - remainder));
  }
  roundedNow.setSeconds(0);
  roundedNow.setMilliseconds(0);
  
  const formatTime = (date: Date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const pastStart = new Date(roundedNow.getTime() - 120 * 60000);
  const pastEnd = new Date(roundedNow.getTime() - 60 * 60000);

  const upcoming1Start = new Date(roundedNow.getTime() + 10 * 60000);
  const upcoming1End = new Date(roundedNow.getTime() + 100 * 60000);

  const upcoming2Start = new Date(roundedNow.getTime() + 180 * 60000);
  const upcoming2End = new Date(roundedNow.getTime() + 240 * 60000);

  return [
    {
      id: "past_1",
      title: "아침 스크럼",
      endTime: pastEnd, 
      timeStr: `${formatTime(pastStart)} ~ ${formatTime(pastEnd)}`,
      room: "소회의실 1호",
      attendees: "김철수, 이영희",
      projectColor: "#94a3b8",
      briefing: null
    },
    {
      id: "1", 
      title: "[주간 정기] 신규 프로젝트 UI/UX 개선안 검토 회의",
      endTime: upcoming1End, 
      timeStr: `${formatTime(upcoming1Start)} ~ ${formatTime(upcoming1End)}`,
      room: "소회의실 2호",
      attendees: "김철수, 이영희, 박지민",
      projectColor: "#3b82f6", 
      briefing: {
        lastSummary: "• 메인 피드 레이아웃 A/B 테스트 진행 결정 (A안: 리스트형, B안: 카드형)\n• 테스트 기간: 3/20 ~ 3/27 (1주일)\n• 성공 지표: 체류시간 10% 증가 및 스크롤 뎁스 개선",
        todaysGoal: "• A/B 테스트 결과 리포트 공유 및 최종 레이아웃 확정\n• 디자인 시스템 프라이머리 컬러(연두색) 적용 범위 논의\n• 다음 스프린트 개발 일정 산정",
        expectedIssues: "• B안(카드형) 적용 시 기존 API 응답 속도 저하 우려 (백엔드 최적화 필요)\n• 영업팀에서 요청한 상단 배너 영역 축소에 대한 디자인/영업팀 간 의견 조율"
      }
    },
    {
      id: "2",
      title: "하반기 채용 연계형 인턴십 기획 회의",
      endTime: upcoming2End, 
      timeStr: `${formatTime(upcoming2Start)} ~ ${formatTime(upcoming2End)}`,
      room: "대회의실",
      attendees: "박인사, 최채용",
      projectColor: "#f59e0b",
      briefing: {
        lastSummary: "• 2026년 하반기 인턴십 TO 확정 (총 15명)\n• 개발/디자인/기획 직군별 배분 비율 1차 논의",
        todaysGoal: "• 인턴십 전형 일정표 최종 확정 (서류-면접-발표)\n• 코딩테스트 및 사전과제 출제 위원 선정",
        expectedIssues: "• 실무진 면접관 차출로 인한 부서별 리소스 부족 우려\n• 경쟁사 인턴십 일정과의 겹침 문제 해결 방안"
      }
    },
  ];
};

export default function MeetingStart() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  useEffect(() => {
    const todayMeetings = generateTodayMeetings();
    const now = new Date();
    
    const validMeetings = todayMeetings.filter(m => m.endTime > now);
    
    setMeetings(validMeetings);
    if (validMeetings.length > 0) {
      setSelectedMeeting(validMeetings[0]); 
    }

    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { scenarioId: "briefing", customMessage: "오늘 남은 회의 목록입니다. 시작 전에 브리핑 노트를 꼭 확인해 보세요." } 
    });
    window.dispatchEvent(event);
  }, []);

  const handleStartMeeting = (id: string) => {
    window.open(`/meeting/${id}/live`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <PageMeta title="회의바라 - 회의 시작" description="오늘 예정된 회의 리스트와 사전 브리핑 노트" />
      {createPortal(<CapybaraZone />, document.body)}

      {/* 💡 핵심 솔루션: absolute inset-0 사용! AppLayout과 무관하게 영역을 강제 고정합니다. */}
      <div className="absolute inset-0 p-4 md:p-6 overflow-hidden bg-transparent">
        
        {/* 이 래퍼에서 좌우 패널을 나누고 높이를 100% 사용합니다. */}
        <div className="w-full h-full max-w-(--breakpoint-2xl) mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* === 좌측: 다가오는 회의 리스트 패널 === */}
          <div className="w-full lg:w-[400px] xl:w-[460px] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
            
            {/* 상단 고정 영역 */}
            <div className="p-6 pb-4 border-b border-gray-100 bg-white z-10 shrink-0">
              <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2.5">
                <span className="text-gray-800"><CalendarIcon /></span>
                오늘 예정된 회의
                <span className="bg-gray-100 text-gray-500 text-[12px] px-2.5 py-1 rounded-full ml-1">{meetings.length}건</span>
              </h2>
            </div>
            
            {/* 💡 이 패널의 컨텐츠만 상하로 독립적으로 스크롤됩니다 (flex-1 overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-gray-50/30">
              {meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <div 
                    key={meeting.id}
                    onClick={() => setSelectedMeeting(meeting)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all border border-gray-200 border-l-[6px] overflow-hidden ${
                      selectedMeeting?.id === meeting.id 
                        ? "bg-white shadow-md border-r border-t border-b border-gray-200" 
                        : "bg-white shadow-sm hover:shadow-md hover:bg-gray-50/50"
                    }`}
                    style={{ borderLeftColor: meeting.projectColor }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[12px] font-black px-2.5 py-1 rounded-md bg-gray-100 text-gray-600" style={{ color: meeting.projectColor }}>{meeting.timeStr}</span>
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

          {/* === 우측: 브리핑 노트 패널 === */}
          <div className="flex-1 h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
            {selectedMeeting ? (
              <>
                {/* 헤더 고정 영역 */}
                <div className="p-8 lg:p-10 pb-6 border-b border-gray-100 shrink-0 relative bg-white z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#91D148] text-white text-[13px] font-black px-3.5 py-1.5 rounded-lg shadow-sm">AI 사전 브리핑</span>
                    <span className="w-2.5 h-2.5 rounded-full ml-1.5" style={{ backgroundColor: selectedMeeting.projectColor }}></span>
                    <span className="text-gray-500 text-[14px] font-bold px-1.5">{selectedMeeting.timeStr}</span>
                  </div>
                  <h2 className="text-[26px] lg:text-[30px] font-black text-gray-900 mb-6 leading-tight tracking-tight">
                    {selectedMeeting.title}
                  </h2>
                  <div className="flex gap-6 text-[14px] font-bold text-gray-600 bg-gray-50 py-3.5 px-6 rounded-xl inline-flex border border-gray-100">
                    <p className="flex items-center gap-2"><span className="text-gray-400"><MapPinIcon /></span> {selectedMeeting.room}</p>
                    <div className="w-[1px] h-4 bg-gray-300 my-auto"></div>
                    <p className="flex items-center gap-2"><span className="text-gray-400"><UsersIcon /></span> 참석자: {selectedMeeting.attendees}</p>
                  </div>
                </div>

                {/* 💡 브리핑 컨텐츠 스크롤 영역 (flex-1 overflow-y-auto) */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8 no-scrollbar bg-white">
                  <div className="bg-[#F4F9ED]/60 border border-[#91D148]/20 rounded-2xl p-8 shadow-sm">
                    <h4 className="flex items-center gap-2.5 font-black text-[#628A31] text-[17px] mb-5">
                      <MemoIcon /> 지난 회의 요약
                    </h4>
                    <div className="text-[15px] text-gray-700 font-medium leading-relaxed whitespace-pre-wrap pl-1">
                      {selectedMeeting.briefing?.lastSummary || "등록된 요약 내용이 없습니다."}
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-8 shadow-sm">
                    <h4 className="flex items-center gap-2.5 font-black text-blue-600 text-[17px] mb-5">
                      <TargetIcon /> 오늘의 목표
                    </h4>
                    <div className="text-[15px] text-gray-700 font-medium leading-relaxed whitespace-pre-wrap pl-1">
                      {selectedMeeting.briefing?.todaysGoal || "등록된 목표가 없습니다."}
                    </div>
                  </div>

                  <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8 shadow-sm mb-6">
                    <h4 className="flex items-center gap-2.5 font-black text-red-500 text-[17px] mb-5">
                      <WarningIcon /> 예상 이슈 및 리스크
                    </h4>
                    <div className="text-[15px] text-gray-700 font-medium leading-relaxed whitespace-pre-wrap pl-1">
                      {selectedMeeting.briefing?.expectedIssues || "예상되는 이슈가 없습니다."}
                    </div>
                  </div>
                  
                  <div className="h-4"></div>
                </div>

                {/* 하단 고정: 회의 시작 버튼 (절대 스크롤되지 않음) */}
                <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex justify-end shrink-0 z-10">
                  <button 
                    onClick={() => handleStartMeeting(selectedMeeting.id)}
                    className="bg-[#91D148] text-white px-12 py-4 rounded-xl font-black text-[17px] shadow-[0_4px_12px_rgba(145,209,72,0.3)] hover:bg-[#82bd41] transition-all flex items-center gap-2 group"
                  >
                    회의 시작하기
                    <svg className="group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 font-bold space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                  <FolderIcon />
                </div>
                <p>왼쪽 리스트에서 회의를 선택하시면 브리핑 노트가 표시됩니다.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}