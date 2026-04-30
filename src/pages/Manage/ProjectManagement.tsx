import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase.ts";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import MemberAddModal from "../../components/meetings/MemberAddModal";
import { createPortal } from "react-dom";
import CapybaraZone from "../../components/common/CapybaraZone";
import DatePicker from "../../components/common/DatePicker";

const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const UsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
const HistoryIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const CrownIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"></path></svg>;
const MapPinIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const XIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const PRESET_COLORS = ["#91D148", "#FF87B4", "#FFD154", "#FF6B6B", "#7000FF", "#4DABF7"];
const getBgColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.08)`;
};

const calculateProgress = (start: string, end: string) => {
  if (!start || !end) return 0;
  const s = new Date(start).getTime(), e = new Date(end).getTime(), now = new Date().getTime();
  if (isNaN(s) || isNaN(e) || s >= e) return 0;
  return Math.min(100, Math.max(0, Math.floor(((now - s) / (e - s)) * 100)));
};

const DynamicMiniCalendar = ({ project }: { project: any }) => {
  const [viewDate, setViewDate] = useState(new Date());
  useEffect(() => { setViewDate(new Date()); }, [project.id]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    return arr;
  }, [viewDate]);

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm h-full">
      <div className="flex justify-between items-center mb-5 px-1">
        <h4 className="text-[16px] font-black text-gray-900">{year}. {(month + 1).toString().padStart(2, '0')}</h4>
        <div className="flex gap-4 text-gray-400 font-black text-[12px] select-none">
          <span className="cursor-pointer hover:text-gray-900" onClick={() => setViewDate(new Date(year, month - 1, 1))}>Prev</span>
          <span className="cursor-pointer hover:text-gray-900" onClick={() => setViewDate(new Date(year, month + 1, 1))}>Next</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map(d => <div key={d} className="text-[11px] font-black text-gray-300 mb-2">{d}</div>)}
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="py-1.5"></div>;
          const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isInRange = dateStr >= project.startDate && dateStr <= project.endDate;
          const hasMeeting = project.meetings?.some((m: any) => m.date === dateStr);
          return (
            <div key={day} className="relative py-1.5 flex flex-col items-center justify-center">
              {isInRange && <div className="absolute inset-0 opacity-40" style={{ backgroundColor: getBgColor(project.color) }}></div>}
              <span className={`relative z-10 text-[12px] font-bold ${isInRange ? 'text-gray-900' : 'text-gray-300'}`}>{day}</span>
              {hasMeeting && <div className="relative z-10 w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: project.color }}></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ProjectManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", start: "", end: "", desc: "", color: "#91D148" });
  const [nameError, setNameError] = useState("");
  const [modalKey, setModalKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'project' | 'member', id: string, name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

  // Supabase에서 프로젝트 목록 불러오기
  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('프로젝트')
      .select('*')
      .eq('대표정보id', user?.대표정보id)
      .contains('프로젝트인원', [user?.개인정보id])
      .order('프로젝트id', { ascending: true });

    if (error) { console.error(error); setLoading(false); return; }

    if (data) {
      const formatted = await Promise.all(data.map(async (p: any) => {
        // 각 프로젝트의 회의 목록 불러오기
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: meetings } = await supabase
        .from('회의정보')
        .select('*')
        .eq('프로젝트id', p['프로젝트id'])
        .gte('회의일정', todayStr)
        .order('회의일정', { ascending: true });

        // 멤버 목록 불러오기
        const memberIds = p['프로젝트인원'] || [];
        let members: any[] = [];
        if (memberIds.length > 0) {
          const { data: memberData } = await supabase
            .from('개인정보')
            .select('*, 부서(*), 직급(*)')
            .in('개인정보id', memberIds);
          if (memberData) {
            members = memberData.map((m: any) => ({
              id: m['개인정보id'].toString(),
              name: m['이름'] || '',
              department: m['부서']?.['부서명'] || '',
              position: m['직급']?.['직급명'] || '',
              isPM: false,
            }));
          }
        }

        return {
          id: p['프로젝트id'].toString(),
          name: p['프로젝트명'] || '',
          startDate: p['시작일'] || '',
          endDate: p['종료일'] || '',
          color: p['프로젝트색상'] || '#91D148',
          description: p['프로젝트설명'] || '',
          owner: p['담당자명'] || '',
          members,
          meetings: (meetings || []).map((m: any) => ({
            id: m['회의정보id'],
            title: m['회의제목'] || m['회의내용'] || '회의',
            date: m['회의일정'],
            time: `${m['회의시작시간']}:00~${m['회의종료시간']}:00`,
            room: m['회의장소'] || '',
            attendees: m['카드브리핑'] || '',
          })),
        };
      }));
      setProjects(formatted);
      if (formatted.length > 0) setSelectedProjectId(formatted[0].id);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    if (!formData.name.trim()) { setNameError(""); return; }
    const isDuplicate = projects.some(p => p.name.trim() === formData.name.trim() && (isEditMode ? p.id !== selectedProjectId : true));
    setNameError(isDuplicate ? "이미 사용 중인 프로젝트명입니다." : "");
  }, [formData.name, projects, isEditMode, selectedProjectId]);

  // 프로젝트 저장 (Supabase)
  const handleSaveProject = async () => {
    if (nameError || !formData.name) return;
    const payload = {
      프로젝트명: formData.name,
      시작일: formData.start,
      종료일: formData.end,
      프로젝트설명: formData.desc,
      프로젝트색상: formData.color,
    };

    if (isEditMode && selectedProjectId) {
      await supabase.from('프로젝트').update(payload).eq('프로젝트id', selectedProjectId);
    } else {
      await supabase.from('프로젝트').insert(payload);
    }
    setIsFormOpen(false);
    fetchProjects();
  };

  // 프로젝트 삭제 (Supabase)
  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'project') {
      await supabase.from('프로젝트').delete().eq('프로젝트id', deleteTarget.id);
      fetchProjects();
    } else if (deleteTarget.type === 'member') {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        const newMembers = project.members
          .filter((m: any) => m.id !== deleteTarget.id)
          .map((m: any) => parseInt(m.id));
        await supabase.from('프로젝트').update({ 프로젝트인원: newMembers }).eq('프로젝트id', selectedProjectId);
        fetchProjects();
      }
    }
    setDeleteTarget(null);
  };

  // PM 지정
  const handleSetPM = async (memberId: string) => {
    const member = selectedProject?.members.find((m: any) => m.id === memberId);
    if (!member) return;
    await supabase.from('프로젝트').update({ 담당자명: member.name }).eq('프로젝트id', selectedProjectId);
    fetchProjects();
  };

  return (
    <>
      <PageMeta title="프로젝트 관리" description="프로젝트 관리" />
      {createPortal(<CapybaraZone />, document.body)}

      {deleteTarget && (
        <div className="fixed inset-0 z-[10000] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 mx-auto mb-4">
              <span className="text-2xl text-red-500 font-bold">!</span>
            </div>
            <h3 className="text-[20px] font-black text-gray-900 mb-2">
              {deleteTarget.type === 'project' ? '프로젝트 삭제' : '멤버 제외'}
            </h3>
            <p className="text-[14px] font-medium text-gray-500 mb-8 leading-relaxed">
              정말 <strong>{deleteTarget.name}</strong>{deleteTarget.type === 'project' ? ' 프로젝트를 삭제하시겠습니까?' : '님을 프로젝트에서 제외하시겠습니까?'}<br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 rounded-2xl text-[14px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={confirmDeleteAction} className="flex-1 py-4 rounded-2xl text-[14px] font-black text-white bg-red-500 hover:bg-red-600 shadow-md transition-all">삭제하기</button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 p-6 overflow-hidden bg-transparent">
        <div className="w-full h-full max-w-[1600px] mx-auto flex gap-8">

          {/* 왼쪽 프로젝트 목록 */}
          <aside className="w-[520px] h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white shrink-0">
              <h2 className="text-[17px] font-black text-gray-900 flex items-center gap-2"><CalendarIcon /> 프로젝트 목록</h2>
              <button type="button" onClick={() => { setIsEditMode(false); setFormData({ name: "", start: "", end: "", desc: "", color: "#91D148" }); setIsFormOpen(true); }} className="w-full mt-4 py-3.5 bg-white text-gray-500 border-2 border-gray-200 rounded-xl font-black text-[13px] flex items-center justify-center gap-2 hover:border-[#91D148] transition-all">
                <PlusIcon /> 새 프로젝트 등록
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-gray-50/20 pb-20">
              {loading ? (
                <div className="text-center text-gray-400 font-bold py-10">불러오는 중... 🐹</div>
              ) : projects.map(p => {
                const prog = calculateProgress(p.startDate, p.endDate);
                return (
                  <div key={p.id} onClick={() => setSelectedProjectId(p.id)}
                    className={`group relative p-5 rounded-[22px] cursor-pointer border-2 transition-all flex flex-col gap-3 ${selectedProjectId === p.id ? "bg-white border-[#91D148] shadow-lg scale-[1.01]" : "bg-white border-transparent shadow-sm"}`}
                    style={{ borderLeft: `8px solid ${p.color}` }}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-[16px] text-gray-900 leading-tight pr-10">
                        {p.name} <span className="text-gray-400 font-bold ml-1 text-[13px]">({p.startDate || "미정"} ~ {p.endDate || "미정"})</span>
                        {p.owner && <span className="font-black ml-2 text-[12px]" style={{ color: p.color }}>- {p.owner}</span>}
                      </h3>
                      <div className="absolute right-4 top-5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setIsEditMode(true); setFormData({ name: p.name, start: p.startDate, end: p.endDate, desc: p.description, color: p.color }); setIsFormOpen(true); }} className="p-1 text-gray-400 hover:text-gray-900"><EditIcon /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'project', id: p.id, name: p.name }); }} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] border-t border-gray-50 pt-3">
                      <p className="flex-1 text-gray-400 font-bold truncate border-r pr-4">{p.description || "설명 없음"}</p>
                      <div className="flex items-center gap-3 border-r border-gray-200 pr-4">
                        <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full transition-all" style={{ width: `${prog}%`, backgroundColor: p.color }}></div></div>
                        <span className="font-black text-gray-700">{prog}%</span>
                      </div>
                      <span className="font-black" style={{ color: prog === 100 ? '#999' : p.color }}>{prog === 100 ? '완료' : '진행 중'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* 오른쪽 상세 */}
          <main className="flex-1 h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
            {selectedProject ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-10 pb-6 shrink-0 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-[17px] font-black text-gray-900 tracking-tight">
                      {selectedProject.name} <span className="text-[15px] text-gray-300 font-bold ml-2">/ {selectedProject.owner || "담당자 미정"} PM</span>
                    </h1>
                    <button type="button" onClick={() => navigate(`/history?project=${selectedProject.id}`)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[13px] border-2 transition-all active:scale-95 shadow-sm" style={{ color: selectedProject.color, borderColor: selectedProject.color, backgroundColor: getBgColor(selectedProject.color) }}>
                      <HistoryIcon /> 회의 히스토리
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 bg-gray-50 w-fit px-4 py-1.5 rounded-full border border-gray-100">
                    <CalendarIcon /> {selectedProject.startDate || "미설정"} ~ {selectedProject.endDate || "미설정"}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-10 pb-32">
                  <div className="max-w-5xl mx-auto space-y-12">
                    <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 mt-4">
                      <DynamicMiniCalendar project={selectedProject} />
                        <div className="flex flex-col">
                         <h4 className="text-[15px] font-black text-gray-800 flex items-center gap-2 mb-3 px-1 shrink-0"><PlusIcon /> 예정된 회의 일정</h4>
                         <div className="overflow-y-auto no-scrollbar space-y-4 max-h-[380px] pr-1">
                             {selectedProject.meetings && selectedProject.meetings.length > 0 ? (                          selectedProject.meetings.map((meeting: any) => (
                            <div key={meeting.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                              <p className="text-[11px] font-black text-gray-400 mb-1 flex justify-between">
                                <span>{meeting.date}</span>
                                <span style={{ color: selectedProject.color }}>{meeting.time}</span>
                              </p>
                              <h5 className="text-[14px] font-bold text-gray-800 mb-2 leading-tight">{meeting.title}</h5>
                              <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold">
                                <span className="flex items-center gap-1"><MapPinIcon /> {meeting.room}</span>
                                <span className="flex items-center gap-1"><UsersIcon /> {meeting.attendees}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-[13px] font-bold text-gray-400 text-center mb-4">예정된 회의 일정이 없습니다.<br />새로운 회의를 예약해 보세요!</p>
                            <button type="button" onClick={() => navigate('/meeting-register')} className="px-6 py-3 text-white font-black text-[13px] rounded-xl shadow-lg transition-all active:scale-95" style={{ backgroundColor: selectedProject.color }}>회의 예약하러 가기</button>
                              </div>
                        )}
                      </div>
                      </div>
                    </section>

                    <section className="space-y-8 pt-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="text-[20px] font-black text-gray-900 flex items-center gap-2.5"><UsersIcon /> 프로젝트 멤버 ({selectedProject.members.length})</h3>
                        <button type="button" onClick={() => { setModalKey(prev => prev + 1); setIsMemberModalOpen(true); }} className="px-5 py-2.5 rounded-xl font-black text-[12px] text-white transition-all shadow-md active:scale-95" style={{ backgroundColor: selectedProject.color }}>+ 멤버 추가하기</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {selectedProject.members.map((m: any) => (
                          <div key={m.id} className={`p-6 bg-white border-2 rounded-[28px] shadow-sm transition-all relative group overflow-hidden ${m.isPM ? 'border-[#91D148]' : 'border-gray-100'}`}>
                            {m.isPM && <div className="absolute top-0 left-0 bg-[#91D148] text-white px-3 py-1 rounded-br-xl flex items-center gap-1 text-[11px] font-black shadow-sm"><CrownIcon /> PM</div>}
                            <button type="button" onClick={() => setDeleteTarget({ type: 'member', id: m.id, name: m.name })} className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><XIcon /></button>
                            <div className="flex items-center gap-4 mb-6 mt-2">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-inner ${m.isPM ? 'bg-[#91D148] text-white' : 'bg-gray-100 text-gray-400'}`}>{m.name[0]}</div>
                              <div>
                                <p className="text-[16px] font-black text-gray-900">{m.name}</p>
                                <p className="text-[12px] text-gray-400 font-bold">{m.department}</p>
                              </div>
                            </div>
                            {!m.isPM && <button type="button" onClick={() => handleSetPM(m.id)} className="w-full py-3 bg-gray-50 text-gray-500 text-[12px] font-black rounded-xl border border-gray-100 hover:bg-gray-900 hover:text-white transition-all">PM으로 지정</button>}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 font-black">
                {loading ? '불러오는 중... 🐹' : '프로젝트를 선택해 주세요.'}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 프로젝트 등록/수정 모달 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl relative">
            <button type="button" onClick={() => setIsFormOpen(false)} className="absolute right-8 top-8 text-gray-400 hover:text-gray-900"><XIcon /></button>
            <h2 className="text-2xl font-black text-gray-900 mb-8">{isEditMode ? '프로젝트 수정' : '새 프로젝트 등록'}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">프로젝트명 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-xl px-5 outline-none font-bold focus:bg-white transition-all focus:border-gray-100" />
                {nameError && <p className="mt-2 text-[12px] text-red-500 font-black">⚠ {nameError}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-3">대표 컬러</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(c => (<button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })} className={`w-8 h-8 rounded-full transition-all ${formData.color === c ? 'ring-4 ring-offset-2 ring-gray-300' : ''}`} style={{ backgroundColor: c }} />))}
                  <div className="relative w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="absolute inset-0 w-12 h-12 -m-2 cursor-pointer opacity-0" />
                    <span className="text-gray-400 font-bold">+</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">시작일</label>
                  <div className="[&>div]:!w-full [&>div>div:first-child]:h-14 [&>div>div:first-child]:bg-gray-50 [&>div>div:first-child]:border-transparent">
                    <DatePicker value={formData.start} onChange={(val) => setFormData({ ...formData, start: val })} placeholder="시작일 선택" />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">종료일</label>
                  <div className="[&>div]:!w-full [&>div>div:first-child]:h-14 [&>div>div:first-child]:bg-gray-50">
                    <DatePicker value={formData.end} onChange={(val) => setFormData({ ...formData, end: val })} placeholder="종료일 선택" isInvalid={!!(formData.start && formData.end && formData.end < formData.start)} alignRight={true} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">상세 설명</label>
                <textarea rows={2} value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent rounded-xl p-5 font-bold resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-10">
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl">취소</button>
              <button type="button" onClick={handleSaveProject} disabled={!!nameError || !formData.name} className={`flex-1 py-4 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 ${!!nameError || !formData.name ? 'bg-gray-300' : ''}`} style={{ backgroundColor: (nameError || !formData.name) ? undefined : formData.color }}>저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 추가 모달 */}
      <MemberAddModal
        key={modalKey}
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onAdd={async (nm: any) => {
          const project = projects.find(p => p.id === selectedProjectId);
          if (!project) return;
          const existingIds = project.members.map((m: any) => parseInt(m.id));
          const newIds = nm.filter((m: any) => !existingIds.includes(parseInt(m.id))).map((m: any) => parseInt(m.id));
          const updatedIds = [...existingIds, ...newIds];
          await supabase.from('프로젝트').update({ 프로젝트인원: updatedIds }).eq('프로젝트id', selectedProjectId);
          fetchProjects();
        }}
      />
    </>
  );
}