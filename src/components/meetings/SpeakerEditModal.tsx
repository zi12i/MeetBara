import React, { useState, useEffect } from "react";

interface SpeakerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSpeaker: string;
}

const SpeakerEditModal: React.FC<SpeakerEditModalProps> = ({ isOpen, onClose, currentSpeaker }) => {
  const [searchTerm, setSearchTerm] = useState("");
  // 👉 선택된 사용자를 저장하는 상태 추가
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // 모달이 닫힐 때 모든 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedUser(null);
    }
  }, [isOpen]);

  const allUsers = [
    { name: "박민주", dept: "기획팀", rank: "팀장" },
    { name: "박지민", dept: "디자인팀", rank: "사원" },
    { name: "김철수", dept: "개발팀", rank: "대리" },
    { name: "이영희", dept: "인사팀", rank: "과장" },
    { name: "최유진", dept: "디자인팀", rank: "팀장" },
  ];

  const filteredUsers = allUsers.filter((user) =>
    user.name.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden animate-fade-in">
        
        {/* 헤더 영역 */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">참가자 이름 변경</h2>
            <p className="text-gray-400 text-sm mt-1">향후 회의에서 음성 인식을 위한 새 참가자로 이름을 변경합니다</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 검색창 영역 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">참가자 이름 지정</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91D148]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="이름을 입력해주세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F4F9ED] border-none rounded-2xl py-4 pl-12 pr-4 text-[15px] focus:ring-2 focus:ring-[#91D148] outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* 결과 리스트 영역 */}
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
            {searchTerm === "" ? (
              <p className="text-center py-10 text-gray-400 text-sm">참가자 이름을 검색해 주세요</p>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => {
                // 👉 현재 항목이 선택된 항목인지 확인
                const isSelected = selectedUser === user.name;
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedUser(user.name)} // 👉 클릭 시 선택 상태 고정
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                      ${isSelected 
                        ? "bg-[#F4F9ED] border-[#91D148] shadow-sm" // 선택되었을 때 스타일
                        : "bg-gray-50 border-transparent hover:border-[#91D148]/30 hover:bg-[#F4F9ED]/30"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors
                        ${isSelected ? "bg-white border-[#91D148] text-[#91D148]" : "bg-white border-gray-200 text-gray-400"}
                      `}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div>
                        <p className={`font-bold transition-colors ${isSelected ? "text-gray-900" : "text-gray-900"}`}>{user.name}</p>
                        <p className="text-xs text-gray-400">{user.dept} {">"} {user.rank}</p>
                      </div>
                    </div>
                    
                    {/* 👉 선택 시 체크 아이콘 표시 (isSelected 상태에 따라 상시 노출) */}
                    <div className={`text-[#91D148] transition-all ${isSelected ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-10 text-gray-400 text-sm">'{searchTerm}'에 대한 검색 결과가 없습니다</p>
            )}
          </div>

          <button 
            onClick={onClose} 
            disabled={!selectedUser} // 👉 아무도 선택하지 않으면 버튼 비활성화 (선택 사항)
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all mt-4 active:scale-[0.98]
              ${selectedUser 
                ? "bg-[#91D148] text-white shadow-[#91D148]/20 hover:bg-[#82bd41]" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}
            `}
          >
            변경하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeakerEditModal;