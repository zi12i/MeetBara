import React, { useState, useEffect } from "react";

interface SpeakerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSpeaker: string;
  meetingMembers: string[]; 
  onSave?: (newName: string) => void;
  mode?: 'bulk' | 'single'; // ★ 신규: 일괄 변경인지 개별 변경인지 구분
}

const SpeakerEditModal: React.FC<SpeakerEditModalProps> = ({ 
  isOpen, 
  onClose, 
  currentSpeaker, 
  meetingMembers, 
  onSave, 
  mode = 'bulk' // 기본값은 일괄 변경
}) => {
  const [name, setName] = useState(currentSpeaker);

  useEffect(() => {
    if (isOpen) setName(currentSpeaker);
  }, [isOpen, currentSpeaker]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSave && name) onSave(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white p-8 rounded-[24px] shadow-2xl w-[380px] animate-fade-in text-center border border-gray-100">
        
        {/* ★ mode에 따라 제목과 설명이 다르게 보입니다! */}
        <h2 className="text-[18px] font-black text-gray-900 mb-2">
          {mode === 'bulk' ? "발화자 일괄 매핑" : "해당 문장 발화자 변경"}
        </h2>
        <p className="text-[13px] font-bold text-gray-500 mb-6">
          {mode === 'bulk' 
            ? "스크립트 전체에서 해당 발화자의 이름이 변경됩니다." 
            : "선택하신 문장의 발화자만 개별적으로 변경됩니다."}
        </p>
        
        <div className="relative mb-8 text-left">
          <select 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full bg-gray-50 border-2 border-[#91D148]/30 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-[#91D148] focus:bg-white transition-all appearance-none cursor-pointer"
          >
            {!meetingMembers.includes(currentSpeaker) && (
              <option value={currentSpeaker} disabled hidden>
                {currentSpeaker} (매핑할 참석자 선택)
              </option>
            )}
            
            {meetingMembers.map((member, idx) => (
              <option key={idx} value={member}>
                {member}
              </option>
            ))}
          </select>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#91D148]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3.5 bg-[#F1F3F5] text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleSave} 
            className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] shadow-md transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeakerEditModal;