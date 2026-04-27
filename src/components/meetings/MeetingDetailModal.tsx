import React from "react";

// =============================================
// 타입 정의 (부모와 공유하기 위해 export)
// =============================================
export interface ActionItem {
  assignee: string;
  task: string;
  status: "진행 중" | "완료" | "지연";
}

export interface Agenda {
  title: string;
  isDone: boolean;
}

export interface Meeting {
  id: number;
  date: string;
  title: string;
  projectName: string;
  projectColor: string;
  agenda: string;
  keywords: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  status: "진행 완료" | "진행 중";
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  projectFullName: string;
  owner: string;
  department: string;
  participants: string[];
  aiSummary: string;
  agendaItems: Agenda[];
  actionItems: ActionItem[];
  recordingFile: string;
  referenceDoc: string;
  keywordTags: string[];
}

interface MeetingDetailModalProps {
  meeting: Meeting;
  onClose: () => void;
}

const statusColor = (status: ActionItem["status"]) => {
  if (status === "완료") return "bg-[#C8E6A5]/70 text-[#4d7222]";
  if (status === "지연") return "bg-red-100 text-red-600";
  return "bg-blue-100 text-blue-600";
};

const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ meeting, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[860px] max-h-[90vh] overflow-y-auto mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10"
          style={{ borderLeft: `4px solid ${meeting.projectColor}` }}
        >
          <div>
            <p className="text-[11px] font-bold text-gray-400 mb-1">{meeting.projectName}</p>
            <h2 className="text-[18px] font-black text-gray-900">{meeting.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 text-[18px] font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* 기본 정보 */}
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wide">기본 정보</p>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-gray-400 font-bold">일시</span>
                <p className="text-gray-800 font-bold mt-0.5">
                  {meeting.date} ({meeting.dayOfWeek}) {meeting.startTime}~{meeting.endTime} ({meeting.duration})
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">장소</span>
                <p className="text-gray-800 font-bold mt-0.5">{meeting.location}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">상태</span>
                <p className="mt-0.5">
                  <span className="inline-block px-2 py-0.5 bg-[#C8E6A5]/60 text-[#4d7222] rounded-full text-[11px] font-bold">
                    {meeting.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">이행 현황</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-block px-2 py-0.5 bg-[#C8E6A5]/60 text-[#4d7222] rounded-full text-[11px] font-bold">
                    완료 {meeting.completedTasks}
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[11px] font-bold">
                    진행중 {meeting.inProgressTasks}
                  </span>
                  {meeting.overdueTasks > 0 && (
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-500 rounded-full text-[11px] font-bold">
                      지연 {meeting.overdueTasks}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 프로젝트 정보 */}
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wide">프로젝트 정보</p>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-gray-400 font-bold">프로젝트명</span>
                <p className="text-gray-800 font-bold mt-0.5">{meeting.projectFullName}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">책임자</span>
                <p className="text-gray-800 font-bold mt-0.5">{meeting.owner}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">참여 부서</span>
                <p className="text-gray-800 font-bold mt-0.5">{meeting.department}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">참여자</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {meeting.participants.map((p) => (
                    <span
                      key={p}
                      className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI 회의 요약 */}
          <div className="border border-[#91D148]/30 bg-[#F4F9ED]/50 rounded-xl p-4">
            <p className="text-[12px] font-black text-[#4d7222] mb-2 uppercase tracking-wide">AI 회의 요약</p>
            <p className="text-[13px] text-gray-700 font-bold leading-relaxed">{meeting.aiSummary}</p>
          </div>

          {/* 주요 안건 + 파생 액션아이템 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wide">주요안건 및 결정사항</p>
              <div className="flex flex-col gap-2">
                {meeting.agendaItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-black border ${
                        item.isDone
                          ? "bg-[#91D148] border-[#91D148] text-white"
                          : "border-gray-300 text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                    <p className={`text-[12px] leading-relaxed ${item.isDone ? "text-gray-700" : "text-gray-400"}`}>
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wide">파생 액션아이템 및 이행 현황</p>
              <div className="flex flex-col gap-2">
                {meeting.actionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-black flex-shrink-0 ${statusColor(item.status)}`}
                    >
                      {item.assignee}
                    </span>
                    <p className="text-[12px] text-gray-600 leading-relaxed">{item.task}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[11px] font-black text-gray-400 mb-1.5">관련 자료 및 키워드</p>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[11px] text-gray-400">🎵</span>
                  <span className="text-[11px] text-[#4d7222] font-bold underline cursor-pointer">
                    {meeting.recordingFile}
                  </span>
                </div>
                {meeting.referenceDoc && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[11px] text-gray-400">📎</span>
                    <span className="text-[11px] text-gray-500 font-bold">{meeting.referenceDoc}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {meeting.keywordTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[11px] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailModal;