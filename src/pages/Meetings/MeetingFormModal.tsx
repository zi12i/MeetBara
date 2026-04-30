import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MeetingItem = {
  id?: number;
  title: string;
  projectName?: string;
  date: string;
  time: string;
  room: string;
  attendees: string;
  attendeesList?: string[];
  color?: string;
  savedAgendas?: string[];
  selectedPendingAgendas?: any[];
  templateName?: string;
};

type MeetingFormModalProps = {
  isOpen: boolean;
  isCreatingNew: boolean;
  meeting: MeetingItem | null;
  onClose: () => void;
  onSubmit: (data: MeetingItem) => void;
  onDelete?: () => void;
};

export default function MeetingFormModal({
  isOpen,
  isCreatingNew,
  meeting,
  onClose,
  onSubmit,
  onDelete,
}: MeetingFormModalProps) {
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title || "");
      setProjectName(meeting.projectName || "");
      setDate(meeting.date ? meeting.date.replaceAll(".", "-") : "");

      const [start, end] = meeting.time?.split("~") || ["", ""];
      setStartTime(start || "");
      setEndTime(end || "");
      setRoom(meeting.room === "장소 미정" ? "" : meeting.room || "");
    } else {
      setTitle("");
      setProjectName("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setRoom("");
    }
  }, [meeting, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !date || !startTime || !endTime) {
      alert("회의 제목, 날짜, 시작 시간, 종료 시간은 필수입니다.");
      return;
    }

    if (startTime >= endTime) {
      alert("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    onSubmit({
      title: title.trim(),
      projectName,
      date: date.replaceAll("-", "."),
      time: `${startTime}~${endTime}`,
      room: room.trim() || "장소 미정",
      attendees: meeting?.attendees || "참석자 없음",
      attendeesList: meeting?.attendeesList || [],
      color: meeting?.color || "#91D148",
      savedAgendas: meeting?.savedAgendas || [],
      selectedPendingAgendas: meeting?.selectedPendingAgendas || [],
      templateName: meeting?.templateName || "",
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-[720px] bg-white shadow-2xl overflow-y-auto">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span
              className={`text-[13px] font-black px-3.5 py-1.5 rounded-lg shadow-sm ${
                isCreatingNew
                  ? "bg-[#91D148] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {isCreatingNew ? "새 회의 등록" : "예약된 회의 수정"}
            </span>

            <h2 className="mt-4 text-[26px] font-black text-gray-900 leading-tight">
              {isCreatingNew ? "새로운 일정을 기록해 볼까요?" : title || "회의 수정"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
          >
            닫기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
              회의 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) AI 에이전트 서비스 주간 싱크"
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
              프로젝트
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="프로젝트명을 입력해주세요"
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2.5">
                날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-gray-900 focus:border-[#91D148] outline-none transition-all shadow-sm"
              />
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

          <div className="flex items-center justify-between pt-4">
            <div>
              {!isCreatingNew && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
              >
                취소
              </button>

              <button
                type="submit"
                className="bg-[#91D148] text-white px-8 py-3 rounded-xl font-black hover:bg-[#82bd41] transition-all"
              >
                {isCreatingNew ? "회의 예약하기" : "변경사항 저장"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}