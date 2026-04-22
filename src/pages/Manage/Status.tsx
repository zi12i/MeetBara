import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone";
import Toast from "../../components/common/Toast"; 
import { createPortal } from "react-dom";

// 1. 데이터 타입 정의
interface Participant {
  name: string;
  dept: string;
  time: string;
  status: string;
}

interface Reference {
  label: string;
  url: string;
}

interface ActionItem {
  assignee: string;
  content: string;
  status: "완료" | "진행중" | "지연";
  hasResult: boolean;
}

interface FamiliarityData {
  id: number;
  type: "familiarity";
  meetingDate: string;
  meetingTime: string;
  meetingName: string;
  projectName: string;
  progress: number;
  color: string;
  participants: Participant[];
}

interface UnresolvedData {
  id: number;
  type: "unresolved";
  meetingDate: string;
  meetingTime: string;
  meetingName: string;
  projectName: string;
  agendaTitle: string;
  scheduledMeeting: string;
  scheduledTime: string; 
  deadline: string;
  description: string;
  status: "보류(기술검토)" | "재논의 필요" | "추가조사중" | "결정권자 부재";
  participants: Participant[];
  references?: Reference[];
  color?: string;
}

interface TaskData {
  id: number;
  type: "task";
  meetingName: string;
  meetingDate: string;
  projectName: string;
  manager: string;
  completedCount: number;
  totalCount: number;
  status: "지연발생" | "진행중" | "완료";
  description: string;
  actionItems: ActionItem[];
  aiSuggestion: string;
  color?: string;
}

