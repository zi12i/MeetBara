import React, { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone"; 
import { createPortal } from "react-dom"; 
import { useNavigate } from "react-router-dom"; 

// --- 시연용 데이터 및 헬퍼 함수 ---
const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
};

const recentMeetings = [
  { id: 1, title: "신규 프로젝트 기획", date: "2026.03.28", members: "김철수, 이영희, 박지민", keywords: "알림센터, 통합구조", content: "공지 중심으로 우선 통합 후 확장...", borderColor: "#91D148" },
  { id: 2, title: "A/B 테스트 리뷰", date: "2026.03.21", members: "김철수, 이영희", keywords: "CTR, 상승", content: "CTR 기준 B안 15% 상승 확인", borderColor: "#CAE7A7" },
  { id: 3, title: "UX 성과 지표 정의", date: "2026.03.25", members: "이영희, 최유진", keywords: "체류시간", content: "추가지표(체류시간) 도입 필요", borderColor: "#E2F3CA" },
  { id: 4, title: "마케팅 캠페인 킥오프", date: "2026.04.05", members: "최유진, 박지민", keywords: "타겟팅, 예산", content: "20대 여성 타겟으로 예산 30% 증액 확정", borderColor: "#91D148" },
  { id: 5, title: "주말 서버 장애 회고", date: "2026.04.10", members: "김철수, 박지민", keywords: "서버다운, 트래픽", content: "DB 커넥션 풀 부족 문제 해결 완료", borderColor: "#CAE7A7" },
  { id: 6, title: "디자인 시스템 개편", date: "2026.04.15", members: "이영희, 홍길동", keywords: "컴포넌트, 컬러", content: "프라이머리 컬러 연두색(#91D148) 적용", borderColor: "#E2F3CA" }
];

