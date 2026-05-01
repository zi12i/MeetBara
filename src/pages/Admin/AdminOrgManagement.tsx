import React, { useState, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { createPortal } from "react-dom";
import CapybaraZone from "../../components/common/CapybaraZone";
import Toast from "../../components/common/Toast";

// --- SVG Icons ---
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const PAGE_SIZE = 5;

// --- 공통 시스템 메뉴 (권한 관리용) ---
const SYSTEM_MENUS = [
  { id: "meeting", name: "회의 관리" },
  { id: "project", name: "프로젝트 관리" },
  { id: "org", name: "조직 관리" },
  { id: "report", name: "리포트 조회" },
];

// --- 더미 데이터 (부서 팀장 지정을 위한 멤버 풀) ---
const DUMMY_MEMBERS = [
  { id: 101, name: "김바라", deptId: 1 },
  { id: 102, name: "이지민", deptId: 1 },
  { id: 103, name: "박철수", deptId: 2 },
  { id: 104, name: "이영희", deptId: 3 },
];

export default function AdminOrgManagement() {
  const [activeTab, setActiveTab] = useState<"dept" | "rank" | "role">("dept");
  const [currentPage, setCurrentPage] = useState(1);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // --- 데이터 상태 (실제 서비스 연동 시 이 부분을 API로 교체) ---
  const [departments, setDepartments] = useState([
    { id: 1, name: "서비스 기획팀", userCount: 4, leaderId: 101 },
    { id: 2, name: "플랫폼 개발팀", userCount: 8, leaderId: null },
    { id: 3, name: "브랜드 디자인팀", userCount: 3, leaderId: null },
    { id: 4, name: "CX 운영팀", userCount: 5, leaderId: null },
    { id: 5, name: "전략 본부", userCount: 2, leaderId: null },
    { id: 6, name: "인사팀", userCount: 2, leaderId: null },
  ]);

  const [ranks, setRanks] = useState([
    { id: 1, name: "부장", description: "부서의 최종 의사 결정 및 총괄 관리" },
    { id: 2, name: "차장", description: "팀 단위 프로젝트 리딩 및 중간 관리" },
    { id: 3, name: "과장", description: "주요 실무 담당 및 주니어 가이드" },
    { id: 4, name: "대리", description: "실무 프로젝트 핵심 수행" },
    { id: 5, name: "사원", description: "기초 실무 지원 및 업무 학습" },
  ]);

  const [roles, setRoles] = useState([
    { id: 1, name: "Master", description: "전체 시스템 제어 및 결제 관리자", permissions: { meeting: "CRUD", project: "CRUD", org: "CRUD", report: "CRUD" } },
    { id: 2, name: "Admin", description: "부서 및 사용자 관리 담당자", permissions: { meeting: "RU", project: "R", org: "CRUD", report: "R" } },
    { id: 3, name: "Member", description: "일반 구성원 및 회의 참가자", permissions: { meeting: "CRU", project: "R", org: "R", report: "" } },
  ]);

  // --- 모달 통합 상태 관리 ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [targetItem, setTargetItem] = useState<any>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLeader, setFormLeader] = useState<number | null>(null);
  const [formPerms, setFormPerms] = useState<any>({}); 

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const handleOpenModal = (mode: "add" | "edit", item?: any) => {
    setModalMode(mode);
    setTargetItem(item || null);
    setFormName(item?.name || "");
    setFormDesc(item?.description || "");
    setFormLeader(item?.leaderId || null);
    setFormPerms(item?.permissions || { meeting: "R", project: "R", org: "R", report: "R" });
    setIsModalOpen(true);
  };

  // ★ 권한 논리 로직 점검 (R 종속성)
  const togglePermission = (menuId: string, action: string) => {
    let current = formPerms[menuId] || "";
    let next = "";

    if (action === "R") {
      next = current.includes("R") ? "" : "R";
    } else {
      if (current.includes(action)) {
        next = current.replace(action, "");
      } else {
        next = current.includes("R") ? current + action : "R" + action;
      }
    }
    const sortedNext = next.split('').sort().join('');
    setFormPerms({ ...formPerms, [menuId]: sortedNext });
  };

  const handleSave = () => {
    if (!formName.trim()) return showToast("명칭을 입력해주세요.");
    const baseItem = { id: targetItem?.id || Date.now(), name: formName };

    if (activeTab === "dept") {
      const newItem = { ...baseItem, userCount: targetItem?.userCount || 0, leaderId: formLeader };
      setDepartments(modalMode === "add" ? [...departments, newItem] : departments.map(d => d.id === targetItem.id ? newItem : d));
    } else if (activeTab === "rank") {
      const newItem = { ...baseItem, description: formDesc };
      setRanks(modalMode === "add" ? [...ranks, newItem] : ranks.map(r => r.id === targetItem.id ? newItem : r));
    } else {
      const newItem = { ...baseItem, description: formDesc, permissions: formPerms };
      setRoles(modalMode === "add" ? [...roles, newItem] : roles.map(r => r.id === targetItem.id ? newItem : r));
    }
    setIsModalOpen(false);
    showToast(`${modalMode === "add" ? "추가" : "수정"} 처리가 완료되었습니다! 🐹✨`);
  };

  // --- 페이지네이션 로직 점검 ---
  const currentList = activeTab === "dept" ? departments : activeTab === "rank" ? ranks : roles;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  const pagedData = currentList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <PageMeta title="Admin - 조직 관리" description="부서, 직급, 권한 체계 통합 관리" />
      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      {createPortal(<CapybaraZone />, document.body)}

      {/* --- 통합 관리 모달 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`bg-white rounded-[32px] p-10 shadow-2xl animate-zoom-in ${activeTab === 'role' ? 'w-[680px]' : 'w-[480px]'}`}>
            <h2 className="text-[22px] font-black text-gray-900 mb-6">{activeTab === "dept" ? "부서" : activeTab === "rank" ? "직급" : "권한"} 설정</h2>
            
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-[13px] font-bold text-gray-500 mb-2">명칭 <span className="text-red-400">*</span></label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-bold focus:border-[#91D148] outline-none transition-all" placeholder="명칭을 입력하세요" />
              </div>

              {activeTab === "dept" && (
                <div>
                  <label className="block text-[13px] font-bold text-gray-500 mb-2">부서 팀장 지정</label>
                  <select value={formLeader || ""} onChange={(e) => setFormLeader(Number(e.target.value) || null)} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-bold bg-white focus:border-[#91D148] outline-none">
                    <option value="">팀장 없음</option>
                    {DUMMY_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}

              {(activeTab === "rank" || activeTab === "role") && (
                <div>
                  <label className="block text-[13px] font-bold text-gray-500 mb-2">상세 설명</label>
                  <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-bold focus:border-[#91D148] outline-none resize-none" placeholder="역할이나 권한군에 대한 설명을 입력하세요." />
                </div>
              )}

              {activeTab === "role" && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[14px] font-black text-gray-900">메뉴별 CRUD 설정</label>
                    <span className="text-[11px] text-[#91D148] font-bold">* C, U, D 권한 선택 시 READ는 자동 부여됩니다.</span>
                  </div>
                  <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30 shadow-inner">
                    <div className="grid grid-cols-[1fr_repeat(4,60px)] bg-gray-50/80 py-3 px-6 font-bold text-gray-400 text-[11px] border-b border-gray-100 text-center uppercase tracking-tighter">
                      <div className="text-left">Menu Name</div><div>Create</div><div>Read</div><div>Update</div><div>Delete</div>
                    </div>
                    {SYSTEM_MENUS.map(menu => {
                      const perms = formPerms[menu.id] || "";
                      return (
                        <div key={menu.id} className="grid grid-cols-[1fr_repeat(4,60px)] py-4 px-6 border-b border-gray-50 last:border-0 items-center text-center">
                          <div className="text-left font-black text-[13px] text-gray-700">{menu.name}</div>
                          {["C", "R", "U", "D"].map(act => (
                            <div 
                              key={act} 
                              onClick={() => togglePermission(menu.id, act)} 
                              className={`cursor-pointer w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-[12px] font-black transition-all ${perms.includes(act) ? 'bg-[#91D148] text-white shadow-md' : 'bg-white border border-gray-100 text-gray-300 hover:text-[#91D148]'}`}
                            >
                              {act}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-[#91D148] text-white font-black rounded-2xl shadow-lg hover:bg-[#82bd41] transition-all">설정 저장</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 메인 화면 레이아웃 --- */}
      <div className="absolute inset-0 p-6 bg-[#F8F9FA] flex justify-center overflow-hidden">
        <div className="w-full h-full max-w-[1600px] flex flex-col gap-6">
          
          <div className="flex items-center justify-between bg-white px-6 py-2 rounded-xl shadow-sm border border-gray-200 shrink-0">
            <div className="flex gap-8">
              {[
                {id:"dept", n:"부서 관리"}, {id:"rank", n:"직급 관리"}, {id:"role", n:"권한 관리"}
              ].map(t => (
                <button key={t.id} onClick={() => { setActiveTab(t.id as any); setCurrentPage(1); }} className={`py-2 text-[14px] font-black relative transition-all ${activeTab === t.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                  {t.n}{activeTab === t.id && <div className="absolute bottom-[-8px] left-0 w-full h-[3px] bg-[#91D148] rounded-full"></div>}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-black text-[#91D148] bg-[#F3FAEB] px-3 py-1 rounded-full uppercase">Admin Panel</div>
          </div>

          <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-10 pt-10 pb-6 flex justify-between items-end shrink-0">
              <div>
                <h3 className="text-[26px] font-black text-gray-900">{activeTab === "dept" ? "조직 부서" : activeTab === "rank" ? "직급 체계" : "서비스 권한군"} 목록</h3>
                <p className="text-[14px] text-gray-400 font-bold mt-1">항목별 상세 설정 및 CRUD 권한을 독립적으로 관리할 수 있습니다.</p>
              </div>
              <button onClick={() => handleOpenModal("add")} className="flex items-center gap-2 bg-[#91D148] text-white px-7 py-3.5 rounded-2xl font-black text-[14px] shadow-xl hover:bg-[#82bd41] transition-all">
                <PlusIcon /> 항목 추가하기
              </button>
            </div>

            {/* ★ 그리드 통일성 및 4컬럼 점검 ★ */}
            <div className="flex-1 px-10 pb-4 overflow-hidden">
              <div className="w-full h-full border border-gray-200 rounded-[28px] overflow-hidden flex flex-col bg-white shadow-sm">
                <table className="w-full text-[13px] border-collapse">
                  <thead className="bg-[#F4F9ED] sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      <th className="px-10 py-5 text-left font-bold text-gray-600 w-[180px]">명칭</th>
                      <th className="px-10 py-5 text-center font-bold text-gray-600">상세 정보 (설명)</th>
                      {activeTab === "role" && <th className="px-10 py-5 text-center font-bold text-gray-600 w-[280px]">권한 정보 (Matrix)</th>}
                      <th className="px-10 py-5 text-center font-bold text-gray-600 w-[160px]">관리</th>
                    </tr>
                  </thead>
                  <tbody className="overflow-y-auto">
                    {pagedData.map((item: any, idx) => (
                      <tr key={item.id} className={`border-b border-gray-50 hover:bg-[#F4F9ED]/40 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-800 text-[16px]">{item.name}</span>
                            {activeTab === "dept" && item.leaderId && <span className="text-[11px] text-[#91D148] font-bold mt-0.5">👑 팀장: {DUMMY_MEMBERS.find(m=>m.id===item.leaderId)?.name}</span>}
                          </div>
                        </td>
                        <td className="px-10 py-6 text-center text-gray-500 font-bold leading-relaxed">
                          {activeTab === "dept" ? `${item.userCount}명 구성원 재직 중` : item.description || "-"}
                        </td>
                        {activeTab === "role" && (
                          <td className="px-10 py-6 text-center">
                            <div className="flex flex-wrap justify-center gap-1.5">
                              {Object.entries(item.permissions).map(([k, v]: any) => (
                                <span key={k} className="inline-block px-2.5 py-1 bg-gray-800 text-white text-[10px] font-black rounded-lg uppercase shadow-sm">
                                  {k[0]}:{v || "-"}
                                </span>
                              ))}
                            </div>
                          </td>
                        )}
                        <td className="px-10 py-6 text-center">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => handleOpenModal("edit", item)} className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-[#91D148] hover:border-[#91D148] hover:bg-white transition-all shadow-sm"><EditIcon /></button>
                            <button onClick={() => confirm("정말 삭제하시겠습니까?") && showToast("정상적으로 삭제되었습니다.")} className="p-3 rounded-xl border border-gray-200 text-gray-300 hover:text-red-500 transition-all shadow-sm"><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pagedData.length === 0 && <tr><td colSpan={activeTab === 'role' ? 4 : 3} className="py-20 text-center text-gray-300 font-bold">등록된 데이터가 없습니다.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- 페이지네이션 (히스토리 스타일) --- */}
            <div className="px-10 pb-10 pt-2 flex justify-center gap-2 shrink-0">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 border border-gray-200 rounded-xl text-gray-400 hover:bg-[#F4F9ED] disabled:opacity-30 transition-all">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`w-10 h-10 rounded-xl text-[14px] font-black border transition-all ${currentPage === p ? "bg-[#91D148] text-white border-[#91D148] shadow-md" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{p}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 border border-gray-200 rounded-xl text-gray-400 hover:bg-[#F4F9ED] disabled:opacity-30 transition-all">›</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}