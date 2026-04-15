import React, { useState } from "react";

interface Member {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
}

interface MemberAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selectedMembers: Member[]) => void;
}

const MemberAddModal: React.FC<MemberAddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // 임시 조직 데이터
  const members: Member[] = [
    { id: "qwer1234@naver.com", name: "홍길동", department: "디자인팀", position: "팀장", email: "qwer1234@naver.com" },
    { id: "sowlqdmstjdnf@cau.ac.kr", name: "한석봉", department: "디자인팀", position: "팀원", email: "sowlqdmstjdnf@cau.ac.kr" },
    { id: "chun7@gmail.com", name: "김춘향", department: "디자인팀", position: "팀원", email: "chun7@gmail.com" },
    { id: "zzangbogo@naver.com", name: "장보고", department: "디자인팀", position: "팀원", email: "zzangbogo@naver.com" },
    { id: "nolbubossam@gmail.com", name: "정놀부", department: "디자인팀", position: "팀원", email: "nolbubossam@gmail.com" },
  ];

  const toggleSelect = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const handleAdd = () => {
    const selectedList = members.filter(m => selectedIds.has(m.id));
    onAdd(selectedList);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-zoom-in">
        
        {/* 헤더 영역 */}
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">조직 리스트</h2>
            {/* 5. 닫기 버튼 */}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="flex gap-6 border-b border-gray-100">
            <button className="pb-3 text-lg font-bold text-gray-900 border-b-4 border-[#91D148]">구성원</button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* 1. 검색바 */}
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="이름을 입력해 주세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl pl-12 pr-4 focus:bg-white focus:border-[#91D148] outline-none transition-all"
            />
          </div>

          {/* 2. 조직원 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-500 font-bold text-sm uppercase tracking-wider">
                  <th className="px-4 py-3 rounded-l-xl text-center"><input type="checkbox" className="accent-[#91D148] w-4 h-4 cursor-pointer" /></th>
                  <th className="px-4 py-3 text-center">이름</th>
                  <th className="px-4 py-3 text-center">부서</th>
                  <th className="px-4 py-3 text-center">직급</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F4F9ED]/50 transition-colors cursor-pointer" onClick={() => toggleSelect(member.id)}>
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(member.id)}
                        onChange={() => {}} // 행 클릭으로 제어
                        className="accent-[#91D148] w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-800">{member.name}</td>
                    <td className="px-4 py-4 text-center text-gray-600">{member.department}</td>
                    <td className="px-4 py-4 text-center text-gray-600">{member.position}</td>
                    <td className="px-4 py-4 text-center text-gray-400 text-sm">{member.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 하단 유틸리티 영역 */}
          <div className="flex items-center justify-between pt-4">
            {/* 3. 페이징 */}
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(num => (
                <button key={num} className={`text-sm font-bold ${num === 1 ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-300 hover:text-gray-500"}`}>
                  {num}
                </button>
              ))}
            </div>

            {/* 4. 추가하기 버튼 */}
            <button 
              onClick={handleAdd}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              추가하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberAddModal;