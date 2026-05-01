import React, { useState, useEffect, useRef } from "react";

// 🌈 8단계 무지개 스펙트럼 컬러
const COLORS = ["#FF5A5A", "#FF914D", "#FFD23F", "#91D148", "#48D1CC", "#4A90D9", "#9B59B6", "#E84A94"];

export default function RealRoulette() {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [gameMode, setGameMode] = useState<"setup" | "play">("setup");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 룰렛 그리기
  const drawRoulette = () => {
    if (gameMode !== "play" || items.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const arc = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, size, size);

    items.forEach((item, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      // 캔버스 크기에 따른 폰트 사이즈 조절 (기본 16px)
      ctx.font = `bold ${Math.max(12, size / 26)}px Pretendard`;
      ctx.fillText(item, radius - (size / 20), 10);
      ctx.restore();
    });
  };

  useEffect(() => {
    if (gameMode === "play") drawRoulette();
  }, [items, gameMode]);

  const spin = () => {
    if (isSpinning || items.length < 2) return;
    setIsSpinning(true);
    setWinner(null);

    const randomRotate = Math.floor(Math.random() * 360) + 1800;
    const finalRotation = rotation + randomRotate;
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualRotation = finalRotation % 360;
      const arc = 360 / items.length;
      const index = Math.floor(((360 - actualRotation + 270) % 360) / arc);
      setWinner(items[index]);
    }, 3000);
  };

  const addItem = () => {
    const trimmedItem = newItem.trim().substring(0, 8);
    if (trimmedItem && items.length < 8) {
      setItems([...items, trimmedItem]);
      setNewItem("");
    }
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full h-full min-w-[360px] min-h-[680px] bg-white rounded-[40px] p-6 sm:p-10 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden transition-all duration-500">
      
      {/* --- [MODE 1] SETUP --- */}
      {gameMode === "setup" && (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <h2 className="text-[24px] sm:text-[28px] font-black text-gray-900 mb-2">만능 결정 룰렛</h2>
            <p className="text-[13px] sm:text-[14px] text-gray-400 font-bold">결정해야 할 항목들을 입력해주세요!</p>
          </div>
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newItem}
              maxLength={8}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') addItem();
              }}
              placeholder="항목 입력 (최대 8자)"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-[14px] sm:text-[15px] font-bold focus:border-[#91D148] outline-none"
            />
            <button onClick={addItem} className="px-5 sm:px-6 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all">+</button>
          </div>
          <div className="space-y-2 mb-8 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
            {items.length === 0 ? (
              <div className="py-10 text-center text-gray-300 font-bold border-2 border-dashed border-gray-50 rounded-2xl">항목을 추가해주세요!</div>
            ) : (
              items.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                  <span className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[14px] sm:text-[15px] font-bold text-gray-700">{item}</span>
                  </span>
                  <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 transition-all font-black px-2">✕</button>
                </div>
              ))
            )}
          </div>
          <button 
            disabled={items.length < 2}
            onClick={() => setGameMode("play")}
            className="w-full py-4 sm:py-5 bg-[#91D148] text-white rounded-[24px] font-black text-base sm:text-lg shadow-xl shadow-[#91D148]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:bg-gray-200 disabled:shadow-none"
          >
            {items.length < 2 ? "2개 이상 입력해주세요!" : "룰렛 준비 완료! 🐹✨"}
          </button>
        </div>
      )}

      {/* --- [MODE 2] PLAY --- */}
      {gameMode === "play" && (
        <div className="flex flex-col items-center justify-between w-full h-full max-w-2xl animate-in fade-in slide-in-from-right-10 duration-500 relative pt-12">
          
          {/* 상단 버튼 레이어 분리: 절대 위치지만 여백 확보 */}
          <div className="absolute top-0 right-0 z-40">
            <button 
              onClick={() => { setGameMode("setup"); setWinner(null); }}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-sm"
            >
              ← 항목 수정
            </button>
          </div>

          {/* 룰렛 메인: 화면 높이에 따라 유연하게 크기 조절 */}
          <div className="relative flex-1 flex items-center justify-center w-full min-h-[300px]">
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
               {/* 화살표 */}
              <div className="absolute top-[-10px] sm:top-[-25px] left-1/2 -translate-x-1/2 z-20 text-3xl sm:text-4xl filter drop-shadow-md text-[#91D148]">▼</div>
              
              <div 
                className="w-full h-full transition-transform duration-[3000ms] ease-out shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] rounded-full"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <canvas 
                  ref={canvasRef} 
                  width={500} // 고해상도 드로잉을 위해 고정값 유지 (CSS로 조절)
                  height={500} 
                  className="w-full h-full rounded-full border-[8px] sm:border-[15px] border-gray-900 bg-gray-900" 
                />
              </div>

              {/* 중앙 바라 버튼 */}
              <button 
                onClick={spin}
                disabled={isSpinning}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] min-w-[70px] min-h-[70px] bg-white border-[3px] sm:border-[6px] border-gray-900 rounded-full z-30 shadow-2xl flex items-center justify-center overflow-hidden transition-all active:scale-95 disabled:scale-100"
              >
                <img src="/images/bara/Lucky_Bara.png" alt="Lucky Bara" className={`w-[85%] h-[85%] object-contain ${isSpinning ? 'opacity-60' : 'opacity-100'}`} />
              </button>
            </div>
          </div>

          {/* 하단 고정 영역 (결과 + 버튼) */}
          <div className="w-full flex flex-col items-center mt-6">
            <div className="h-14 sm:h-16 flex flex-col items-center justify-center text-center w-full">
              <div className={`transition-all duration-700 ${winner ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {winner && (
                  <p className="text-[18px] sm:text-[22px] font-black text-gray-900 tracking-tight px-4">
                    🎉 결과는 바로! <span className="text-[#91D148] ml-1">{winner}</span>
                  </p>
                )}
                {!winner && isSpinning && (
                  <p className="text-[14px] sm:text-[16px] font-bold text-gray-400 animate-pulse">
                    바라가 운명을 결정하고 있어요...
                  </p>
                )}
              </div>
            </div>

            <button 
              onClick={spin}
              disabled={isSpinning}
              className="mt-2 px-12 sm:px-20 py-4 sm:py-5 bg-[#91D148] text-white rounded-[24px] sm:rounded-[28px] font-black text-lg sm:text-xl shadow-xl shadow-[#91D148]/40 hover:bg-[#82bd41] hover:scale-[1.05] active:scale-95 transition-all disabled:bg-gray-200"
            >
              {isSpinning ? "행운을 빌어요!" : "결정하기!"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
}