import React, { useState, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { createPortal } from "react-dom";
import CapybaraZone from "../../components/common/CapybaraZone";
import Toast from "../../components/common/Toast";
// 💡 방금 분리한 커스텀 달력 컴포넌트를 불러옵니다!
import DatePicker from "../../components/common/DatePicker"; 

// --- SVG Icons ---
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const FolderIcon = ({ color }: { color?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={color || "currentColor"} stroke={color || "currentColor"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const DocumentIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

// =============================================
// 더미 데이터
// =============================================
const DUMMY_MEETINGS = [
  {
    id: 1, date: "2026-04-15", title: "UI/UX 개선안 확정 회의", projectName: "프로젝트 알파", projectColor: "#91D148", agenda: "모바일 앱 메인화면 개편", keywords: ["UI/UX", "#디자인", "#피그마", "#모바일시스템"], owner: "김철수 / PM",
    aiSummary: "\"사용자 체류 시간 증대를 위한 카드형 UI 0안 도입이 최종 결정되었습니다. 개발팀의 성능 우려 사항은 프리렌더링 기술 적용으로 합의하였으며, 관련하여 3건의 액션 아이템이 생성되었습니다.\"",
    actionItems: [{ assignee: "박지민", task: "카드형 UI 최적 성능 데이터 분석 보고서 작성", status: "진행 중" }, { assignee: "이영희", task: "알림 센터 통합 방식 v2.1 시안 수정", status: "완료" }, { assignee: "김창수", task: "검색 필터 고도화 기획서 로직 정리", status: "진행 중" }]
  },
  {
    id: 2, date: "2026-05-07", title: "신규 서비스 기획 논의", projectName: "프로젝트 베타", projectColor: "#4A90D9", agenda: "신규 기능 로드맵 수립", keywords: ["기획", "로드맵", "신규서비스"], owner: "이수진 / PL",
    aiSummary: "\"신규 서비스 로드맵 초안이 확정되었습니다. 1분기 출시 목표를 위한 핵심 기능 우선순위가 결정되었으며, 5건의 액션 아이템이 생성되었습니다.\"",
    actionItems: [{ assignee: "박민준", task: "MVP 기능 상세 스펙 문서 작성", status: "완료" }, { assignee: "최지원", task: "베타 출시 일정 상세 계획 수립", status: "진행 중" }, { assignee: "한소희", task: "마케팅 연계 방안 초안 작성", status: "지연" }]
  },
  {
    id: 3, date: "2026-04-30", title: "디자인 시스템 정립 회의", projectName: "프로젝트 감마", projectColor: "#E8944A", agenda: "UI 컴포넌트 표준화", keywords: ["디자인", "UI", "컴포넌트"], owner: "정다은 / 디자인리드",
    aiSummary: "\"컴포넌트 라이브러리 표준화 방향이 확정되었습니다. Storybook 도입과 디자인 토큰 체계 수립이 결정되었습니다.\"",
    actionItems: [{ assignee: "김유진", task: "Storybook 환경 세팅 및 기본 컴포넌트 등록", status: "완료" }, { assignee: "이준혁", task: "디자인 토큰 코드 연동 작업", status: "진행 중" }]
  },
  {
    id: 4, date: "2026-04-25", title: "백엔드 아키텍처 검토", projectName: "프로젝트 알파", projectColor: "#91D148", agenda: "DB 구조 및 API 설계 검토", keywords: ["백엔드", "API", "DB"], owner: "김철수 / PM",
    aiSummary: "\"마이크로서비스 아키텍처 전환 방향이 확정되었으며, API 게이트웨이 도입이 결정되었습니다.\"",
    actionItems: [{ assignee: "박지민", task: "Kong API 게이트웨이 POC 진행", status: "진행 중" }, { assignee: "이상혁", task: "DB 샤딩 POC 계획서 작성", status: "지연" }]
  },
  {
    id: 5, date: "2026-04-20", title: "마케팅 전략 수립", projectName: "프로젝트 델타", projectColor: "#9B59B6", agenda: "2분기 마케팅 캠페인 기획", keywords: ["마케팅", "캠페인", "2분기"], owner: "최유진 / 마케팅리드",
    aiSummary: "\"2분기 캠페인 전략이 확정되었습니다. SNS 중심의 바이럴 마케팅과 인플루언서 협업 방향이 결정되었습니다.\"",
    actionItems: [{ assignee: "강민호", task: "인플루언서 후보 리스트 작성 및 컨택", status: "완료" }, { assignee: "황수아", task: "SNS 콘텐츠 캘린더 작성", status: "완료" }]
  },
  {
    id: 6, date: "2026-04-15", title: "인프라 점검 회의", projectName: "프로젝트 베타", projectColor: "#4A90D9", agenda: "서버 이전 및 비용 최적화", keywords: ["인프라", "서버", "비용"], owner: "이수진 / PL",
    aiSummary: "\"AWS에서 GCP로의 서버 이전 계획이 확정되었습니다. 비용 절감 예상액은 월 30%이며, 이전 일정은 6월로 결정되었습니다.\"",
    actionItems: [{ assignee: "이상혁", task: "GCP 이전 상세 계획서 작성", status: "진행 중" }, { assignee: "박민준", task: "Reserved Instance 비용 시뮬레이션", status: "진행 중" }]
  },
  {
    id: 7, date: "2026-04-10", title: "사용자 리서치 결과 공유", projectName: "프로젝트 감마", projectColor: "#E8944A", agenda: "사용자 인터뷰 결과 및 인사이트", keywords: ["리서치", "UX", "인터뷰"], owner: "정다은 / 디자인리드",
    aiSummary: "\"사용자 인터뷰 20건의 결과가 공유되었습니다. 주요 페인포인트 3가지가 도출되었으며 개선 방향이 결정되었습니다.\"",
    actionItems: [{ assignee: "김유진", task: "페인포인트 기반 개선안 프로토타입 제작", status: "진행 중" }]
  },
  {
    id: 8, date: "2026-04-05", title: "법무 검토 회의", projectName: "프로젝트 알파", projectColor: "#91D148", agenda: "계약서 및 이용약관 검토", keywords: ["법무", "계약", "약관"], owner: "김철수 / PM",
    aiSummary: "\"서비스 이용약관 및 개인정보처리방침 최종 검토가 완료되었습니다. 3건의 수정 사항이 반영되었습니다.\"",
    actionItems: [{ assignee: "이지현", task: "수정된 약관 최종본 배포", status: "완료" }]
  },
  {
    id: 9, date: "2026-03-28", title: "보안 감사 결과 보고", projectName: "프로젝트 델타", projectColor: "#9B59B6", agenda: "취약점 점검 및 보완 방안", keywords: ["보안", "감사", "취약점"], owner: "최유진 / 마케팅리드",
    aiSummary: "\"보안 감사 결과 7건의 취약점이 발견되었습니다. 긴급 패치 3건은 즉시 적용되었으며 나머지 4건은 일정에 따라 처리 예정입니다.\"",
    actionItems: [{ assignee: "이상혁", task: "일반 취약점 패치 작업", status: "지연" }, { assignee: "강민호", task: "보안 정책 강화 방안 문서 작성", status: "진행 중" }]
  },
  {
    id: 10, date: "2026-03-20", title: "팀 빌딩 및 목표 수립", projectName: "프로젝트 베타", projectColor: "#4A90D9", agenda: "2분기 팀 목표 및 역할 분담", keywords: ["팀빌딩", "목표", "역할"], owner: "이수진 / PL",
    aiSummary: "\"2분기 팀 목표 OKR이 확정되었습니다. 각 팀별 역할과 책임이 명확하게 정의되었습니다.\"",
    actionItems: [{ assignee: "박민준", task: "OKR 트래킹 시스템 설정", status: "완료" }]
  },
  {
    id: 11, date: "2026-03-15", title: "QA 테스트 결과 공유", projectName: "프로젝트 알파", projectColor: "#91D148", agenda: "버그 목록 및 수정 우선순위 결정", keywords: ["QA", "테스트", "버그"], owner: "김철수 / PM",
    aiSummary: "\"1차 QA 결과 총 23건의 버그가 발견되었습니다. Critical 5건은 즉시 수정 완료, 나머지는 우선순위에 따라 처리 예정입니다.\"",
    actionItems: [{ assignee: "이준혁", task: "P1 버그 수정 작업", status: "진행 중" }, { assignee: "최도현", task: "P2 버그 수정 작업", status: "지연" }]
  },
  {
    id: 12, date: "2026-03-10", title: "고객사 미팅 사전 준비", projectName: "프로젝트 감마", projectColor: "#E8944A", agenda: "발표 자료 및 데모 시나리오 검토", keywords: ["고객사", "발표", "데모"], owner: "정다은 / 디자인리드",
    aiSummary: "\"고객사 발표 준비가 완료되었습니다. 데모 시나리오 3가지가 확정되었으며 발표 역할이 배분되었습니다.\"",
    actionItems: [{ assignee: "김유진", task: "발표 자료 최종본 인쇄 및 배포", status: "완료" }]
  }
];

export default function MyWorkspace() {
  const [activeTab, setActiveTab] = useState<"action" | "wiki">("action");
  
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [targetMeetingId, setTargetMeetingId] = useState<number | null>(null);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [addForm, setAddForm] = useState({ agenda: "", plan: "", dept: "" });

  const [actionPlans, setActionPlans] = useState([
    {
      id: 1, meetingName: "모닝스크럼", date: "26 / 04 / 01", color: "#FF8A65",
      items: [
        { id: 11, agenda: "2차 평가 준비", plan: "명확한 주제 구체화, UX / UI 설계 점검, WBS 작성", dept: "서비스 기획", isDone: true },
        { id: 12, agenda: "중간 산출물 준비", plan: "요구사항 정리, PRD, 기능정의서, 사이트맵 설계", dept: "문서화", isDone: true },
        { id: 13, agenda: "체크리스트 작성", plan: "평가자료 준비 체크리스트 작성 및 담당자 지정", dept: "PM", isDone: false },
      ]
    },
    {
      id: 2, meetingName: "온라인 교육 준비", date: "26 / 04 / 05", color: "#91D148",
      items: [
        { id: 21, agenda: "출결 및 운영 관련", plan: "현장 QR 체크인 프로세스 점검", dept: "운영진", isDone: true },
        { id: 22, agenda: "유의 사항 공지", plan: "시설 이용수칙 및 교육 운영 수칙 준수 안내문 발송", dept: "운영진", isDone: false },
        { id: 23, agenda: "숙소 배정 확인", plan: "실별 인원 배정 및 물품 구비 현황 파악", dept: "운영진", isDone: false },
      ]
    }
  ]);

  const [wikiSearch, setWikiSearch] = useState("");
  const [wikiStartDate, setWikiStartDate] = useState("");
  const [wikiEndDate, setWikiEndDate] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null); 
  const [selectedWikiId, setSelectedWikiId] = useState<number | null>(null); 

  const isDateRangeInvalid = wikiStartDate !== "" && wikiEndDate !== "" && wikiEndDate < wikiStartDate;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const toggleDone = (meetingId: number, itemId: number) => {
    setActionPlans(prev => prev.map(meeting => {
      if (meeting.id === meetingId) {
        const updatedItems = meeting.items.map(item => {
          if (item.id === itemId) {
            const nextState = !item.isDone;
            showToast(nextState ? "항목이 완료 처리되었습니다." : "완료 처리가 취소되었습니다.");
            return { ...item, isDone: nextState };
          }
          return item;
        });
        return { ...meeting, items: updatedItems };
      }
      return meeting;
    }));
  };

  const deleteItem = (meetingId: number, itemId: number) => {
    if (!window.confirm("정말 이 항목을 삭제하시겠습니까?")) return;
    setActionPlans(prev => prev.map(meeting => {
      if (meeting.id === meetingId) {
        return { ...meeting, items: meeting.items.filter(i => i.id !== itemId) };
      }
      return meeting;
    }));
    showToast("항목이 삭제되었습니다.");
  };

  const handleOpenAddModal = (meetingId: number) => {
    setModalMode("add");
    setTargetMeetingId(meetingId);
    setEditTargetId(null);
    setAddForm({ agenda: "", plan: "", dept: "" });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (meetingId: number, item: any) => {
    setModalMode("edit");
    setTargetMeetingId(meetingId);
    setEditTargetId(item.id);
    setAddForm({ agenda: item.agenda, plan: item.plan, dept: item.dept });
    setIsAddModalOpen(true);
  };

  const handleSaveActionPlan = () => {
    if (!addForm.agenda.trim() || !addForm.plan.trim() || !addForm.dept.trim()) {
      showToast("모든 항목을 입력해주세요.");
      return;
    }
    setActionPlans(prev => prev.map(meeting => {
      if (meeting.id === targetMeetingId) {
        if (modalMode === "edit") {
          return {
            ...meeting,
            items: meeting.items.map(item => 
              item.id === editTargetId ? { ...item, agenda: addForm.agenda, plan: addForm.plan, dept: addForm.dept } : item
            )
          };
        } else {
          const newItem = { id: Date.now(), agenda: addForm.agenda, plan: addForm.plan, dept: addForm.dept, isDone: false };
          return { ...meeting, items: [...meeting.items, newItem] };
        }
      }
      return meeting;
    }));
    setIsAddModalOpen(false);
    showToast(modalMode === "edit" ? "액션 플랜이 수정되었습니다." : "새로운 액션 플랜이 추가되었습니다.");
  };

  const calculateProgress = (items: any[]) => {
    if (items.length === 0) return 0;
    const doneCount = items.filter(item => item.isDone).length;
    return Math.round((doneCount / items.length) * 100);
  };

  const wikiGroups = useMemo(() => {
    const groups: { [key: string]: typeof DUMMY_MEETINGS } = {};
    DUMMY_MEETINGS.forEach(m => {
      if (!groups[m.projectName]) groups[m.projectName] = [];
      groups[m.projectName].push(m);
    });
    return groups;
  }, []);

  const isWikiActive = wikiSearch || wikiStartDate || wikiEndDate;

  const filteredWiki = useMemo(() => {
    if (!isWikiActive) return []; 
    
    let list = DUMMY_MEETINGS;
    
    if (wikiSearch) {
      list = list.filter(m => m.title.includes(wikiSearch) || m.keywords.some(k => k.includes(wikiSearch)));
    }
    if (wikiStartDate) {
      list = list.filter(m => m.date >= wikiStartDate);
    }
    if (wikiEndDate && !isDateRangeInvalid) {
      list = list.filter(m => m.date <= wikiEndDate);
    }
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [wikiSearch, wikiStartDate, wikiEndDate, isWikiActive, isDateRangeInvalid]);

  const toggleFolder = (projectName: string) => {
    setExpandedFolders(prev => 
      prev.includes(projectName) ? prev.filter(f => f !== projectName) : [...prev, projectName]
    );
  };

  const activeWikiDetail = DUMMY_MEETINGS.find(m => m.id === selectedWikiId);

  return (
    <>
      <PageMeta title="나의 워크스페이스" description="액션 플랜 및 팀 위키 통합 관리" />
      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2EBD5; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #91D148; border: 2px solid transparent; background-clip: padding-box; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>

      {/* 모달 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[999] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-[440px] rounded-2xl p-8 shadow-2xl relative animate-zoom-in">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 font-bold">✕</button>
            <h2 className="text-[20px] font-black text-gray-900 mb-6">
              {modalMode === "edit" ? "액션 플랜 수정" : "액션 플랜 추가"}
            </h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">주요 안건</label>
                <input 
                  type="text" 
                  value={addForm.agenda}
                  onChange={(e) => setAddForm({...addForm, agenda: e.target.value})}
                  placeholder="예) 중간 산출물 준비" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:border-[#91D148] focus:bg-[#F3FAEB]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">담당 부서</label>
                <input 
                  type="text" 
                  value={addForm.dept}
                  onChange={(e) => setAddForm({...addForm, dept: e.target.value})}
                  placeholder="예) 서비스 기획" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:border-[#91D148] focus:bg-[#F3FAEB]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">액션 플랜 상세</label>
                <textarea 
                  value={addForm.plan}
                  onChange={(e) => setAddForm({...addForm, plan: e.target.value})}
                  placeholder="구체적인 실행 계획을 작성해주세요" 
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:border-[#91D148] focus:bg-[#F3FAEB]/30 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="flex-1 py-3.5 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSaveActionPlan} 
                className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] shadow-sm transition-colors"
              >
                {modalMode === "edit" ? "수정하기" : "추가하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 화면 레이아웃 */}
      <div className="absolute inset-0 p-6 overflow-hidden bg-[#F8F9FA]">
        <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col gap-6">
          
          <div className="relative z-10 flex items-center justify-between shrink-0 bg-white px-6 py-1.5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab("action")}
                className={`py-2 text-[14px] font-black transition-all relative ${activeTab === "action" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              >
                액션 플랜
                {activeTab === "action" && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#91D148] rounded-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab("wiki")}
                className={`py-2 text-[14px] font-black transition-all relative ${activeTab === "wiki" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              >
                팀 위키
                {activeTab === "wiki" && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#91D148] rounded-full"></div>}
              </button>
            </div>
            <div className="text-[13px] font-bold text-gray-500 uppercase tracking-tighter">MeetBara Workspace</div>
          </div>

          <div className="flex-1 min-h-0 bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            
            {activeTab === "action" && (
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-[170px_180px_1fr_110px_150px] gap-6 py-4 border-b-2 border-gray-200 text-[14px] font-black text-gray-800 text-center sticky top-0 bg-white z-10 pr-6">
                  <div>회의 정보</div>
                  <div>주요 안건</div>
                  <div className="text-left">액션 플랜</div>
                  <div>담당 부서</div>
                  <div>관리</div>
                </div>

                <div className="flex flex-col gap-6 mt-6">
                  {actionPlans.map((meeting) => {
                    const progress = calculateProgress(meeting.items);
                    return (
                      <div key={meeting.id} className="flex border border-gray-100 rounded-2xl overflow-hidden relative shadow-sm">
                        <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: meeting.color }}></div>
                        
                        <div className="w-[170px] shrink-0 p-5 bg-gray-50/50 border-r border-gray-100 flex flex-col justify-center text-center">
                          <div className="text-[14px] font-black text-gray-900 mb-1 leading-snug break-keep">{meeting.meetingName}</div>
                          <div className="text-[11px] font-bold text-gray-400 mb-4">{meeting.date}</div>
                          
                          <div className="space-y-1.5 px-1">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black text-[#91D148]">PROG.</span>
                              <span className="text-[12px] font-black text-gray-900">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#91D148] transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          {meeting.items.map((item, idx) => (
                            <div key={item.id} className={`grid grid-cols-[180px_1fr_110px_150px] gap-6 py-5 pr-6 items-center ${idx !== meeting.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                              <div className={`text-[14px] font-bold px-4 leading-snug break-keep ${item.isDone ? 'text-gray-300 line-through' : 'text-gray-800'}`}>{item.agenda}</div>
                              <div className={`text-[13px] font-medium leading-relaxed pr-4 ${item.isDone ? 'text-gray-200' : 'text-gray-600'}`}>{item.plan}</div>
                              <div className="text-[13px] font-bold text-gray-500 text-center bg-gray-50 py-1 rounded-lg">{item.dept}</div>
                              <div className="flex items-center justify-center gap-1.5">
                                <button 
                                  onClick={() => toggleDone(meeting.id, item.id)}
                                  className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition-all border ${
                                    item.isDone ? 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-white' : 'bg-white border-[#91D148] text-[#91D148] hover:bg-[#91D148] hover:text-white'
                                  }`}
                                >
                                  {item.isDone ? '취소' : '완료'}
                                </button>
                                <button 
                                  onClick={() => handleOpenEditModal(meeting.id, item)}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-[#F3FAEB] hover:border-[#91D148] hover:text-[#91D148] transition-all"
                                  title="수정"
                                >
                                  <EditIcon />
                                </button>
                                <button 
                                  onClick={() => deleteItem(meeting.id, item.id)}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition-all"
                                  title="삭제"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="py-3 px-6 flex justify-center bg-gray-50/30 border-t border-gray-50">
                            <button 
                              onClick={() => handleOpenAddModal(meeting.id)}
                              className="text-[13px] font-bold text-gray-400 hover:text-[#91D148] flex items-center gap-1.5 transition-colors py-1 px-3 rounded hover:bg-[#F3FAEB]/50"
                            >
                              <PlusIcon /> 액션 플랜 추가
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "wiki" && (
              <div className="flex-1 flex overflow-hidden">
                <div className="w-[300px] border-r border-gray-100 p-6 overflow-y-auto custom-scrollbar shrink-0">
                  <h4 className="text-[12px] font-black text-gray-400 mb-4 uppercase tracking-widest">Project Tree</h4>
                  <div className="space-y-3">
                    {Object.keys(wikiGroups).map((projectName) => {
                      const isExpanded = expandedFolders.includes(projectName);
                      const projectMeetings = wikiGroups[projectName];
                      const pColor = projectMeetings[0].projectColor;

                      return (
                        <div key={projectName} className="rounded-xl transition-all">
                          <div onClick={() => toggleFolder(projectName)} className="flex items-center gap-2.5 py-2 px-1 text-[14px] font-black text-gray-800 cursor-pointer hover:bg-gray-50 rounded-xl">
                            <FolderIcon color={pColor} /> 
                            <span className="truncate flex-1">{projectName}</span>
                          </div>
                          {isExpanded && (
                            <div className="flex flex-col pb-2 space-y-1 mt-1 ml-[26px]">
                              {projectMeetings.map(m => (
                                <div key={m.id} onClick={() => setSelectedWikiId(m.id)} className={`py-1.5 px-3 text-[13px] font-bold cursor-pointer rounded-lg transition-all flex items-center gap-2 ${selectedWikiId === m.id ? "bg-[#D1D1D6] text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}>
                                  <DocumentIcon />
                                  <span className="truncate">{m.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  <div className="p-6 border-b border-gray-50 flex gap-4 bg-white shrink-0 items-center z-20">
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl flex items-center px-4 py-3 focus-within:border-[#91D148] transition-colors">
                      <SearchIcon />
                      <input 
                        type="text" value={wikiSearch} onChange={(e) => { setWikiSearch(e.target.value); setActiveProject(null); }} 
                        placeholder="문서 내 키워드, 제목 검색..." className="w-full ml-3 bg-transparent text-[14px] font-bold outline-none text-gray-800" 
                      />
                    </div>
                    
                    <div className="flex gap-2 shrink-0 items-center">
                      <DatePicker 
                        value={wikiStartDate} 
                        onChange={(val) => { setWikiStartDate(val); setActiveProject(null); }} 
                        placeholder="시작일 선택" 
                      />
                      <span className="text-gray-300 font-bold">~</span>
                      <DatePicker 
                        value={wikiEndDate} 
                        onChange={(val) => { setWikiEndDate(val); setActiveProject(null); }} 
                        placeholder="종료일 선택"
                        isInvalid={isDateRangeInvalid}
                        alignRight={true} // 💡 우측 화면 잘림 방지 (오른쪽 기준으로 열림)
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex overflow-hidden bg-gray-50/30 z-10">
                    <div className="w-[360px] border-r border-gray-50 overflow-y-auto custom-scrollbar p-4 space-y-3 shrink-0 bg-white">
                      {!isWikiActive ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                          <FolderIcon color="#9CA3AF" />
                          <p className="text-[13px] font-bold text-gray-400 leading-relaxed">상단 필터를 통해<br/>문서를 검색해주세요.</p>
                        </div>
                      ) : filteredWiki.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-3 opacity-60">
                          <p className="text-[13px] font-bold text-gray-400">일치하는 회의록이 없습니다.</p>
                        </div>
                      ) : (
                        filteredWiki.map((res) => (
                          <div key={res.id} onClick={() => { setSelectedWikiId(res.id); if (!expandedFolders.includes(res.projectName)) { setExpandedFolders(prev => [...prev, res.projectName]); } }} className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedWikiId === res.id ? "bg-white shadow-md border-[#91D148]" : "bg-transparent border-transparent hover:bg-gray-50"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded ${selectedWikiId === res.id ? "bg-[#91D148] text-white" : "bg-gray-100 text-gray-400"}`}>{res.projectName}</span>
                              <span className="text-[12px] font-bold text-gray-300">{res.date}</span>
                            </div>
                            <h4 className="text-[14px] font-black text-gray-800 mb-1 truncate">{res.title}</h4>
                            <p className="text-[12px] font-medium text-gray-500 line-clamp-2 leading-relaxed">{res.agenda}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                      {activeWikiDetail ? (
                        <div className="max-w-[800px] mx-auto">
                          <div className="mb-6">
                            <h2 className="text-[26px] font-black text-gray-900 mb-2 leading-tight">{activeWikiDetail.title}</h2>
                            <div className="flex items-center gap-3 text-[13px] text-gray-500 font-bold border-b border-gray-100 pb-4">
                              <span className="flex items-center gap-1.5"><CalendarIcon /> {activeWikiDetail.date}</span>
                              <span className="text-gray-300">|</span>
                              <span>작성자: {activeWikiDetail.owner}</span>
                              <span className="text-gray-300">|</span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-black" style={{ backgroundColor: `${activeWikiDetail.projectColor}20`, color: activeWikiDetail.projectColor }}>{activeWikiDetail.projectName}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="flex items-start gap-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                              <span className="text-[13px] font-black text-gray-800 shrink-0">주요 안건 :</span>
                              <span className="text-[13px] text-gray-600 font-medium leading-relaxed">{activeWikiDetail.agenda}</span>
                            </div>

                            <section>
                              <div className="flex gap-2 flex-wrap">
                                {activeWikiDetail.keywords.map(kw => <span key={kw} className="text-[12px] font-bold text-[#4d7222] bg-[#C8E6A5]/40 px-3 py-1.5 rounded-lg">{kw}</span>)}
                              </div>
                            </section>

                            <section className="bg-[#F4F9ED]/50 rounded-2xl p-6 border border-[#91D148]/20">
                              <h3 className="text-[14px] font-black text-[#91D148] mb-4 flex items-center gap-1.5"><span className="text-[16px]">🐹</span> 바라의 회의 요약</h3>
                              <div className="p-5 bg-white rounded-xl border-l-4 border-[#7000FF] shadow-sm">
                                <p className="text-[13px] font-bold text-gray-800 italic leading-relaxed">{activeWikiDetail.aiSummary}</p>
                              </div>
                            </section>

                            {activeWikiDetail.actionItems && activeWikiDetail.actionItems.length > 0 && (
                              <section>
                                <h3 className="text-[15px] font-black text-gray-800 mb-3 flex items-center gap-2 mt-4"><div className="w-1 h-4 bg-gray-800 rounded-full"></div> 파생 액션 아이템</h3>
                                <div className="space-y-2">
                                  {activeWikiDetail.actionItems.map((act, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-[#91D148]/30 transition-colors">
                                      <div className="flex items-center gap-3"><span className="text-[13px] font-black text-gray-800">{act.task}</span></div>
                                      <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[12px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{act.assignee}</span>
                                        <span className={`text-[12px] font-black px-2 py-1 rounded-full ${act.status === '완료' ? 'text-[#4d7222] bg-[#C8E6A5]/60' : act.status === '지연' ? 'text-red-500 bg-red-50' : 'text-blue-500 bg-blue-50'}`}>{act.status}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                          <DocumentIcon />
                          <p className="text-[14px] font-bold text-gray-500 mt-4">목록에서 확인할 문서를 선택해주세요.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}