const Status: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("familiarity");
  const [selectedItem, setSelectedItem] = useState<FamiliarityData | UnresolvedData | TaskData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState("");

  // 데이터 색상 추출 헬퍼 함수 (bg-[#...] 클래스에서 hex 추출)
  const getHexColor = (colorClass?: string) => {
    if (!colorClass) return "#91D148";
    const match = colorClass.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
    return match ? `#${match[1]}` : "#91D148";
  };

  const familiarityList: FamiliarityData[] = [
    {
      id: 1,
      type: "familiarity",
      meetingDate: "2026.04.25",
      meetingTime: "10:00",
      meetingName: "차세대 ERP 보안 고도화 회의",
      projectName: "금융권 차세대 ERP UI 개선",
      progress: 0,
      color: "bg-[#FF9F43]",
      participants: [
        { name: "김철수", dept: "서비스 기획팀", time: "2026.04.20 18:30", status: "확인완료" },
        { name: "이영희", dept: "서비스 기획팀", time: "2026.04.21 09:10", status: "확인완료" },
        { name: "이순신", dept: "보안팀", time: "-", status: "미확인" },
        { name: "유관순", dept: "운영팀", time: "-", status: "미확인" },
      ]
    },
    {
      id: 2,
      type: "familiarity",
      meetingDate: "2026.04.28",
      meetingTime: "14:00",
      meetingName: "AI 챗봇 인터페이스 최종 리뷰",
      projectName: "AI 미팅 에이전트 고도화",
      progress: 0,
      color: "bg-[#FF6B6B]",
      participants: [
        { name: "김철수", dept: "서비스 기획팀", time: "2026.04.20 10:00", status: "확인완료" },
        { name: "이영희", dept: "서비스 기획팀", time: "-", status: "미확인" },
      ]
    }
  ];

  const unresolvedList: UnresolvedData[] = [
    {
      id: 102,
      type: "unresolved",
      meetingDate: "2026.04.15",
      meetingTime: "11:00",
      meetingName: "시스템 아키텍처 1차 검토",
      projectName: "금융권 차세대 ERP UI 개선",
      agendaTitle: "DB 이중화 방식 결정의 건",
      scheduledMeeting: "차세대 ERP 보안 고도화 회의",
      scheduledTime: "2026.04.25 10:00",
      deadline: "2026.04.23까지",
      status: "보류(기술검토)",
      description: "지난 15일 회의에서 데이터 보안 및 가용성 확보를 위한 DB 복제 방식(Sync vs Async) 선택이 기술적 검토 이슈로 인해 지연되었습니다.",
      participants: [
        { name: "박지민", dept: "개발 1팀", time: "", status: "" },
        { name: "최유리", dept: "인프라팀", time: "", status: "" }
      ],
      references: [
        { label: "0415_아키텍처_회의록.pdf", url: "#" },
        { label: "데이터복제_기술검토서.pdf", url: "#" }
      ],
      color: "bg-[#FF9F43]"
    }
  ];

  const taskList: TaskData[] = [
    {
      id: 201,
      type: "task",
      meetingName: "주간 정기 회의",
      meetingDate: "2026.04.13",
      projectName: "금융권 차세대 ERP UI 개선",
      manager: "김철수 팀장",
      completedCount: 3,
      totalCount: 5,
      status: "지연발생",
      description: "주간 회의에서 결정된 UI 가이드라인 배포 및 권한 관리 설계 업무가 진행 중입니다.",
      actionItems: [
        { assignee: "박지민", content: "사용자 권한 관리 모듈 API 연동", status: "지연", hasResult: false },
        { assignee: "이영희", content: "UI 가이드라인 최종본 배포", status: "완료", hasResult: true },
        { assignee: "김철수", content: "기획안 검토 및 승인", status: "완료", hasResult: true },
        { assignee: "최유리", content: "인프라 보안 설정 체크", status: "진행중", hasResult: false },
        { assignee: "박지민", content: "데이터베이스 이중화 스크립트 작성", status: "완료", hasResult: true },
      ],
      aiSuggestion: "현재 '사용자 권한 관리 모듈 API 연동' 건이 3일째 지연되고 있습니다. 차기 회의에서는 개발 일정 재조정 혹은 리소스 추가 지원을 주요 안건으로 다룰 것을 제안합니다.",
      color: "bg-[#FF9F43]"
    },
    {
      id: 202,
      type: "task",
      meetingName: "모닝 스크럼",
      meetingDate: "2026.04.17",
      projectName: "AI 미팅 에이전트 고도화",
      manager: "박민호 과장",
      completedCount: 2,
      totalCount: 4,
      status: "진행중",
      description: "스크럼 회의에서 파생된 데일리 업무들이 정상적으로 처리되고 있습니다.",
      actionItems: [
        { assignee: "박민호", content: "어제 피드백 사항 정리", status: "완료", hasResult: true },
        { assignee: "이지연", content: "STT 정확도 샘플 테스트", status: "진행중", hasResult: false },
        { assignee: "김동현", content: "모델 응답 속도 최적화", status: "진행중", hasResult: false },
        { assignee: "박민호", content: "금일 업무 분장 공유", status: "완료", hasResult: true },
      ],
      aiSuggestion: "전체적으로 기한 내 업무가 진행되고 있으나, 응답 속도 최적화 건의 난이도가 높아 일정이 밀릴 가능성이 있습니다. 차기 회의에서 진행 상황을 상세 점검해보세요.",
      color: "bg-[#FF6B6B]"
    }
  ];

  useEffect(() => {
    if (activeTab === "familiarity" && familiarityList.length > 0) {
      setSelectedItem(familiarityList[0]);
    } else if (activeTab === "unresolved" && unresolvedList.length > 0) {
      setSelectedItem(unresolvedList[0]);
    } else if (activeTab === "task" && taskList.length > 0) {
      setSelectedItem(taskList[0]);
    }
  }, [activeTab]);

  const unconfirmedUsers = 
    selectedItem?.type === "familiarity" 
    ? selectedItem.participants.filter(p => p.status === "미확인") 
    : [];

  return (
    <>
      <PageMeta title="진행 현황 | 회의바라" description="회의 진행 현황 및 안건 관리" />
      
      <Toast 
        message={toastMessage} 
        subMessage={toastSubMessage} 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />

      <div className="flex gap-6 h-[calc(100vh-140px)] bg-white overflow-hidden animate-fade-in relative">
        
        {/* === [좌측 패널] === */}
        <div className="w-full lg:w-[480px] flex flex-col border border-gray-100 rounded-[32px] bg-white shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-50 bg-gray-50/30">
            {["familiarity", "unresolved", "task"].map((id, idx) => {
              const labels = ["안건 숙지 현황", "미결정 안건", "업무 이행 현황"];
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-5 text-[14px] font-black transition-all relative ${
                    activeTab === id ? "text-gray-900 bg-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {labels[idx]}
                  {activeTab === id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#91D148]"></div>}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
            {/* 1. 안건 숙지 현황 카드 */}
            {activeTab === "familiarity" && familiarityList.map((item) => {
              const total = item.participants.length;
              const confirmed = item.participants.filter(p => p.status === "확인완료").length;
              const rate = Math.round((confirmed / total) * 100);
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className={`min-w-0 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border-l-8 cursor-pointer shrink-0 ${selectedItem?.id === item.id ? "border-[#91D148]/50 ring-1 ring-[#91D148]/30 shadow-md" : ""}`}
                  style={{ borderLeftColor: getHexColor(item.color) }}
                >
                  <div className="bg-gray-50/50 p-4 border-b border-gray-50">
                    <h3 className="font-black text-gray-800 text-[15px] truncate">{item.meetingName}</h3>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="text-[13px] space-y-1.5">
                      <p className="flex text-gray-400 font-bold"><span className="w-16">날짜</span><span className="text-gray-700">{item.meetingDate} {item.meetingTime}</span></p>
                      <p className="flex text-gray-400 font-bold"><span className="w-16">프로젝트</span><span className="text-gray-700 truncate">{item.projectName}</span></p>
                      <p className="flex text-gray-400 font-bold"><span className="w-16">숙지율</span><span className="text-[#91D148] font-black">{rate}% ({confirmed}/{total}명 완료)</span></p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 2. 미결정 안건 카드 */}
            {activeTab === "unresolved" && unresolvedList.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className={`min-w-0 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border-l-8 cursor-pointer shrink-0 ${selectedItem?.id === item.id ? "border-[#91D148]/50 ring-1 ring-[#91D148]/30 shadow-md" : ""}`}
                style={{ borderLeftColor: getHexColor(item.color) }}
              >
                <div className="bg-gray-50/50 p-4 border-b border-gray-50">
                  <h3 className="font-black text-gray-800 text-[15px] truncate">{item.agendaTitle}</h3>
                </div>
                <div className="p-5 space-y-2">
                  <div className="text-[13px] space-y-1.5">
                    <p className="flex text-gray-400 font-bold"><span className="w-20">미결정발생</span><span className="text-gray-700">{item.meetingDate}</span></p>
                    <p className="flex text-gray-400 font-bold"><span className="w-20">프로젝트</span><span className="text-gray-700 truncate">{item.projectName}</span></p>
                    <p className="flex text-gray-400 font-bold"><span className="w-20">상정예정</span><span className="text-[#91D148] font-bold">{item.scheduledMeeting}</span></p>
                    <p className="flex text-gray-400 font-bold"><span className="w-20">상태</span><span className="text-red-500 font-bold">{item.status}</span></p>
                  </div>
                </div>
              </div>
            ))}

            {/* 3. 업무 이행 현황 카드 */}
            {activeTab === "task" && taskList.map((item) => {
              const rate = Math.round((item.completedCount / item.totalCount) * 100);
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className={`min-w-0 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border-l-8 cursor-pointer shrink-0 ${selectedItem?.id === item.id ? "border-[#91D148]/50 ring-1 ring-[#91D148]/30 shadow-md" : ""}`}
                  style={{ borderLeftColor: getHexColor(item.color) }}
                >
                  <div className="bg-gray-50/50 p-4 border-b border-gray-50">
                    <h3 className="font-black text-gray-800 text-[15px] truncate">{item.meetingName}</h3>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="text-[13px] space-y-1.5">
                      <p className="flex text-gray-400 font-bold"><span className="w-16">날짜</span><span className="text-gray-700">{item.meetingDate}</span></p>
                      <p className="flex text-gray-400 font-bold"><span className="w-16">프로젝트</span><span className="text-gray-700 truncate">{item.projectName}</span></p>
                      <p className="flex text-gray-400 font-bold"><span className="w-16">이행률</span><span className="text-[#91D148] font-black">{rate}% ({item.completedCount}/{item.totalCount} 완료)</span></p>
                      <p className="flex text-gray-400 font-bold">
                        <span className="w-16">상태</span>
                        <span className={`font-black ${item.status === "지연발생" ? "text-red-500" : "text-blue-500"}`}>
                          {item.status === "지연발생" ? "⚠️ " : ""}{item.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === [우측 상세 패널] === */}
        <div className="flex-1 border border-gray-100 rounded-[32px] bg-[#F4F9ED]/30 p-8 overflow-hidden flex flex-col items-center justify-center relative">
          {selectedItem ? (
            <div className="w-full max-w-4xl max-h-full bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col no-scrollbar">
              <div className={`absolute left-0 top-10 w-2 h-20 ${selectedItem.color || 'bg-[#91D148]'} rounded-r-lg`}></div>
              
              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                {/* 1. 미결정 안건 상세 */}
                {selectedItem.type === "unresolved" && (
                  <div className="space-y-8 animate-fade-in">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight mb-8">{selectedItem.agendaTitle}</h2>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-50">
                        {[
                          { label: "날짜", value: selectedItem.meetingDate },
                          { label: "프로젝트명", value: selectedItem.projectName },
                          { label: "상태", value: <span className="text-red-500 font-bold">{selectedItem.status}</span> },
                          { label: "상정예상회의", value: <span className="text-[#91D148] font-bold">{selectedItem.scheduledTime} | {selectedItem.scheduledMeeting}</span> },
                          { label: "참여부서", value: Array.from(new Set(selectedItem.participants.map(p => p.dept))).join(", ") },
                          { label: "참여 인원", value: selectedItem.participants.map(p => p.name).join(", ") }
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="py-3 w-32 font-bold text-gray-400">{row.label}</td>
                            <td className="py-3 text-gray-700">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                      <h4 className="font-black text-sm mb-4 text-gray-400 uppercase tracking-widest">상세내용</h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
                    </div>
                    {selectedItem.references && (
                      <div className="mt-8">
                        <h4 className="font-black text-sm mb-4 text-gray-400 uppercase tracking-widest">관련참고사항</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedItem.references.map((ref, i) => (
                            <a key={i} href={ref.url} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:border-[#91D148] hover:text-[#91D148] transition-all flex items-center gap-2">
                              📎 {ref.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. 안건 숙지 현황 상세 */}
                {selectedItem.type === "familiarity" && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight mb-8">{selectedItem.meetingName}</h2>
                    <div className="pb-4 border-b">
                      <p className="text-sm font-bold text-[#91D148]">{selectedItem.projectName}</p>
                      <p className="text-sm text-gray-400">{selectedItem.meetingDate} {selectedItem.meetingTime} 진행</p>
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead className="text-gray-400 border-b">
                        <tr><th className="pb-2">이름/부서</th><th className="pb-2">확인일</th><th className="pb-2">상태</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedItem.participants.map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-3 font-bold">{p.name} <span className="text-gray-400 font-normal text-xs ml-1">{p.dept}</span></td>
                            <td className="py-3">{p.time}</td>
                            <td className="py-3">{p.status === "미확인" ? <span className="text-red-500 font-black">🚩 미확인</span> : "확인완료"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. 업무 이행 현황 상세 */}
                {selectedItem.type === "task" && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-gray-50 pb-8">
                      <div>
                        <h2 className="text-[32px] font-black text-gray-900 mb-2">{selectedItem.meetingName}</h2>
                        <p className="text-lg text-gray-400 font-bold">{selectedItem.meetingDate} 진행</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#91D148] mb-2">{selectedItem.projectName}</p>
                        <span className="px-4 py-2 bg-[#F4F9ED] text-[#91D148] rounded-full text-xs font-black border border-[#91D148]/20">
                          책임자: {selectedItem.manager}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 bg-[#F4F9ED]/50 rounded-[32px] border border-[#91D148]/10">
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-gray-700">종합 이행률</h4>
                          {selectedItem.actionItems.some(ai => ai.status === "지연") && (
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                              지연 {selectedItem.actionItems.filter(ai => ai.status === "지연").length}건 발생
                            </span>
                          )}
                        </div>
                        <span className="text-3xl font-black text-[#91D148]">
                          {Math.round((selectedItem.completedCount / selectedItem.totalCount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000 ${selectedItem.status === "지연발생" ? "bg-red-400" : "bg-[#91D148]"}`}
                          style={{ width: `${(selectedItem.completedCount / selectedItem.totalCount) * 100}%` }}
                        ></div>
                      </div>
                      <p className="mt-3 text-right text-xs font-bold text-gray-400">
                        완료된 액션아이템 {selectedItem.completedCount} / 전체 {selectedItem.totalCount}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-black text-sm mb-4 text-gray-400 uppercase tracking-widest">액션아이템 상세 리스트</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 text-left border-b border-gray-50">
                            <th className="pb-3 w-20">담당자</th>
                            <th className="pb-3">업무내용</th>
                            <th className="pb-3 w-24">현재 상태</th>
                            <th className="pb-3 w-20 text-center">결과물</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {selectedItem.actionItems.map((ai, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 font-black text-gray-700">{ai.assignee}</td>
                              <td className="py-4 text-gray-600 font-medium">{ai.content}</td>
                              <td className="py-4 font-black">
                                <span className={ai.status === "지연" ? "text-red-500" : ai.status === "완료" ? "text-gray-400" : "text-blue-500"}>
                                  {ai.status === "지연" && "🚩 "}{ai.status}
                                </span>
                              </td>
                              <td className="py-4 text-center">
                                {ai.hasResult ? (
                                  <span className="text-[#91D148] cursor-pointer inline-block">✅</span>
                                ) : (
                                  <span className="text-gray-200">⬜</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 relative mb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🐹</span>
                        <h4 className="font-black text-sm text-gray-400 uppercase tracking-widest">바라의 안건 조정 제안</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        {selectedItem.aiSuggestion}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 공통 버튼 영역 */}
              <div className="flex-shrink-0 pt-8 mt-4 border-t border-gray-50">
                {selectedItem.type === "familiarity" && (
                  <button onClick={() => setIsModalOpen(true)} className="w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all bg-[#91D148] shadow-[#91D148]/20">
                    확인 촉구 알림 발송
                  </button>
                )}
                {selectedItem.type === "task" && (
                  <button 
                    onClick={() => navigate("/meeting-register")}
                    className="w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all bg-[#91D148] shadow-[#91D148]/20 flex items-center justify-center gap-2"
                  >
                    차기안건조정하러가기 <span className="text-lg">→</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 animate-fade-in">
              <div className="text-6xl mb-6 opacity-30">📂</div>
              <p className="font-bold leading-relaxed text-gray-500">
                항목을 선택하여 상세정보를 확인해 보세요.
              </p>
            </div>
          )}
        </div>

        {/* 모달 로직 */}
        {isModalOpen && selectedItem?.type === "familiarity" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] p-10 w-[440px] shadow-2xl text-center">
              <div className="text-5xl mb-6">{unconfirmedUsers.length > 0 ? "🔔" : "✅"}</div>
              <h3 className="text-2xl font-black mb-2">{unconfirmedUsers.length > 0 ? "알림을 발송할까요?" : "숙지 완료!"}</h3>
              <p className="text-gray-500 text-sm mb-8">{unconfirmedUsers.length > 0 ? <>미확인 인원 <span className="text-[#91D148] font-bold">{unconfirmedUsers.length}명</span>에게 알림을 보냅니다.</> : <>모든 참여자가 숙지했습니다.</>}</p>
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl">닫기</button>
                {unconfirmedUsers.length > 0 && (
                  <button 
                    onClick={() => { 
                      setToastMessage("알림이 성공적으로 발송되었습니다! 🐹"); 
                      setToastSubMessage(`미확인 인원 ${unconfirmedUsers.length}명에게 푸시 알림을 보냈습니다.`);
                      setIsToastVisible(true); 
                      setIsModalOpen(false); 
                    }} 
                    className="flex-1 py-4 bg-[#91D148] text-white font-bold rounded-2xl"
                  >
                    발송하기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {typeof document !== "undefined" && createPortal(<CapybaraZone />, document.body)}
      </div>
    </>
  );
};

export default Status;