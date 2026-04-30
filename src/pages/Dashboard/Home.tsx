import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase.ts";
import PageMeta from "../../components/common/PageMeta";
import MeetingDetailModal, { Meeting } from "../../components/meetings/MeetingDetailModal";
import CapybaraZone from "../../components/common/CapybaraZone";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
};

const getDateStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [today, setToday] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [liveMeeting, setLiveMeeting] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const upcomingScrollRef = useRef<HTMLDivElement>(null);
  const recentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToday(getTodayStr());
    if (user) fetchMeetings();
    const event = new CustomEvent('UPDATE_BARA', {
      detail: { scenarioId: "home", customMessage: "어서오세요! 오늘 진행할 회의가 있는지 확인해 드릴까요? 🐹" }
    });
    window.dispatchEvent(event);
  }, [user]);

  const fetchMeetings = async () => {
    setLoading(true);
    const todayStr = getDateStr();
    const now = new Date();
    const currentHour = now.getHours();

    // 진행 중인 회의
    const { data: liveData } = await supabase
      .from('회의정보')
      .select('*')
      .eq('대표정보id', user?.대표정보id)
      .eq('회의일정', todayStr)
      .lte('회의시작시간', currentHour)
      .gte('회의종료시간', currentHour)
      .limit(1);

    if (liveData && liveData.length > 0) {
      const live = liveData[0];
      setLiveMeeting({
        id: live['회의정보id'],
        title: live['회의제목'] || '진행 중인 회의',
        location: live['회의장소'] || '',
        startTime: live['회의시작시간'] || '',
        endTime: live['회의종료시간'] || '',
        agenda: live['신규안건'] || '',
        participants: live['카드브리핑'] || '',
      });
    } else {
      setLiveMeeting(null);
    }

    // 다가오는 회의
    const { data: upcomingData } = await supabase
      .from('회의정보')
      .select('*')
      .eq('대표정보id', user?.대표정보id)
      .gt('회의일정', todayStr)
      .order('회의일정', { ascending: true })
      .limit(6);

    if (upcomingData) {
      const colors = ["#FF9F43", "#4BC0C0", "#36A2EB", "#FF6B6B", "#9966FF", "#FFCE56"];
      setUpcomingMeetings(upcomingData.map((item: any, index: number) => ({
        id: item['회의정보id'],
        title: item['회의제목'] || '회의',
        date: item['회의일정'],
        time: `${item['회의시작시간']}:00 ~ ${item['회의종료시간']}:00`,
        room: item['회의장소'] || '',
        participants: item['카드브리핑'] || '',
        borderColor: colors[index % colors.length],
      })));
    }

    // 최근 완료된 회의
    const { data: recentData } = await supabase
      .from('회의정보')
      .select('*')
      .eq('대표정보id', user?.대표정보id)
      .lt('회의일정', todayStr)
      .order('회의일정', { ascending: false })
      .limit(6);

    if (recentData) {
      const colors = ["#91D148", "#CAE7A7", "#4BC0C0", "#36A2EB", "#FF9F43", "#9966FF"];
      setRecentMeetings(recentData.map((item: any, index: number) => ({
        id: item['회의정보id'],
        title: item['회의제목'] || '회의',
        date: item['회의일정'],
        projectName: item['카드브리핑'] || '',
        projectColor: colors[index % colors.length],
        aiSummary: item['회의요약'] || '',
      })));
    }

    setLoading(false);
  };

  const filterFn = (item: any) =>
    searchQuery === "" ||
    (item.title || "").includes(searchQuery) ||
    (item.room || "").includes(searchQuery) ||
    (item.participants || "").includes(searchQuery);

  const filteredUpcoming = upcomingMeetings.filter(filterFn);
  const filteredRecent = recentMeetings.filter(filterFn);
  const filteredOngoing = liveMeeting &&
    (searchQuery === "" || (liveMeeting.title || "").includes(searchQuery));

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -344 : 344, behavior: 'smooth' });
    }
  };

  return (
    <>
      <PageMeta title="회의바라 - 홈" description="업무 생산성을 위한 똑똑한 AI 회의 파트너" />
      {createPortal(<CapybaraZone />, document.body)}
      {selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}

      <div className="w-full space-y-12 pb-20 bg-white min-h-screen">

        {/* 1. 검색 바 */}
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

        {/* 2. 진행 중인 회의 */}
        <section className="px-6 mx-auto w-full max-w-(--breakpoint-2xl)">
          <SectionTitle title="진행 중인 회의" />
          {loading ? <LoadingState /> : filteredOngoing ? (
            <div
              onClick={() => navigate(`/meeting/${liveMeeting.id}/live`)}
              className="bg-[#F4F9ED] border-2 border-[#91D148] rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 bg-[#91D148] text-white text-[12px] font-black px-2.5 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>LIVE
                  </span>
                  <span className="text-gray-500 text-[13px] font-bold">{today} • 진행 중</span>
                </div>
                <h3 className="text-[20px] md:text-[24px] font-black text-gray-900 mb-4 leading-tight">
                  {liveMeeting.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-600 font-medium mb-5">
                  {liveMeeting.participants && (
                    <span className="flex items-center gap-1.5">👥 {liveMeeting.participants}</span>
                  )}
                  <span className="w-[1px] h-3 bg-gray-300"></span>
                  <span className="flex items-center gap-1.5">📍 {liveMeeting.location}</span>
                </div>
                {liveMeeting.agenda && (
                  <div className="bg-white px-4 py-3 rounded-xl border border-[#91D148]/20 inline-block shadow-sm">
                    <p className="text-[#91D148] text-[11px] font-black mb-0.5">현재 안건</p>
                    <p className="text-[14px] font-bold text-gray-800">{liveMeeting.agenda}</p>
                  </div>
                )}
              </div>
              <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <button className="w-full md:w-auto bg-[#91D148] text-white px-8 py-4 rounded-xl font-black text-[15px] hover:bg-[#82bd41] transition-colors flex items-center justify-center gap-2 shadow-sm group-hover:scale-105 duration-200">
                  회의 입장하기
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          ) : (
            <EmptyState message="현재 진행 중인 회의가 없어요 🐹" />
          )}
        </section>

        {/* 3. 다가오는 회의 */}
        <section className="px-6 mx-auto w-full max-w-(--breakpoint-2xl)">
          <SectionTitle
            title="다가오는 회의 일정"
            onPrev={() => scrollContainer(upcomingScrollRef, 'left')}
            onNext={() => scrollContainer(upcomingScrollRef, 'right')}
            showControls={filteredUpcoming.length > 0}
          />
          <div ref={upcomingScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1 scroll-smooth">
            {loading ? <LoadingState /> : filteredUpcoming.length > 0 ? filteredUpcoming.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/meeting-register')}
                className="min-w-[280px] max-w-[280px] bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#91D148] hover:shadow-md transition-all border-l-[6px] shrink-0 cursor-pointer group"
                style={{ borderLeftColor: item.borderColor }}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[11px] font-black text-[#91D148] bg-[#F4F9ED] px-2 py-1 rounded">{item.date}</span>
                  </div>
                  <h4 className="font-black text-gray-800 text-[15px] mb-3 line-clamp-2 group-hover:text-[#91D148] transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-[12px] text-gray-500 font-medium">🕒 {item.time}</p>
                    <p className="text-[12px] text-gray-500 font-medium">📍 {item.room}</p>
                    {item.participants && (
                      <p className="text-[12px] text-gray-500 font-medium truncate">👥 {item.participants}</p>
                    )}
                  </div>
                </div>
                <button className="mt-4 w-full py-2 bg-gray-50 text-gray-400 group-hover:bg-[#F4F9ED] group-hover:text-[#91D148] rounded-xl font-bold text-xs transition-colors">
                  일정 상세 보기
                </button>
              </div>
            )) : <EmptyState message="다가오는 회의 일정이 없어요 🐹" />}
          </div>
        </section>

        {/* 4. 최근 완료된 회의 */}
        <section className="px-6 mx-auto w-full max-w-(--breakpoint-2xl)">
          <SectionTitle
            title="최근 완료된 회의"
            onPrev={() => scrollContainer(recentScrollRef, 'left')}
            onNext={() => scrollContainer(recentScrollRef, 'right')}
            showControls={filteredRecent.length > 0}
          />
          <div ref={recentScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1 scroll-smooth">
            {loading ? <LoadingState /> : filteredRecent.length > 0 ? filteredRecent.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => setSelectedMeeting(meeting)}
                className="min-w-[280px] max-w-[280px] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border-l-[6px] cursor-pointer shrink-0"
                style={{ borderLeftColor: meeting.projectColor }}
              >
                <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                  <h3 className="font-black text-gray-800 text-[14px] line-clamp-2 leading-snug">{meeting.title}</h3>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-[12px] space-y-1.5">
                    <p className="flex text-gray-400 font-bold">
                      <span className="w-14 shrink-0">날짜</span>
                      <span className="text-gray-700">{meeting.date}</span>
                    </p>
                    <p className="flex text-gray-400 font-bold">
                      <span className="w-14 shrink-0">참석자</span>
                      <span className="text-[#91D148] truncate">{meeting.projectName}</span>
                    </p>
                  </div>
                  {meeting.aiSummary && (
                    <p className="text-gray-600 text-[12px] line-clamp-2 italic pt-2 border-t border-gray-100">
                      {meeting.aiSummary}
                    </p>
                  )}
                </div>
              </div>
            )) : <EmptyState message="최근 완료된 회의가 없어요 🐹" />}
          </div>
        </section>

      </div>
    </>
  );
}

const SectionTitle = ({
  title, onPrev, onNext, showControls = false
}: {
  title: string, onPrev?: () => void, onNext?: () => void, showControls?: boolean
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
        <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button onClick={onNext} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    )}
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="w-full shrink-0 flex items-center justify-center py-14 text-center text-gray-400 font-bold text-[15px]">
    {message}
  </div>
);

const LoadingState = () => (
  <div className="w-full flex items-center justify-center py-14 text-center text-gray-400 font-bold text-[15px]">
    불러오는 중... 🐹
  </div>
);