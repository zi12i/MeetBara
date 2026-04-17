import React, { useState, useEffect } from "react";

export interface CorrectionItem {
  id: string;
  original: string;
  suggested: string;
  isApplied: boolean;
  isCustom: boolean;
  excludedScriptIds: number[]; 
}

interface ScriptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (corrections: CorrectionItem[]) => void;
  onSingleApply: (correction: CorrectionItem) => void;
  originalScripts: { id: number; speaker: string; time: string; text: string }[];
  initialCorrections: CorrectionItem[];
}

const ScriptEditModal: React.FC<ScriptEditModalProps> = ({ isOpen, onClose, onApply, onSingleApply, originalScripts, initialCorrections }) => {
  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);
  const [selectedWordForView, setSelectedWordForView] = useState<string | null>(null);
  const [confirmingItem, setConfirmingItem] = useState<CorrectionItem | null>(null);
  const [isConfirmingBulk, setIsConfirmingBulk] = useState(false);

  // ★ 오디오 플레이어 동기화용 상태
  const [activeScriptId, setActiveScriptId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // 초 단위
  const TOTAL_DURATION = 3600; // 60분

  useEffect(() => {
    if (isOpen) {
      setCorrections(initialCorrections);
      setSelectedWordForView(null);
      setConfirmingItem(null);
      setIsConfirmingBulk(false);
      
      // 모달 열 때 오디오 상태 초기화
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveScriptId(null);
    }
  }, [isOpen, initialCorrections]);

  // ★ 오디오 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < TOTAL_DURATION) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  if (!isOpen) return null;

  const detectedCount = corrections.length;
  const appliedCount = corrections.filter(c => c.isApplied).length;
  const isAllApplied = corrections.length > 0 && corrections.every(c => c.isApplied);

  const toggleAll = () => {
    const nextState = !isAllApplied;
    setCorrections(prev => prev.map(c => ({ ...c, isApplied: nextState })));
  };

  const toggleItem = (id: string) => {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, isApplied: !c.isApplied } : c));
  };

  const toggleExcludeScript = (correctionId: string, scriptId: number) => {
    setCorrections(prev => prev.map(c => {
      if (c.id === correctionId) {
        const isCurrentlyExcluded = c.excludedScriptIds.includes(scriptId);
        const newExcluded = isCurrentlyExcluded 
          ? c.excludedScriptIds.filter(id => id !== scriptId) 
          : [...c.excludedScriptIds, scriptId];
        return { ...c, excludedScriptIds: newExcluded };
      }
      return c;
    }));
  };

  const handleAddCustomWord = () => {
    setCorrections(prev => [...prev, { id: Date.now().toString(), original: "", suggested: "", isApplied: true, isCustom: true, excludedScriptIds: [] }]);
  };

  const updateCustomWord = (id: string, field: "original" | "suggested", value: string) => {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteCustomWord = (id: string) => {
    setCorrections(prev => prev.filter(c => c.id !== id));
  };

  const getWordCount = (word: string) => {
    if (!word.trim()) return 0;
    let count = 0;
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g");
    originalScripts.forEach(script => {
      const matches = script.text.match(regex);
      if (matches) count += matches.length;
    });
    return count;
  };

  const executeSingleEdit = () => {
    if (!confirmingItem) return;
    onSingleApply(confirmingItem);
    setConfirmingItem(null);
    setSelectedWordForView(null);
  };

  const executeBulkEdit = () => {
    onApply(corrections);
    setIsConfirmingBulk(false);
    onClose();
  };

  // ★ 오디오 컨트롤 함수
  const parseTimeToSeconds = (timeStr: string) => {
    const [min, sec] = timeStr.split(":").map(Number);
    return min * 60 + sec;
  };

  const formatTime = (totalSec: number) => {
    const min = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const sec = (totalSec % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handlePlayScript = (id: number, timeStr: string) => {
    setActiveScriptId(id);
    setCurrentTime(parseTimeToSeconds(timeStr));
    setIsPlaying(true);
  };

  const renderHighlightedText = (text: string, scriptId: number) => {
    let targetWords = selectedWordForView ? [selectedWordForView] : corrections.filter(c => c.original.trim() !== "").map(c => c.original);

    if (targetWords.length === 0) return <span>{text}</span>;

    const regex = new RegExp(`(${targetWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "g");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isTarget = targetWords.includes(part);
      if (isTarget) {
        const matchedCorrection = corrections.find(c => c.original === part);
        const isExcluded = matchedCorrection?.excludedScriptIds.includes(scriptId);

        if (selectedWordForView) {
           return <span key={index} className={`font-black px-1 rounded-sm transition-all ${isExcluded ? 'bg-gray-200 text-gray-500 line-through' : 'bg-yellow-200 text-yellow-900'}`}>{part}</span>;
        }
        
        return (
          <span key={index} className={`font-black px-1 rounded-sm transition-colors ${matchedCorrection?.isApplied && !isExcluded ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-[1100px] h-[750px] flex flex-col animate-fade-in-up overflow-hidden border border-gray-200">
        
        <div className="bg-[#F4F9ED] px-8 py-5 flex items-center justify-between shrink-0 border-b border-[#91D148]/20">
          <div className="flex items-center gap-3">
            <span className="text-[26px]">✨</span>
            <div>
              <h2 className="text-[20px] font-black text-gray-900 mb-1">스크립트 개선하기</h2>
              <p className="text-[13px] font-bold text-[#628a31]">바라가 문맥상 어색한 단어 <strong className="text-red-500">{detectedCount}개</strong>를 발견하여 수정을 제안합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* === 좌측 영역 === */}
          <div className="flex-[5] flex flex-col border-r border-gray-200 bg-white">
            <div className="px-6 py-4 flex items-center justify-between shrink-0 bg-gray-50/80 border-b border-gray-100">
              <button onClick={handleAddCustomWord} className="flex items-center gap-2 text-[13px] font-bold text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-full hover:border-[#91D148] hover:text-[#628a31] transition-all shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> 단어 수동 추가
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-500 mr-1">일괄 적용 ({appliedCount}/{detectedCount})</span>
                <input type="checkbox" checked={isAllApplied} onChange={toggleAll} className="w-4 h-4 accent-[#91D148] cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FA]">
              {corrections.map((item) => {
                const wordCount = getWordCount(item.original);
                return (
                  <div key={item.id} className={`flex flex-col p-4 rounded-xl border transition-all shadow-sm ${item.isApplied ? 'border-[#91D148]/50 bg-white' : 'border-gray-200 bg-gray-100 opacity-70'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={item.isApplied} onChange={() => toggleItem(item.id)} className="w-4 h-4 accent-[#91D148] cursor-pointer mr-1" />
                        <span className={`text-[12px] font-black px-2 py-0.5 rounded ${item.isApplied ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>의심 단어</span>
                        {item.original && <span className="text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">{wordCount}개 발견</span>}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedWordForView(item.original)} className="px-3 py-1.5 text-[12px] font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">
                          원문보기
                        </button>
                        <button onClick={() => setConfirmingItem(item)} className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#91D148] hover:bg-[#82bd41] rounded-lg shadow-sm transition-colors">
                          수 정
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pl-6">
                      <div className="flex-1">
                        {item.isCustom ? (
                          <input type="text" value={item.original} onChange={(e) => updateCustomWord(item.id, "original", e.target.value)} placeholder="수정 전" className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-[14px] font-bold focus:border-red-300 focus:bg-white outline-none" />
                        ) : (
                          <div className={`text-[16px] font-black truncate ${item.isApplied ? 'text-gray-900 line-through decoration-red-300 decoration-2' : 'text-gray-500'}`}>{item.original}</div>
                        )}
                      </div>
                      <div className="text-gray-300 shrink-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></div>
                      <div className="flex-1">
                        {item.isCustom ? (
                          <input type="text" value={item.suggested} onChange={(e) => updateCustomWord(item.id, "suggested", e.target.value)} placeholder="바꿀 텍스트" className="w-full bg-gray-50 border border-[#91D148]/30 px-3 py-2 rounded-lg text-[14px] font-bold text-[#628a31] focus:border-[#91D148] focus:bg-white outline-none" />
                        ) : (
                          <div className={`text-[16px] font-black truncate ${item.isApplied ? 'text-[#628a31]' : 'text-gray-500'}`}>{item.suggested}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {corrections.length === 0 && <div className="text-center py-20 text-gray-400 font-bold">남은 교정 항목이 없습니다.</div>}
            </div>
          </div>

          {/* === 우측: 스크립트 뷰어 패널 === */}
          <div className="flex-[4.5] flex flex-col bg-white">
            
            <div className="px-6 py-4 bg-white border-b border-gray-100 shrink-0 flex flex-col gap-3">
              {/* 원문보기 모드 여부에 따른 헤더 전환 */}
              {selectedWordForView ? (
                <div className="bg-gray-900 px-4 py-2.5 rounded-lg flex items-center justify-between">
                  <button onClick={() => setSelectedWordForView(null)} className="text-white hover:text-[#91D148] font-bold text-[13px] transition-colors flex items-center gap-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> 전체 원문 보기
                  </button>
                  <span className="text-[12px] font-bold text-gray-300">[{selectedWordForView}] 필터링 중</span>
                </div>
              ) : (
                <h3 className="text-[15px] font-black text-gray-800">전사 원문 (STT)</h3>
              )}

              {/* ★ 오디오 플레이어 (항상 표시, 모달 버그 픽스 반영) */}
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm mt-1">
                <button onClick={() => setIsPlaying(true)} className={`transition-colors ${isPlaying ? 'text-[#4d7222]' : 'text-[#628a31] hover:text-[#4d7222]'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isPlaying ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isPlaying ? "1" : "2"}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
                <button onClick={() => setIsPlaying(false)} className={`transition-colors ${!isPlaying ? 'text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={!isPlaying ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>
                
                <div className="flex-1 h-1.5 bg-gray-300 rounded-full relative cursor-pointer">
                  <div className="absolute top-0 left-0 h-full bg-[#91D148] rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}></div>
                  {/* overflow-hidden 삭제 및 z-10 적용하여 동그라미 잘림 해결 */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#628a31] rounded-full shadow transition-all duration-1000 ease-linear z-10" style={{ left: `calc(${(currentTime / TOTAL_DURATION) * 100}% - 7px)` }}></div>
                </div>
                
                <span className="text-[12px] font-mono font-bold text-gray-500 w-24 text-right">
                  {formatTime(currentTime)} / 60:00
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              {originalScripts
                .filter(script => selectedWordForView ? script.text.includes(selectedWordForView) : true)
                .map(script => {
                  const activeCorrection = selectedWordForView ? corrections.find(c => c.original === selectedWordForView) : null;
                  const isExcluded = activeCorrection?.excludedScriptIds.includes(script.id);
                  // ★ 현재 스크립트 활성화 상태
                  const isActive = activeScriptId === script.id;

                  return (
                    <div key={script.id} className={`text-[14px] leading-relaxed transition-colors p-4 rounded-xl border border-gray-100 ${isActive ? 'bg-[#F4F9ED]/50 border-[#91D148]/30 shadow-sm' : 'bg-gray-50 text-gray-700'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900">{script.speaker}</span>
                          
                          {/* ★ 타임스탬프 클릭 시 재생 동기화 처리 */}
                          <button 
                            onClick={() => handlePlayScript(script.id, script.time)}
                            className={`text-[11px] font-bold flex items-center gap-1 transition-colors group focus:outline-none ${isActive ? 'text-[#91D148]' : 'text-gray-400 hover:text-[#91D148]'}`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isActive ? 'fill-current' : 'group-hover:fill-current'}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> 
                            {script.time}
                          </button>
                        </div>
                        
                        {selectedWordForView && activeCorrection && (
                          <button 
                            onClick={() => toggleExcludeScript(activeCorrection.id, script.id)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-md transition-colors border ${isExcluded ? 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200' : 'bg-[#E2F1D1] text-[#4d7222] border-[#91D148]/30 hover:bg-[#C8E6A5]'}`}
                          >
                            {isExcluded ? "❌ 이 문장은 킵(Keep)" : "✅ 이 문장에 적용"}
                          </button>
                        )}
                      </div>
                      <div className={isActive ? 'text-gray-900' : 'text-gray-600'}>
                        {renderHighlightedText(script.text, script.id)}
                      </div>
                    </div>
                  )
                })}
              {selectedWordForView && originalScripts.filter(s => s.text.includes(selectedWordForView)).length === 0 && (
                 <div className="text-center py-20 text-gray-400 font-bold">해당 단어가 포함된 원문이 없습니다.</div>
              )}
            </div>
          </div>

          {/* 확인 컨펌 모달 (개별/일괄 동일) */}
          {confirmingItem && (
            <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
              <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-fade-in text-center border border-gray-100 w-[380px]">
                <span className="text-[32px] mb-4">⚠️</span>
                <p className="text-[18px] font-black text-gray-900 mb-2">해당 단어를 수정하시겠습니까?</p>
                <p className="text-[14px] font-bold text-gray-500 mb-8 px-4 leading-relaxed">
                  '<span className="text-red-500">{confirmingItem.original}</span>' 단어가 <br/>
                  '<span className="text-[#628a31]">{confirmingItem.suggested}</span>'(으)로 변경됩니다.
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setConfirmingItem(null)} className="flex-1 py-3.5 bg-[#F1F3F5] text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">취소</button>
                  <button onClick={executeSingleEdit} className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] shadow-md transition-colors">수정 확정</button>
                </div>
              </div>
            </div>
          )}
          
          {isConfirmingBulk && (
            <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
              <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-fade-in text-center border border-gray-100 w-[400px]">
                <span className="text-[32px] mb-4">✨</span>
                <p className="text-[18px] font-black text-gray-900 mb-2">일괄 수정을 진행하시겠습니까?</p>
                <p className="text-[14px] font-bold text-gray-500 mb-8 px-4 leading-relaxed">
                  적용 체크된 <strong className="text-[#628a31]">{appliedCount}개</strong>의 단어들이<br/>스크립트 원문 전체에 일괄 변경됩니다.
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setIsConfirmingBulk(false)} className="flex-1 py-3.5 bg-[#F1F3F5] text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">취소</button>
                  <button onClick={executeBulkEdit} className="flex-1 py-3.5 bg-[#91D148] text-white font-bold rounded-xl hover:bg-[#82bd41] shadow-md transition-colors">수정 확정</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 하단 일괄 적용 버튼 구역 */}
        <div className="p-5 bg-white border-t border-gray-200 shrink-0 flex justify-end gap-3 relative z-40">
          <button onClick={onClose} className="px-8 py-3.5 rounded-xl text-[15px] font-bold text-gray-500 hover:bg-gray-100 transition-colors">닫기</button>
          
          <button 
            onClick={() => {
              if (appliedCount > 0) setIsConfirmingBulk(true);
            }} 
            className={`px-10 py-3.5 rounded-xl text-[15px] font-black transition-all shadow-[0_4px_14px_rgba(145,209,72,0.3)] ${appliedCount > 0 ? 'bg-[#91D148] text-white hover:bg-[#82bd41]' : 'bg-gray-300 text-gray-100 cursor-not-allowed shadow-none'}`}
            disabled={appliedCount === 0}
          >
            선택된 {appliedCount}개 일괄 수정
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ScriptEditModal;