import PageMeta from "../../components/common/PageMeta";

// 최근 회의 카드 데이터
const recentMeetings = [
  { id: 1, title: "신규 프로젝트 기획", date: "2026.03.28", members: "김철수, 이영희, 박지민, 최유진", keywords: "알림센터, 알림센터통합, 공지, 확장", content: "공지 중심으로 우선 통합 후, 전체 통합 구조로 확장...", borderColor: "#91D148" },
  { id: 2, title: "A/B 테스트 성과 리뷰 회의", date: "2026.03.21", members: "김철수, 이영희", keywords: "알림센터, CTR, 상승", content: "CTR 기준 B안 15% 상승 확인", borderColor: "#CAE7A7" },
  { id: 3, title: "UX 성과 지표 정의 회의", date: "2026.03.25", members: "이영희, 최유진", keywords: "추가지표, 알림센터, 체류시간", content: "추가지표(체류시간) 포함 필요", borderColor: "#E2F3CA" },
];

// 회의 리스트 데이터
const meetingList = [
  { id: 1, date: "2026 / 5 / 14 / 목", time: "14:00 ~ 15:30 (90분)", room: "소회의실 2호", type: "AI 미팅 에이전트 고도화", owner: "김철수 PM", details: "서비스 기획팀, 디자인팀, 개발1팀 | 김철수, 이영희, 박지민 | 의사결정, UI/UX", pointColor: "#FF9F43" },
  { id: 2, date: "2026 / 12 / 29 / 화", time: "09:30 ~ 11:30 (120분)", room: "본사 대강당", type: "연말 최종 성과 발표", owner: "홍길동 과장", details: "인사과, 디자인팀, 개발1팀 | 박지원, 김부양, 이안 | 성과보고", pointColor: "#4BC0C0" },
];

export default function Home() {
  return (
    <>
      <PageMeta title="회의바라 - 홈" description="업무 생산성을 위한 똑똑한 AI 회의 파트너" />

      <div className="w-full space-y-10 pb-10 overflow-x-hidden bg-white">
        
        {/* 1. 상단 중앙 검색바 (유지) */}
        <div className="flex justify-center pt-[84px] px-4">
          <div className="relative w-full max-w-[700px]">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="w-full py-3.5 pl-12 pr-4 bg-[#F4F9ED] border-none rounded-xl text-[14px] placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#91D148] focus:outline-none transition-all shadow-none"
            />
          </div>
        </div>

        {/* 2. 최근 회의 섹션 */}
        <section className="px-4">
          {/* 👉 수정된 타이틀 구조 */}
          <div className="flex items-end mb-6">
            <div className="relative">
              <h2 className="text-[16px] font-bold text-gray-800 px-1 pb-1">최근 회의</h2>
              {/* 글자 바로 밑 연두색 강조선 */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#91D148]"></div>
            </div>
            {/* 나머지 영역 회색 구분선 */}
            <div className="flex-1 h-[1px] bg-gray-200 mb-[1px]"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white border border-gray-100 rounded-xl transition-all cursor-pointer overflow-hidden flex flex-col shadow-none hover:border-gray-200"
                style={{ borderLeft: `5px solid ${meeting.borderColor}` }}
              >
                <div className="bg-[#F4F9ED] px-5 py-3.5 border-b border-gray-50">
                  <h3 className="font-bold text-gray-800 text-[14px] truncate">{meeting.title}</h3>
                </div>
                <div className="p-5">
                  <div className="text-[12px] space-y-2 text-gray-500">
                    <p className="flex"><span className="w-16 shrink-0 text-gray-400 font-medium">날짜:</span> <span className="text-gray-600">{meeting.date}</span></p>
                    <p className="flex"><span className="w-16 shrink-0 text-gray-400 font-medium">참여자:</span> <span className="truncate text-gray-600">{meeting.members}</span></p>
                    <p className="flex"><span className="w-16 shrink-0 text-gray-400 font-medium">키워드:</span> <span className="truncate text-gray-600">{meeting.keywords}</span></p>
                    <p className="flex"><span className="w-16 shrink-0 text-gray-400 font-medium">키워드 내용:</span> <span className="text-gray-600">{meeting.content}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 회의 리스트 섹션 */}
        <section className="px-4">
          {/* 👉 수정된 타이틀 구조 */}
          <div className="flex items-end mb-6">
            <div className="relative">
              <h2 className="text-[16px] font-bold text-gray-800 px-1 pb-1">회의 리스트</h2>
              {/* 글자 바로 밑 연두색 강조선 */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#91D148]"></div>
            </div>
            {/* 나머지 영역 회색 구분선 */}
            <div className="flex-1 h-[1px] bg-gray-200 mb-[1px]"></div>
          </div>

          <div className="flex flex-col gap-3">
            {meetingList.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-start md:items-center bg-white border border-gray-100 rounded-lg p-4 transition-all cursor-pointer w-full overflow-hidden hover:bg-[#F4F9ED]/20"
                style={{ borderLeft: `5px solid ${item.pointColor}` }}
              >
                {/* 날짜/시간 */}
                <div className="flex items-center shrink-0 text-[12px] text-gray-600 mb-2 md:mb-0">
                  <span className="font-bold w-28">{item.date}</span>
                  <span className="hidden md:block w-[1px] h-3 bg-gray-200 mx-3"></span>
                  <span className="w-40">{item.time}</span>
                </div>

                {/* 장소/제목 */}
                <div className="flex items-center grow min-w-0 md:ml-4">
                  <span className="hidden lg:block text-[12px] text-gray-400 w-32 truncate">{item.room}</span>
                  <span className="hidden lg:block w-[1px] h-3 bg-gray-200 mx-3"></span>
                  <span className="text-[13px] font-bold text-gray-800 truncate grow">{item.type}</span>
                </div>

                {/* 책임자 */}
                <div className="flex items-center shrink-0 md:ml-4 text-[12px] text-gray-500 font-medium">
                  <span className="hidden sm:block w-[1px] h-3 bg-gray-200 mx-3"></span>
                  <span className="w-24 truncate text-right">{item.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}