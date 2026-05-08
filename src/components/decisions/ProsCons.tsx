import React, { useState, useEffect, useRef } from "react";

type GameMode = "setup" | "voting" | "result";

export default function ProsConsVote() {
  const [mode, setMode] = useState<GameMode>("setup");
  const [timerSetting, setTimerSetting] = useState(10); // 시연을 위해 기본 15초 세팅
  const [timeLeft, setTimeLeft] = useState(0);
  const [votes, setVotes] = useState({ agree: 0, disagree: 0 });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // 1. 투표 시작 (시뮬레이션 시작)
  const startVoting = () => {
    setVotes({ agree: 0, disagree: 0 });
    setTimeLeft(timerSetting);
    setMode("voting");
  };

  // 2. 타이머 및 실시간 투표 시뮬레이션 로직
  useEffect(() => {
    if (mode === "voting" && timeLeft > 0) {
      // 카운트다운 타이머
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      // 난수 투표 시뮬레이션 (500ms마다 누군가 투표하는 것처럼)
      simulationRef.current = setInterval(() => {
        const isAgree = Math.random() > 0.45; // 약간 찬성이 더 많이 나오게 설정 (조정 가능)
        const increment = Math.floor(Math.random() * 3) + 1; // 한 번에 1~3명 투표
        
        setVotes(prev => ({
          ...prev,
          [isAgree ? 'agree' : 'disagree']: prev[isAgree ? 'agree' : 'disagree'] + increment
        }));
      }, 600);

    } else if (timeLeft === 0 && mode === "voting") {
      setMode("result");
      if (timerRef.current) clearInterval(timerRef.current);
      if (simulationRef.current) clearInterval(simulationRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [mode, timeLeft]);

  const totalVotes = votes.agree + votes.disagree;
  const agreePercent = totalVotes > 0 ? Math.round((votes.agree / totalVotes) * 100) : 0;
  const disagreePercent = totalVotes > 0 ? Math.round((votes.disagree / totalVotes) * 100) : 0;

  return (
    <div className="w-full h-full min-w-[360px] min-h-[680px] bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden">
      
      {/* --- [MODE 1] SETUP --- */}
      {mode === "setup" && (
        <div className="w-full max-w-sm animate-in fade-in zoom-in duration-300 flex flex-col items-center">
          <div className="text-center mb-10">
            <div className="bg-[#F3FAEB] text-[#91D148] px-4 py-1.5 rounded-full text-xs font-black mb-3 inline-block uppercase tracking-wider">Live Decision</div>
            <h2 className="text-[26px] sm:text-[30px] font-black text-gray-900 mb-2">실시간 찬반 투표</h2>
            <p className="text-[14px] text-gray-400 font-bold px-4">의사결정을 위한 제한시간을 정해주세요!</p>
          </div>

          <div className="w-full bg-gray-50 rounded-[32px] p-8 mb-10 flex flex-col items-center border border-gray-100">
            <span className="text-[56px] font-black text-[#91D148] mb-2 tabular-nums">
              {timerSetting}<span className="text-2xl text-gray-400 ml-1 font-bold">초</span>
            </span>
            <input 
              type="range" 
              min="5" 
              max="90" 
              step="5"
              value={timerSetting}
              onChange={(e) => setTimerSetting(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#91D148]"
            />
            <div className="w-full flex justify-between mt-4 text-xs font-bold text-gray-400">
              <span>5s</span>
              <span>45s</span>
              <span>90s</span>
            </div>
          </div>

          <button 
            onClick={startVoting}
            className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95"
          >
            투표 시작하기 🐹✨
          </button>
        </div>
      )}

      {/* --- [MODE 2] VOTING: 자동 시뮬레이션 --- */}
      {mode === "voting" && (
        <div className="w-full flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-500 px-4 py-1.5 rounded-full text-xs font-black mb-6 animate-pulse border border-red-100">
              <div className="w-2 h-2 bg-red-500 rounded-full" /> LIVE VOTING
            </div>
            <h2 className="text-6xl sm:text-7xl font-black text-gray-900 tabular-nums leading-none">
              {timeLeft}<span className="text-2xl ml-2 font-bold text-gray-300">s</span>
            </h2>
          </div>

          <div className="w-full max-w-md bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-inner">
             {/* 현재 카운트 수치 */}
             <div className="flex justify-between items-end mb-6">
               <div className="flex flex-col">
                 <span className="text-xs font-black text-[#4A90D9] mb-1">AGREE</span>
                 <span className="text-3xl font-black text-gray-900 tabular-nums">{votes.agree}</span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-xs font-black text-[#FF5A5A] mb-1">DISAGREE</span>
                 <span className="text-3xl font-black text-gray-900 tabular-nums">{votes.disagree}</span>
               </div>
             </div>

            {/* 실시간 게이지 바 */}
            <div className="w-full h-16 bg-white rounded-2xl overflow-hidden flex shadow-sm p-1.5 border border-gray-100">
              <div 
                className="h-full bg-[#4A90D9] transition-all duration-700 ease-out flex items-center justify-center text-white font-black text-base rounded-l-xl min-w-[40px]"
                style={{ width: `${totalVotes === 0 ? 50 : (votes.agree / totalVotes) * 100}%` }}
              >
                {agreePercent}%
              </div>
              <div 
                className="h-full bg-[#FF5A5A] transition-all duration-700 ease-out flex items-center justify-center text-white font-black text-base rounded-r-xl min-w-[40px]"
                style={{ width: `${totalVotes === 0 ? 50 : (votes.disagree / totalVotes) * 100}%` }}
              >
                {disagreePercent}%
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
             <div className="flex -space-x-3">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 animate-bounce" style={{animationDelay: `${i * 0.1}s`}}>
                   <img src={`https://i.pravatar.cc/100?img=${i+10}`} className="rounded-full" alt="avatar" />
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-white bg-[#F3FAEB] flex items-center justify-center text-[10px] font-black text-[#91D148] animate-pulse">
                 +12
               </div>
             </div>
             <p className="text-gray-400 font-bold text-[14px]">참여자들이 실시간으로 투표하고 있습니다...</p>
          </div>
        </div>
      )}

      {/* --- [MODE 3] RESULT --- */}
      {mode === "result" && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-10 duration-700 flex flex-col items-center">
          <div className="mb-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <img src="/images/bara/Lucky_Bara.png" alt="Bara" className="w-full h-full object-contain" />
              <div className="absolute -top-2 -right-2 bg-[#91D148] text-white w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg">✓</div>
            </div>
            <h2 className="text-[30px] font-black text-gray-900 leading-tight">투표 종료!<br/>의결된 사항입니다</h2>
          </div>

          <div className="w-full space-y-3 mb-10">
            <div className={`p-6 rounded-[32px] border-2 flex justify-between items-center transition-all ${votes.agree >= votes.disagree ? 'border-[#91D148] bg-[#F3FAEB]' : 'border-gray-100 bg-gray-50'}`}>
               <span className="text-xl font-black text-gray-800">👍 찬성</span>
               <div className="text-right">
                 <span className="text-2xl font-black text-gray-900">{votes.agree}표</span>
                 <span className="ml-2 text-sm font-bold text-gray-500">({agreePercent}%)</span>
               </div>
            </div>
            <div className={`p-6 rounded-[32px] border-2 flex justify-between items-center transition-all ${votes.disagree > votes.agree ? 'border-[#FF5A5A] bg-[#FFF5F5]' : 'border-gray-100 bg-gray-50'}`}>
               <span className="text-xl font-black text-gray-800">👎 반대</span>
               <div className="text-right">
                 <span className="text-2xl font-black text-gray-900">{votes.disagree}표</span>
                 <span className="ml-2 text-sm font-bold text-gray-500">({disagreePercent}%)</span>
               </div>
            </div>
          </div>

          <button 
            onClick={() => setMode("setup")}
            className="w-full py-5 bg-gray-100 text-gray-600 rounded-[24px] font-black text-lg hover:bg-gray-200 transition-all"
          >
            확인 및 다시 설정
          </button>
        </div>
      )}
    </div>
  );
}