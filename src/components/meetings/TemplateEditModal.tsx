import React, { useState, useEffect } from "react";

interface TemplateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  onSave: (newContent: string) => void;
}

const TemplateEditModal: React.FC<TemplateEditModalProps> = ({ isOpen, onClose, initialContent, onSave }) => {
  const [content, setContent] = useState(initialContent);

  // 모달이 열릴 때마다 초기 내용을 세팅합니다.
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 배경 딤드 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose}></div>
      
      {/* 모달 본체 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col animate-fade-in-up overflow-hidden border border-gray-200">
        
        {/* 상단 툴바 (설계서의 연두색 바) */}
        <div className="bg-[#E2F1D1] px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 text-[#4d7222]">
            {/* 좌우 화살표 */}
            <div className="flex items-center gap-3">
              <button className="hover:text-black transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg></button>
              <button className="hover:text-black transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg></button>
            </div>
            
            <div className="w-[2px] h-5 bg-[#C8E6A5]"></div>
            
            {/* 텍스트 포맷팅 아이콘 */}
            <div className="flex items-center gap-5">
              <button className="font-black text-[17px] hover:text-black transition-colors">B</button>
              <button className="font-serif italic text-[17px] font-bold hover:text-black transition-colors">I</button>
              <button className="hover:text-black transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><circle cx="3" cy="6" r="1.5"></circle><circle cx="3" cy="12" r="1.5"></circle><circle cx="3" cy="18" r="1.5"></circle></svg></button>
              <button className="hover:text-black transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M4 18h1v-4"></path></svg></button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-600 font-bold hover:text-gray-900 px-3 py-1.5 text-sm">
              취소
            </button>
            <button 
              onClick={() => { onSave(content); onClose(); }} 
              className="bg-white border border-gray-300 text-gray-800 font-bold px-5 py-1.5 rounded shadow-sm hover:bg-gray-50 text-sm"
            >
              수정
            </button>
          </div>
        </div>

        {/* 편집 영역 (Textarea) */}
        <div className="flex-1 p-8 bg-white">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full resize-none outline-none text-[15px] leading-relaxed text-gray-800 font-medium no-scrollbar bg-transparent"
            placeholder="회의 내용을 요약해 보세요..."
            spellCheck={false}
          />
        </div>
        
      </div>
    </div>
  );
};

export default TemplateEditModal;