const upcomingMeetings = [
  { id: 1, title: "AI 에이전트 고도화", date: "2026.05.14", time: "14:00~15:30", room: "소회의실 2호", owner: "김 PM", borderColor: "#FF9F43" },
  { id: 2, title: "연말 성과 발표", date: "2026.12.29", time: "09:30~11:30", room: "대강당", owner: "홍 과장", borderColor: "#4BC0C0" },
  { id: 3, title: "디자인 가이드라인 검토", date: "2026.05.20", time: "11:00~12:00", room: "온라인", owner: "이 디자이너", borderColor: "#36A2EB" },
  { id: 4, title: "하반기 채용 계획 논의", date: "2026.06.02", time: "10:00~11:00", room: "대회의실", owner: "박 팀장", borderColor: "#FF6B6B" },
  { id: 5, title: "신규 파트너사 미팅", date: "2026.06.15", time: "15:00~16:00", room: "외부 미팅", owner: "최 영업", borderColor: "#9966FF" },
  { id: 6, title: "보안 점검 사전 회의", date: "2026.06.20", time: "13:30~14:30", room: "소회의실 1호", owner: "정 보안", borderColor: "#FFCE56" }
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [today, setToday] = useState("");

  const upcomingScrollRef = useRef<HTMLDivElement>(null);
  const recentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToday(getTodayStr());
    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { scenarioId: "home", customMessage: "어서오세요! 오늘 진행할 회의가 있는지 확인해 드릴까요? 🐹" } 
    });
    window.dispatchEvent(event);
  }, []);

  const filterFn = (item: any) => 
    (item.title || "").includes(searchQuery) || 
    (item.members || "").includes(searchQuery) || 
    (item.keywords || "").includes(searchQuery) ||
    (item.owner || "").includes(searchQuery);

  const filteredOngoing = searchQuery === "" ? true : "실시간 주간 정기 회의".includes(searchQuery);
  const filteredUpcoming = upcomingMeetings.filter(filterFn);
  const filteredRecent = recentMeetings.filter(filterFn);

  const handleJoinMeeting = (path: string) => {
    window.open(path, "_blank", "noopener,noreferrer");
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 344;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      <PageMeta title="회의바라 - 홈" description="업무 생산성을 위한 똑똑한 AI 회의 파트너" />
      {createPortal(<CapybaraZone />, document.body)}
      
      <div className="w-full space-y-12 pb-20 bg-white min-h-screen">
        
        {/* 1. 통합 검색 바 */}
        <div className="flex justify-center pt-[60px] px-6">
          <div className="relative w-full max-w-[700px]">
            <span className="absolute inset-y-0 left-4 flex items-center text-[#91D148]">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="회의명, 참석자, 키워드를 입력하세요"
              className="w-full py-4 pl-12 pr-4 bg-[#F4F9ED] border-2 border-transparent rounded-2xl text-[15px] focus:bg-white focus:border-[#91D148] focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 2. 진행 중인 회의 (TOP) - 덜어내고 깔끔해진 버전 */}
        <section className="px-6 mx-auto w-full max-w-(--breakpoint-2xl)">
          <SectionTitle title="진행 중인 회의" />
          {filteredOngoing ? (
            <div 
              onClick={() => handleJoinMeeting("/meeting/1/live")}
              className="bg-[#F4F9ED] border-2 border-[#91D148] rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:shadow-md transition-all group"
            >
              {/* 좌측: 회의 정보 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 bg-[#91D148] text-white text-[12px] font-black px-2.5 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>LIVE
                  </span>
                  <span className="text-gray-500 text-[13px] font-bold">{today} • 진행 중</span>
                </div>
                
                <h3 className="text-[20px] md:text-[24px] font-black text-gray-900 mb-4 leading-tight">
                  [주간 정기] 신규 프로젝트 UI/UX 개선안 검토 회의
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-600 font-medium mb-5">
                  <span className="flex items-center gap-1.5">👥 김철수, 이영희, 박지민</span>
                  <span className="w-[1px] h-3 bg-gray-300"></span>
                  <span className="flex items-center gap-1.5">📍 소회의실 2호 (오프라인)</span>
                </div>
                
                <div className="bg-white px-4 py-3 rounded-xl border border-[#91D148]/20 inline-block shadow-sm">
                  <p className="text-[#91D148] text-[11px] font-black mb-0.5">현재 기록 중인 안건</p>
                  <p className="text-[14px] font-bold text-gray-800">"메인 피드 레이아웃 B안 확정 여부 논의"</p>
                </div>
              </div>

              {/* 우측: 입장 버튼 */}
              <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <button className="w-full md:w-auto bg-[#91D148] text-white px-8 py-4 rounded-xl font-black text-[15px] hover:bg-[#82bd41] transition-colors flex items-center justify-center gap-2 shadow-sm group-hover:scale-105 duration-200">
                  회의 입장하기
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          ) : <EmptyState />}
        </section>

        {/* 3. 다가오는 회의 (MIDDLE) */}
        <section className="px-6 mx-auto w-full max-w-(--breakpoint-2xl)">
          <SectionTitle 
            title="다가오는 회의 일정" 
            onPrev={() => scrollContainer(upcomingScrollRef, 'left')}
            onNext={() => scrollContainer(upcomingScrollRef, 'right')}
            showControls={filteredUpcoming.length > 0}
          />
          <div ref={upcomingScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1 scroll-smooth">
            {filteredUpcoming.length > 0 ? filteredUpcoming.map((item) => (
              <div key={item.id} className="min-w-[320px] bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-[#91D148]/50 transition-all border-l-8 shrink-0" style={{ borderLeftColor: item.borderColor }}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[12px] font-black text-[#91D148] bg-[#F4F9ED] px-2 py-1 rounded">{item.date}</span>
                    <span className="text-[12px] font-bold text-gray-400">{item.owner}</span>
                  </div>
                  <h4 className="font-black text-gray-800 text-[16px] mb-2 line-clamp-1">{item.title}</h4>
                  <p className="text-[13px] text-gray-500 font-medium">🕒 {item.time}</p>
                  <p className="text-[13px] text-gray-500 font-medium">📍 {item.room}</p>
                </div>
                <button className="mt-6 w-full py-2.5 bg-gray-50 text-gray-400 rounded-xl font-bold text-xs cursor-default">대기 중</button>
              </div>
            )) : <EmptyState />}
          </div>
        </section>

        {/* 4. 최근 회의 (BOTTOM) */}
        <section className="px-6 mx-auto w-full max-w-(--breakpoint-2xl)">
          <SectionTitle 
            title="최근 완료된 회의" 
            onPrev={() => scrollContainer(recentScrollRef, 'left')}
            onNext={() => scrollContainer(recentScrollRef, 'right')}
            showControls={filteredRecent.length > 0}
          />
          <div ref={recentScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1 scroll-smooth">
            {filteredRecent.length > 0 ? filteredRecent.map((meeting) => (
              <div key={meeting.id} 
                onClick={() => navigate(`/meeting/${meeting.id}/result`)}
                className="min-w-[320px] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border-l-8 cursor-pointer shrink-0" 
                style={{ borderLeftColor: meeting.borderColor }}
              >
                <div className="bg-gray-50/50 p-4 border-b border-gray-50">
                  <h3 className="font-black text-gray-800 text-[15px] truncate">{meeting.title}</h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="text-[13px] space-y-1.5">
                    <p className="flex text-gray-400 font-bold"><span className="w-16">날짜</span><span className="text-gray-700">{meeting.date}</span></p>
                    <p className="flex text-gray-400 font-bold"><span className="w-16">키워드</span><span className="text-[#91D148] truncate">{meeting.keywords}</span></p>
                  </div>
                  <p className="text-gray-600 text-[13px] line-clamp-2 italic pt-2 border-t border-gray-50">"{meeting.content}"</p>
                </div>
              </div>
            )) : <EmptyState />}
          </div>
        </section>
      </div>
    </>
  );
}

const SectionTitle = ({ 
  title, 
  onPrev, 
  onNext, 
  showControls = false 
}: { 
  title: string, 
  onPrev?: () => void, 
  onNext?: () => void, 
  showControls?: boolean 
}) => (
  <div className="flex items-end mb-6 justify-between">
    <div className="flex items-end flex-1">
      <div className="relative shrink-0">
        <h2 className="text-[17px] font-black text-gray-900 px-1 pb-1">{title}</h2>
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#91D148] rounded-full"></div>
      </div>
      <div className="flex-1 h-[1px] bg-gray-100 ml-4 mb-[2px]"></div>
    </div>
    
    {showControls && onPrev && onNext && (
      <div className="flex gap-2 ml-4 shrink-0 mb-1">
        <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600" title="이전">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button onClick={onNext} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600" title="다음">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    )}
  </div>
);

const EmptyState = () => (
  <div className="w-full shrink-0 flex items-center justify-center py-14 text-center text-gray-400 font-bold text-[15px]">
    검색 결과가 없습니다. 🐹💧
  </div>
);