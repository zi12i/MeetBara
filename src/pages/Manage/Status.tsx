import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";

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
  meetingDate: string;   // 미결정발생일 (과거)
  meetingTime: string;
  meetingName: string;
  projectName: string;    // 프로젝트명
  agendaTitle: string;    // 미결정안건 명
  scheduledMeeting: string; // 상정예정회의 (미래)
  scheduledTime: string; 
  deadline: string;
  description: string;
  status: "보류(기술검토)" | "재논의 필요" | "추가조사중" | "결정권자 부재";
  participants: Participant[];
  references?: Reference[];
  color?: string;
}

const Status: React.FC = () => {
  const [activeTab, setActiveTab] = useState("familiarity");
  const [selectedItem, setSelectedItem] = useState<FamiliarityData | UnresolvedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === [데이터 1] 안건 숙지 현황 리스트 (미래에 예정된 회의) ===
  const familiarityList: FamiliarityData[] = [
    {
      id: 1,
      type: "familiarity",
      meetingDate: "2026.04.25", // 미래 날짜로 수정
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
      meetingDate: "2026.04.28", // 미래 날짜로 수정
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

  // === [데이터 2] 미결정 안건 리스트 (과거에 발생한 안건) ===
  const unresolvedList: UnresolvedData[] = [
    {
      id: 102,
      type: "unresolved",
      meetingDate: "2026.04.15", // 과거 날짜로 수정
      meetingTime: "11:00",
      meetingName: "시스템 아키텍처 1차 검토",
      projectName: "금융권 차세대 ERP UI 개선",
      agendaTitle: "DB 이중화 방식 결정의 건",
      scheduledMeeting: "차세대 ERP 보안 고도화 회의", // 위 예정회의와 연결
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

  useEffect(() => {
    if (activeTab === "familiarity" && familiarityList.length > 0) {
      setSelectedItem(familiarityList[0]);
    } else if (activeTab === "unresolved" && unresolvedList.length > 0) {
      setSelectedItem(unresolvedList[0]);
    } else {
      setSelectedItem(null);
    }
  }, [activeTab]);

  const unconfirmedUsers = 
    selectedItem?.type === "familiarity" 
    ? selectedItem.participants.filter(p => p.status === "미확인") 
    : [];

  return (
    <>
      <PageMeta title="진행 현황 | 회의바라" description="회의 진행 현황 및 안건 관리" />

      <div className="flex gap-6 h-[calc(100vh-140px)] bg-white overflow-hidden animate-fade-in relative">
        
        {/* 좌측 패널 */}
        <div className="w-full lg:w-[480px] flex flex-col border border-gray-100 rounded-[32px] bg-white shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-50 bg-gray-50/30">
            {["familiarity", "unresolved", "task"].map((id, idx) => {
              const labels = ["안건 숙지 현황", "미결정 안건", "업무 이행 현황"];
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-5 text-[15px] font-black transition-all relative ${
                    activeTab === id ? "text-gray-900 bg-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {labels[idx]}
                  {activeTab === id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#91D148]"></div>}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {activeTab === "familiarity" && familiarityList.map((item) => {
              const total = item.participants.length;
              const confirmed = item.participants.filter(p => p.status === "확인완료").length;
              const rate = Math.round((confirmed / total) * 100);
              return (
                <div key={item.id} onClick={() => setSelectedItem(item)} className={`relative p-5 pl-7 rounded-2xl border cursor-pointer ${selectedItem?.id === item.id ? "border-[#91D148] bg-[#F4F9ED]/50" : "border-gray-100 bg-white"}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${item.color}`}></div>
                  <p className="text-[12px] text-gray-500 mb-1">{item.meetingDate} {item.meetingTime} | {item.meetingName}</p>
                  <h4 className="text-[15px] font-bold text-gray-800">
                    {item.projectName} | 숙지율: {rate}% ({confirmed}/{total}명)
                  </h4>
                </div>
              );
            })}

            {activeTab === "unresolved" && unresolvedList.map((item) => (
              <div key={item.id} onClick={() => setSelectedItem(item)} className={`relative p-5 pl-7 rounded-2xl border cursor-pointer ${selectedItem?.id === item.id ? "border-[#91D148] bg-[#F4F9ED]/50" : "border-gray-100 bg-white"}`}>
                {item.color && <div className={`absolute left-0 top-0 bottom-0 w-2 ${item.color}`}></div>}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-400">미결정발생일:</span>
                    <span className="text-[11px] text-gray-500">{item.meetingDate}</span>
                  </div>
                  <h4 className="text-[16px] font-black text-gray-800 my-1">{item.agendaTitle}</h4>
                  <div className="mt-1 space-y-0.5 text-[12px] text-gray-600">
                    <p><span className="font-bold text-gray-400 mr-1.5">프로젝트명:</span>{item.projectName}</p>
                    <p><span className="font-bold text-gray-400 mr-1.5">상정예정회의:</span><span className="text-[#91D148] font-bold">{item.scheduledMeeting}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 우측 상세 패널 */}
        <div className="flex-1 border border-gray-100 rounded-[32px] bg-[#F4F9ED]/30 p-8 overflow-hidden flex flex-col items-center justify-center relative">
          {selectedItem ? (
            <div className="w-full max-w-3xl max-h-full bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
              <div className={`absolute left-0 top-10 w-2 h-20 ${selectedItem.color} rounded-r-lg`}></div>
              
              <div className="flex-shrink-0 mb-8">
                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  {selectedItem.type === "familiarity" ? selectedItem.meetingName : selectedItem.agendaTitle}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                {selectedItem.type === "unresolved" ? (
                  <div className="space-y-8">
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
                      <div className="mt-6">
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
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-end pb-4 border-b">
                      <div>
                        <p className="text-sm font-bold text-[#91D148]">{selectedItem.projectName}</p>
                        <p className="text-sm text-gray-400">{selectedItem.meetingDate} {selectedItem.meetingTime} 진행</p>
                      </div>
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
              </div>

              {selectedItem.type === "familiarity" && (
                <div className="flex-shrink-0 pt-8 mt-4 border-t border-gray-50">
                  <button onClick={() => setIsModalOpen(true)} className="w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all bg-[#91D148] shadow-[#91D148]/20">
                    확인 촉구 알림 발송
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 animate-fade-in">
              <div className="text-6xl mb-6 opacity-30">📂</div>
              <p className="font-bold leading-relaxed text-gray-500">
                {activeTab === "unresolved" 
                  ? <>리스트에서 미결정안건을 선택하여<br/>상세내용을 확인해 보세요.</>
                  : <>리스트에서 항목을 선택하여<br/>상세정보를 확인해 보세요.</>
                }
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
                    onClick={() => { alert("알림이 성공적으로 발송되었습니다!"); setIsModalOpen(false); }} 
                    className="flex-1 py-4 bg-[#91D148] text-white font-bold rounded-2xl"
                  >
                    발송하기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Status;