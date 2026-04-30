import React, { useState, useEffect, useRef } from "react";

const COLORS = ["#FF5A5A", "#FF914D", "#FFD23F", "#91D148", "#48D1CC", "#4A90D9", "#9B59B6", "#E84A94"];
const BARA_ICONS = ["Lucky_Bara.png", "Bulb_Bara.png", "White_Bara.png", "Pink_Bara.png", "Sprout_Bara.png", "Tang_Bara.png", "Star_Bara.png", "Cup_Bara.png"];
const BARA_PATH = "/images/bara/";

export default function RealLadder() {
  const [players, setPlayers] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [shuffledResults, setShuffledResults] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [newResult, setNewResult] = useState("");
  const [gameMode, setGameMode] = useState<"setup" | "play" | "fast">("setup");
  
  const [ladderData, setLadderData] = useState<number[][]>([]);
  const [animatingPlayer, setAnimatingPlayer] = useState<number | null>(null);
  const [baraPos, setBaraPos] = useState({ x: 0, y: 0 });
  const [completedPaths, setCompletedPaths] = useState<number[]>([]); 
  const [visibleResults, setVisibleResults] = useState<number[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 컨테이너 크기 고정: h-[750px]로 고정하여 화면 전환 시 널뛰기 방지
  const containerStyle = "w-full max-w-4xl h-[750px] bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col items-center overflow-hidden transition-all duration-300";

  const resetAll = () => {
    if (window.confirm("입력한 모든 참가자와 벌칙을 지울까요?")) {
      setPlayers([]);
      setResults([]);
      setNewPlayer("");
      setNewResult("");
      setCompletedPaths([]);
      setVisibleResults([]);
      setGameMode("setup");
    }
  };

  const initGame = () => {
    if (players.length < 2 || results.length === 0) return;
    const finalResults = [...results];
    while (finalResults.length < players.length) finalResults.push("통과");
    setShuffledResults(finalResults.sort(() => Math.random() - 0.5));
    
    const rows = 12;
    const lines = Array.from({ length: rows }, () => {
      const row: number[] = [];
      for (let j = 0; j < players.length - 1; j++) {
        if (Math.random() > 0.6 && (j === 0 || row[j - 1] === 0)) row.push(1);
        else row.push(0);
      }
      return row;
    });
    setLadderData(lines);
    setCompletedPaths([]);
    setVisibleResults([]);
    setGameMode("play");
  };

  // 결과 인덱스 계산 로직 (에러 방지를 위해 독립 함수로 분리)
  const calculateDestCol = (playerIdx: number) => {
    if (ladderData.length === 0) return playerIdx;
    let curCol = playerIdx;
    ladderData.forEach((row) => {
      if (curCol < players.length - 1 && row[curCol] === 1) curCol++;
      else if (curCol > 0 && row[curCol - 1] === 1) curCol--;
    });
    return curCol;
  };

  // 경로 좌표 계산 (반응형 대응)
  const getPathPoints = (playerIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { points: [], finalCol: playerIdx };
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const colWidth = width / players.length;
    const rowHeight = height / (ladderData.length + 1);

    let curCol = playerIdx;
    let curX = (curCol + 0.5) * colWidth;
    const points = [{ x: curX, y: 0 }];

    ladderData.forEach((row, rIdx) => {
      const nextY = (rIdx + 1) * rowHeight;
      points.push({ x: curX, y: nextY });
      if (curCol < players.length - 1 && row[curCol] === 1) {
        curCol++;
        curX = (curCol + 0.5) * colWidth;
        points.push({ x: curX, y: nextY });
      } else if (curCol > 0 && row[curCol - 1] === 1) {
        curCol--;
        curX = (curCol + 0.5) * colWidth;
        points.push({ x: curX, y: nextY });
      }
    });
    points.push({ x: curX, y: height });
    return { points, finalCol: curCol };
  };

  const drawLadder = () => {
    const canvas = canvasRef.current;
    if (!canvas || gameMode !== "play") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    const colWidth = width / players.length;
    const rowHeight = height / (ladderData.length + 1);

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";

    // 사다리 기본 격자
    players.forEach((_, i) => {
      const x = (i + 0.5) * colWidth;
      ctx.beginPath(); ctx.strokeStyle = "#F3F4F6"; ctx.lineWidth = 4;
      ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    });
    ladderData.forEach((row, rIdx) => {
      const y = (rIdx + 1) * rowHeight;
      row.forEach((hasLine, cIdx) => {
        if (hasLine) {
          ctx.beginPath(); ctx.strokeStyle = "#F3F4F6"; ctx.lineWidth = 4;
          ctx.moveTo((cIdx + 0.5) * colWidth, y); ctx.lineTo((cIdx + 1.5) * colWidth, y); ctx.stroke();
        }
      });
    });

    // 지나온 자취 그리기
    completedPaths.forEach((pIdx) => {
      const { points } = getPathPoints(pIdx);
      if (points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = COLORS[pIdx % COLORS.length];
      ctx.lineWidth = 6;
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
    });
  };

  const startAnimation = async (playerIdx: number) => {
    if (animatingPlayer !== null || completedPaths.includes(playerIdx)) return;
    const { points, finalCol } = getPathPoints(playerIdx);
    setAnimatingPlayer(playerIdx);
    for (let i = 0; i < points.length; i++) {
      setBaraPos(points[i]);
      await new Promise(r => setTimeout(r, 100)); 
    }
    setCompletedPaths(prev => [...prev, playerIdx]);
    setVisibleResults(prev => [...prev, finalCol]);
    setAnimatingPlayer(null);
  };

  useEffect(() => {
    drawLadder();
    window.addEventListener("resize", drawLadder);
    return () => window.removeEventListener("resize", drawLadder);
  }, [gameMode, players, ladderData, completedPaths]);

  return (
    <div className={containerStyle}>
      
      {/* SETUP 모드 */}
      {gameMode === "setup" && (
        <div className="w-full h-full flex flex-col animate-in fade-in zoom-in duration-300 relative">
          <button onClick={resetAll} className="absolute top-0 right-0 px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl font-bold text-[11px] border border-gray-100 transition-all">전체 초기화</button>
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-black text-gray-900 mb-2">바라 사다리 설정</h2>
            <p className="text-[14px] text-gray-400 font-bold text-center">참가자와 결과를 입력해주세요. (최대 8명)</p>
          </div>
          <div className="grid grid-cols-2 gap-10 flex-1 overflow-hidden">
            <div className="flex flex-col min-h-0">
               <h3 className="font-black text-gray-700 mb-3 flex justify-between">참가자 <span className="text-gray-300 text-sm">{players.length}/8</span></h3>
               <div className="flex gap-2 mb-4">
                 <input type="text" value={newPlayer} onChange={(e) => setNewPlayer(e.target.value)} maxLength={8} onKeyDown={(e) => !e.nativeEvent.isComposing && e.key === 'Enter' && (newPlayer.trim() && players.length < 8 && setPlayers([...players, newPlayer.trim()]) || setNewPlayer(""))} placeholder="이름" className="flex-1 bg-gray-50 border rounded-xl px-4 py-2.5 font-bold outline-none focus:border-[#91D148]" />
                 <button onClick={() => {if (newPlayer.trim() && players.length < 8) {setPlayers([...players, newPlayer.trim()]); setNewPlayer("");}}} className="px-5 bg-gray-900 text-white rounded-xl font-black hover:bg-black transition-all">+</button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                 {players.map((p, i) => <div key={i} className="flex justify-between bg-gray-50 p-4 rounded-2xl border items-center">
                   <div className="flex items-center gap-3">
                     <img src={`${BARA_PATH}${BARA_ICONS[i % BARA_ICONS.length]}`} className="w-7 h-7 object-contain" alt="bara" />
                     <span className="text-[15px] font-bold text-gray-700">{p}</span>
                   </div>
                   <button onClick={() => setPlayers(players.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500 font-black">✕</button>
                 </div>)}
               </div>
            </div>
            <div className="flex flex-col min-h-0">
               <h3 className="font-black text-gray-700 mb-3">당첨/벌칙</h3>
               <div className="flex gap-2 mb-4">
                 <input type="text" value={newResult} onChange={(e) => setNewResult(e.target.value)} maxLength={8} onKeyDown={(e) => !e.nativeEvent.isComposing && e.key === 'Enter' && (newResult.trim() && results.length < players.length && setResults([...results, newResult.trim()]) || setNewResult(""))} placeholder="예: 커피 쏘기" className="flex-1 bg-gray-50 border rounded-xl px-4 py-2.5 font-bold outline-none focus:border-[#91D148]" />
                 <button onClick={() => {if (newResult.trim() && results.length < players.length) {setResults([...results, newResult.trim()]); setNewResult("");}}} className="px-5 bg-[#91D148] text-white rounded-xl font-black hover:bg-[#82bd41] transition-all">+</button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                 {results.map((r, i) => <div key={i} className="flex justify-between bg-[#91D148]/5 p-4 rounded-2xl border border-[#91D148]/10 items-center">
                   <span className="text-[14px] font-bold text-[#91D148]">{r}</span>
                   <button onClick={() => setResults(results.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500 font-black">✕</button>
                 </div>)}
               </div>
            </div>
          </div>
          <button disabled={players.length < 2 || results.length === 0} onClick={initGame} className="w-full mt-8 py-5 bg-[#91D148] text-white rounded-[28px] font-black text-xl shadow-xl shadow-[#91D148]/30 transition-all hover:scale-[1.01] active:scale-95 disabled:bg-gray-200">사다리 만들기 완료</button>
        </div>
      )}

      {/* PLAY 모드 */}
      {gameMode === "play" && (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-500 relative">
          <div className="absolute top-0 right-0 flex gap-2 z-50">
            <button onClick={() => setGameMode("fast")} className="px-5 py-2.5 bg-[#91D148] text-white rounded-2xl font-black text-xs shadow-md hover:bg-[#82bd41] transition-all">빠른 결과</button>
            <button onClick={() => setGameMode("setup")} className="px-5 py-2.5 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all">수정</button>
          </div>

          <div className="flex w-full mt-14 h-28">
            {players.map((name, i) => (
              <button key={i} onClick={() => startAnimation(i)} className={`flex flex-col items-center gap-2 transition-all ${completedPaths.includes(i) ? 'opacity-30' : 'hover:scale-110'}`} style={{ width: `${100 / players.length}%` }}>
                <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-900 shadow-md flex items-center justify-center overflow-hidden">
                  <img src={`${BARA_PATH}${BARA_ICONS[i % BARA_ICONS.length]}`} alt="Bara" className="w-[85%] h-[85%] object-contain" />
                </div>
                <span className="text-[13px] font-black text-gray-800 truncate px-1">{name}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 w-full relative my-6">
            <canvas ref={canvasRef} className="w-full h-full" />
            {animatingPlayer !== null && (
              <div className="absolute w-14 h-14 transition-all duration-100 ease-linear pointer-events-none"
                style={{ left: `${baraPos.x}px`, top: `${baraPos.y}px`, transform: 'translate(-50%, -50%)', zIndex: 100 }}>
                <img src={`${BARA_PATH}${BARA_ICONS[animatingPlayer % BARA_ICONS.length]}`} alt="bara" className="w-full h-full object-contain drop-shadow-xl" />
              </div>
            )}
          </div>

          <div className="flex w-full mb-4 h-28">
            {shuffledResults.map((result, i) => {
              const isFound = visibleResults.includes(i);
              return (
                <div key={i} className="flex flex-col items-center justify-start" style={{ width: `${100 / players.length}%` }}>
                  <div className="w-1.5 h-6 bg-gray-100 rounded-full mb-2" />
                  <div className={`px-4 py-2.5 rounded-2xl shadow-lg transition-all duration-500 ${isFound ? 'bg-gray-900 border-[#91D148] border-2 scale-110' : 'bg-gray-50 border border-gray-100'}`}>
                    <span className={`text-[12px] font-black text-center break-all ${isFound ? 'text-white' : 'text-gray-300'}`}>
                      {isFound ? result : '??'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAST 모드 */}
      {gameMode === "fast" && (
        <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="text-center mb-10">
            <h2 className="text-[26px] font-black text-gray-900 mb-2">빠른 결과 확인</h2>
            <p className="text-[14px] text-gray-400 font-bold">전체 결과를 한눈에 정리했습니다.</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-[40px] p-8 border border-gray-100 shadow-inner overflow-y-auto custom-scrollbar space-y-4">
             {players.map((name, i) => {
               const finalCol = calculateDestCol(i);
               const result = shuffledResults[finalCol];
               return (
                 <div key={i} className="flex justify-between items-center bg-white p-5 rounded-[24px] shadow-sm animate-in slide-in-from-bottom-2">
                   <div className="flex items-center gap-4">
                     <img src={`${BARA_PATH}${BARA_ICONS[i % BARA_ICONS.length]}`} className="w-10 h-10 object-contain" alt="bara" />
                     <span className="font-black text-[17px] text-gray-700">{name}</span>
                   </div>
                   <div className="flex-1 mx-6 border-b-2 border-dotted border-gray-100" />
                   <span className={`font-black text-[17px] ${result.includes('통과') ? 'text-gray-300' : 'text-[#FF5A5A]'}`}>{result}</span>
                 </div>
               );
             })}
          </div>
          <button onClick={() => setGameMode("play")} className="w-full mt-10 py-5 bg-gray-900 text-white rounded-[28px] font-black text-lg hover:bg-black transition-all">사다리 화면으로 돌아가기</button>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
}