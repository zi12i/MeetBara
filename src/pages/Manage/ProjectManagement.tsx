import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageMeta from "../../components/common/PageMeta";
import MemberAddModal from "../../components/meetings/MemberAddModal";

// --- SVG 아이콘 정의 ---
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PlusIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CalendarIcon = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const HistoryIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const PRESET_COLORS = ["#91D148", "#FF87B4", "#FFD154", "#FF6B6B", "#7000FF", "#4DABF7"];

const getBgColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.08)`;
};

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  color: string;
  members: any[];
}

const ProjectManagement: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "메인 서비스 UI 개편", startDate: "2026-04-01", endDate: "2026-04-30", description: "UI 디자인 고도화 프로젝트", color: "#91D148", members: [] }
  ]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>("1");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", start: "", end: "", desc: "", color: "#91D148" });
  const [nameError, setNameError] = useState("");

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

  const openProjectForm = (project?: Project) => {
    if (project) {
      setIsEditMode(true);
      setFormData({ name: project.name, start: project.startDate, end: project.endDate, desc: project.description, color: project.color });
    } else {
      setIsEditMode(false);
      setFormData({ name: "", start: "", end: "", desc: "", color: "#91D148" });
    }
    setNameError("");
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (!isEditMode && formData.name && projects.some(p => p.name === formData.name)) {
      setNameError("이미 사용 중인 프로젝트명입니다.");
    } else {
      setNameError("");
    }
  }, [formData.name, projects, isEditMode]);

  const handleSaveProject = () => {
    if (!formData.name || nameError) return;
    if (isEditMode && selectedProjectId) {
      setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, ...formData } : p));
    } else {
      const newProj = { id: Date.now().toString(), ...formData, members: [] };
      setProjects([...projects, newProj]);
      setSelectedProjectId(newProj.id);
    }
    setIsFormOpen(false);
  };

  const calendarEvents = useMemo(() => {
    if (!selectedProject) return [];
    return [
      { start: selectedProject.startDate, end: selectedProject.endDate, display: 'background', color: getBgColor(selectedProject.color) },
      { title: "중간 미팅", start: "2026-04-21", color: selectedProject.color }
    ];
  }, [selectedProject]);

  const handleAddMembers = (newMembers: any[]) => {
    setProjects(prev => prev.map(p => p.id === selectedProjectId ? {
      ...p, members: [...p.members, ...newMembers]
    } : p));
  };

  return (
    // 💡 부모 컨테이너: h-screen과 overflow-hidden으로 전체 스크롤 고정
    <div className="flex h-screen bg-white overflow-hidden">
      <PageMeta title="프로젝트 관리" description="독립 패널 스크립트" />

      {/* --- [왼쪽 패널] 프로젝트 목록 --- */}
      <aside className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 shrink-0 h-full">
        {/* 고정 헤더 */}
        <div className="p-6 flex justify-between items-center border-b bg-white shrink-0">
          <h2 className="text-xl font-black text-gray-900">프로젝트</h2>
          <button onClick={() => openProjectForm()} className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-all">
            <PlusIcon />
          </button>
        </div>
        
        {/* 💡 개별 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-20">
          {projects.map(project => (
            <div 
              key={project.id} 
              onClick={() => setSelectedProjectId(project.id)} 
              className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedProjectId === project.id ? "bg-white shadow-lg" : "bg-white border-transparent hover:border-gray-200"
              }`}
              style={{ borderColor: selectedProjectId === project.id ? project.color : "transparent" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                <h3 className="font-extrabold text-[15px] truncate pr-10 text-gray-800">{project.name}</h3>
              </div>
              <p className="text-[12px] text-gray-400 font-bold flex items-center gap-1.5"><CalendarIcon /> {project.startDate} ~ {project.endDate}</p>
              
              <div className="absolute right-3 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); openProjectForm(project); }} className="p-1.5 text-gray-400 hover:text-gray-900"><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); if(window.confirm("삭제할까요?")) setProjects(prev => prev.filter(p => p.id !== project.id)); }} className="p-1.5 text-gray-400 hover:text-red-500"><TrashIcon /></button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* --- [오른쪽 패널] 프로젝트 상세 --- */}
      <main className="flex-1 h-full overflow-y-auto no-scrollbar bg-white relative">
        {selectedProject ? (
          <div className="p-10 space-y-12 max-w-5xl mx-auto pb-32">
            {/* 상세 헤더 */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-10">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 flex items-center gap-5">
                  <div className="w-8 h-8 rounded-xl shadow-sm" style={{ backgroundColor: selectedProject.color }}></div>
                  {selectedProject.name}
                </h1>
                <p className="text-gray-500 font-bold max-w-3xl leading-relaxed text-lg">{selectedProject.description}</p>
              </div>
              <button onClick={() => navigate(`/history?project=${selectedProject.id}`)} className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 shadow-2xl transition-all active:scale-95">
                <HistoryIcon /> 회의 히스토리
              </button>
            </div>

            {/* 캘린더 타임라인 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 px-1">
                <CalendarIcon size={24} /> 프로젝트 타임라인
              </h2>
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                  events={calendarEvents}
                  height="auto"
                  contentHeight={480}
                  locale="ko"
                />
              </div>
            </section>

            {/* 멤버 관리 섹션 */}
            <section className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <UsersIcon /> 참여 멤버 ({selectedProject.members.length})
                </h2>
                <button 
                  onClick={() => setIsMemberModalOpen(true)} 
                  className="px-6 py-3 bg-white border-2 font-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                  style={{ color: selectedProject.color, borderColor: selectedProject.color }}
                >
                  + 멤버 추가하기
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {selectedProject.members.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                    아직 등록된 멤버가 없습니다.<br/><span className="text-sm font-medium mt-2 block opacity-60">멤버를 추가하여 팀을 구성해 보세요!</span>
                  </div>
                ) : (
                  selectedProject.members.map((m, idx) => (
                    <div key={idx} className="p-5 bg-white border border-gray-100 rounded-[24px] shadow-sm flex items-center gap-5 hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: selectedProject.color }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg" style={{ backgroundColor: getBgColor(selectedProject.color), color: selectedProject.color }}>
                        {m.name[0]}
                      </div>
                      <div>
                        <p className="text-[16px] font-bold text-gray-800">{m.name}</p>
                        <p className="text-[12px] text-gray-400 font-bold">{m.department} · {m.position}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <div className="bg-gray-50 p-10 rounded-full mb-6">
               <PlusIcon size={80} />
            </div>
            <p className="font-black text-xl text-gray-400 tracking-tight">프로젝트를 선택하거나 새로 생성하세요.</p>
          </div>
        )}
      </main>

      {/* 모달: 프로젝트 등록/수정 (기존 로직 유지) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-zoom-in">
            <button onClick={() => setIsFormOpen(false)} className="absolute right-8 top-8 text-gray-400 hover:text-gray-900"><XIcon /></button>
            <h2 className="text-2xl font-black text-gray-900 mb-8">{isEditMode ? "프로젝트 수정" : "새 프로젝트 추가"}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-black text-gray-700 mb-2">프로젝트명</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full h-12 bg-gray-50 border-2 rounded-xl px-4 outline-none transition-all ${nameError ? 'border-red-400' : 'focus:border-gray-900'}`} placeholder="프로젝트 이름" />
                {nameError && <p className="mt-1.5 text-[11px] text-red-500 font-bold italic ml-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-black text-gray-700 mb-3">대표 색상 선택</label>
                <div className="flex flex-wrap items-center gap-3">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setFormData({...formData, color: c})} className={`w-8 h-8 rounded-full transition-all ${formData.color === c ? 'ring-4 ring-offset-2 ring-gray-300 scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                  ))}
                  <div className="relative w-8 h-8 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-gray-900 transition-all">
                    <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="absolute inset-0 w-10 h-10 -m-1.5 cursor-pointer opacity-0" />
                    <span className="text-sm font-bold text-gray-400 pointer-events-none">+</span>
                  </div>
                  <span className="ml-2 text-[12px] font-black text-gray-400 uppercase tracking-widest">{formData.color}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[13px] font-black text-gray-700 mb-2">시작일</label>
                <input type="date" value={formData.start} onChange={(e) => setFormData({...formData, start: e.target.value})} className="w-full h-12 bg-gray-50 rounded-xl px-4 border-2 border-transparent outline-none focus:border-gray-900 font-bold" /></div>
                <div><label className="block text-[13px] font-black text-gray-700 mb-2">종료일</label>
                <input type="date" value={formData.end} onChange={(e) => setFormData({...formData, end: e.target.value})} className="w-full h-12 bg-gray-50 rounded-xl px-4 border-2 border-transparent outline-none focus:border-gray-900 font-bold" /></div>
              </div>

              <div>
                <label className="block text-[13px] font-black text-gray-700 mb-2">상세 설명</label>
                <textarea rows={3} value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent rounded-xl p-4 outline-none focus:border-gray-900 resize-none font-bold" placeholder="설명을 입력하세요" />
              </div>
            </div>

            <div className="mt-10">
              <button onClick={handleSaveProject} className="w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all hover:brightness-90 active:scale-[0.98]" style={{ backgroundColor: formData.color }}>저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 추가 모달 */}
      <MemberAddModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onAdd={handleAddMembers} />
    </div>
  );
};

export default ProjectManagement;