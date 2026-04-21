import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageMeta from "../../components/common/PageMeta";
import MemberAddModal from "../../components/meetings/MemberAddModal";
import { createPortal } from "react-dom";
import CapybaraZone from "../../components/common/CapybaraZone";

// --- SVG 아이콘 (기존 톤앤매너 유지) ---
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const PRESET_COLORS = ["#91D148", "#FF87B4", "#FFD154", "#FF6B6B", "#7000FF", "#4DABF7"];
const getBgColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
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

export default function ProjectManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "메인 서비스 UI 고도화", startDate: "2026-04-01", endDate: "2026-04-30", description: "브랜드 아이덴티티 강화를 위한 디자인 시스템 및 UI 컴포넌트 전면 개편 프로젝트", color: "#91D148", members: [] }
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
      setNameError("이미 존재하는 프로젝트 명칭입니다.");
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

  return (
    <>
      <PageMeta title="프로젝트 관리" description="프로젝트 일정 및 멤버 관리" />
      {createPortal(<CapybaraZone />, document.body)}

      {/* 💡 핵심 솔루션: absolute inset-0 적용 */}
      <div className="absolute inset-0 p-4 md:p-6 overflow-hidden bg-transparent">
        
        <div className="w-full h-full max-w-(--breakpoint-2xl) mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* === [좌측] 프로젝트 목록 패널 === */}
          <div className="w-full lg:w-[400px] xl:w-[440px] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
            
            {/* 상단 고정 헤더 */}
            <div className="p-6 pb-4 border-b border-gray-100 bg-white z-10 shrink-0">
              <h2 className="text-[18px] font-black text-gray-900 flex items-center gap-2.5">
                <CalendarIcon /> 프로젝트 목록
                <span className="bg-gray-100 text-gray-500 text-[12px] px-2.5 py-1 rounded-full ml-1">{projects.length}건</span>
              </h2>
              <button 
                onClick={() => openProjectForm()}
                className="w-full mt-4 py-3.5 bg-white text-gray-500 border-2 border-gray-200 rounded-xl font-black text-[14px] flex items-center justify-center gap-2 hover:border-[#91D148]/50 transition-all"
              >
                <PlusIcon /> 새 프로젝트 등록하기
              </button>
            </div>

            {/* 개별 내부 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-gray-50/30">
              {projects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`group relative p-6 rounded-2xl cursor-pointer transition-all border border-gray-200 border-l-[6px] ${
                    selectedProjectId === project.id ? "bg-white shadow-md border-r border-t border-b border-gray-200 scale-[1.02]" : "bg-white shadow-sm hover:bg-gray-50/50"
                  }`}
                  style={{ borderLeftColor: project.color }}
                >
                  <h3 className="font-bold text-[16px] text-gray-900 mb-3 pr-12 leading-snug">{project.name}</h3>
                  <div className="flex items-center gap-2 text-[12px] text-gray-400 font-bold">
                    <CalendarIcon /> {project.startDate} ~ {project.endDate}
                  </div>
                  {/* 수정/삭제 퀵 버튼 */}
                  <div className="absolute right-4 top-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openProjectForm(project); }} className="p-2 text-gray-400 hover:text-gray-900"><EditIcon /></button>
                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm("정말 삭제하시겠습니까?")) setProjects(p => p.filter(x => x.id !== project.id)); }} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* === [우측] 프로젝트 상세 패널 === */}
          <div className="flex-1 h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
            
            {selectedProject ? (
              <>
                {/* 상단 고정 상세 헤더 */}
                <div className="p-8 pb-6 border-b border-gray-100 shrink-0 bg-white z-10 flex justify-between items-end">
                  <div className="space-y-3">
                    <span className="inline-block text-[13px] font-black px-3.5 py-1.5 rounded-lg shadow-sm text-white" style={{ backgroundColor: selectedProject.color }}>
                      Project Detail
                    </span>
                    <h2 className="text-[30px] font-black text-gray-900 leading-tight tracking-tight flex items-center gap-3">
                      {selectedProject.name}
                    </h2>
                  </div>
                  <button onClick={() => navigate(`/history?project=${selectedProject.id}`)} className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 shadow-lg transition-all active:scale-95 text-[14px]">
                    <HistoryIcon /> 회의 히스토리
                  </button>
                </div>

                {/* 개별 내부 스크롤 영역 */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-10 space-y-12">
                  
                  {/* 1. 설명 섹션 */}
                  <section className="space-y-4">
                    <h3 className="text-[18px] font-black text-gray-800 flex items-center gap-2">상세 설명</h3>
                    <p className="text-[15px] text-gray-500 font-bold leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      {selectedProject.description}
                    </p>
                  </section>

                  {/* 2. 캘린더 섹션 */}
                  <section className="space-y-6">
                    <h3 className="text-[18px] font-black text-gray-800 flex items-center gap-2"><CalendarIcon /> 프로젝트 타임라인</h3>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                        events={[
                          { start: selectedProject.startDate, end: selectedProject.endDate, display: 'background', color: getBgColor(selectedProject.color) },
                          { title: "중간 보고", start: "2026-04-21", color: selectedProject.color }
                        ]}
                        height="auto"
                        contentHeight={440}
                        locale="ko"
                      />
                    </div>
                  </section>

                  {/* 3. 멤버 섹션 */}
                  <section className="space-y-6 pb-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[18px] font-black text-gray-800 flex items-center gap-2"><UsersIcon /> 참여 멤버 ({selectedProject.members.length})</h3>
                      <button onClick={() => setIsMemberModalOpen(true)} className="text-[#91D148] text-[14px] font-black hover:underline flex items-center gap-1.5"><PlusIcon /> 멤버 추가</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {selectedProject.members.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-gray-400 font-bold bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                          아직 등록된 멤버가 없습니다.
                        </div>
                      ) : (
                        selectedProject.members.map((m, idx) => (
                          <div key={idx} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-[16px]" style={{ backgroundColor: getBgColor(selectedProject.color), color: selectedProject.color }}>{m.name[0]}</div>
                            <div>
                              <p className="text-[15px] font-black text-gray-800">{m.name}</p>
                              <p className="text-[12px] text-gray-400 font-bold">{m.department} · {m.position}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 font-black space-y-4">
                <div className="p-8 bg-gray-50 rounded-full"><PlusIcon /></div>
                <p>조회할 프로젝트를 선택해주세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* [모달] 프로젝트 등록/수정 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl relative animate-zoom-in">
            <h2 className="text-2xl font-black text-gray-900 mb-8">{isEditMode ? '프로젝트 수정' : '새 프로젝트 등록'}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">프로젝트명 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full h-14 bg-gray-50 border-2 rounded-xl px-5 outline-none font-bold focus:bg-white transition-all ${nameError ? 'border-red-400' : 'border-transparent focus:border-gray-900'}`} placeholder="예: 신규 앱 기획" />
                {nameError && <p className="mt-2 text-[12px] text-red-500 font-bold ml-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-3">대표 색상</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setFormData({...formData, color: c})} className={`w-8 h-8 rounded-full transition-all ${formData.color === c ? 'ring-4 ring-offset-2 ring-gray-300 scale-110' : ''}`} style={{ backgroundColor: c }} />
                  ))}
                  <div className="relative w-8 h-8 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer">
                    <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="absolute inset-0 w-12 h-12 -m-2 cursor-pointer opacity-0" />
                    <span className="text-gray-400 font-bold">+</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[14px] font-bold text-gray-700 mb-2">시작일</label><input type="date" value={formData.start} onChange={(e) => setFormData({...formData, start: e.target.value})} className="w-full h-14 bg-gray-50 rounded-xl px-4 font-bold outline-none" /></div>
                <div><label className="block text-[14px] font-bold text-gray-700 mb-2">종료일</label><input type="date" value={formData.end} onChange={(e) => setFormData({...formData, end: e.target.value})} className="w-full h-14 bg-gray-50 rounded-xl px-4 font-bold outline-none" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-10">
              <button onClick={() => setIsFormOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl">취소</button>
              <button onClick={handleSaveProject} className="flex-1 py-4 text-white font-black rounded-2xl shadow-lg" style={{ backgroundColor: formData.color }}>저장하기</button>
            </div>
          </div>
        </div>
      )}

      <MemberAddModal 
        isOpen={isMemberModalOpen} 
        onClose={() => setIsMemberModalOpen(false)} 
        onAdd={(newMembers) => {
          setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, members: [...p.members, ...newMembers] } : p));
        }} 
      />
    </>
  );
}