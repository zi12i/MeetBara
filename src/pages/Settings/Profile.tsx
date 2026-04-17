import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone"; 
import Toast from "../../components/common/Toast"; 
import { createPortal } from "react-dom"; 

type ToolType = 'google' | 'slack' | 'notion' | 'jira';

const UserProfiles: React.FC = () => {
  const [userInfo] = useState({
    name: "김바라",
    email: "bara.kim@meetbara.com",
    department: "서비스 기획팀",
    role: "PM (Product Manager)"
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isMatch, setIsMatch] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubMessage, setToastSubMessage] = useState<string | undefined>(undefined);

  const [connectedTools, setConnectedTools] = useState<Record<ToolType, string | null>>({
    google: "bara.kim@meetbara.com", 
    slack: null,
    notion: null,
    jira: null,
  });
  
  const [activeModal, setActiveModal] = useState<ToolType | null>(null);
  const [disconnectModal, setDisconnectModal] = useState<ToolType | null>(null); 
  const [isConnecting, setIsConnecting] = useState(false); 
  const [loginInputId, setLoginInputId] = useState(""); 

  useEffect(() => {
    const event = new CustomEvent('UPDATE_BARA', { 
      detail: { 
        scenarioId: "profile_setting",
        customMessage: "주기적인 비밀번호 변경은 중요한 회의록 데이터를 지키는 첫걸음입니다! 안전하게 설정해 주세요 🐹🛡️"
      } 
    });
    window.dispatchEvent(event);
  }, []);

  useEffect(() => {
    const hasNum = /[0-9]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const isValid = hasNum && hasUpper && hasLower && hasSpecial && newPassword.length > 0;
    setIsPasswordValid(isValid);

    if (newPassword === "" && confirmPassword === "") {
      setPasswordError("");
      setIsMatch(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      setIsMatch(false);
    } else if (confirmPassword.length > 0 && !isValid) {
      setPasswordError("새 비밀번호가 조건(대/소문자, 숫자, 특수문자)을 충족하지 않습니다.");
      setIsMatch(false);
    } else {
      setPasswordError("✅ 비밀번호가 올바르게 설정되었습니다.");
      setIsMatch(true);
    }
  }, [newPassword, confirmPassword]);

  const isPasswordReady = currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0 && isPasswordValid && isMatch;

  const triggerToast = (msg: string, subMsg?: string) => {
    setToastMessage(msg);
    setToastSubMessage(subMsg);
    setIsToastVisible(true);
  };

  const handleSave = () => {
    if (!isPasswordReady) {
      triggerToast("입력란을 다시 확인해 주세요.");
      return;
    }
    if (currentPassword !== "1234") {
      triggerToast("현재 비밀번호가 올바르지 않습니다.");
      return;
    }
    triggerToast("비밀번호 변경 완료", "성공적으로 저장되었습니다 🐹✨");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsMatch(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleConnectClick = (tool: ToolType) => {
    setLoginInputId(""); 
    setActiveModal(tool);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true); 
    
    setTimeout(() => {
      if (activeModal) {
        setConnectedTools(prev => ({ ...prev, [activeModal]: loginInputId || "user@example.com" }));
        const toolName = integrationData.find(t => t.id === activeModal)?.name || "서비스";
        triggerToast(`${toolName} 연동 완료!`, "성공적으로 계정이 연결되었습니다 🐹✨");
      }
      setIsConnecting(false);
      setActiveModal(null);
    }, 800);
  };

  const handleDisconnectClick = (tool: ToolType) => {
    setDisconnectModal(tool); 
  };

  const confirmDisconnect = () => {
    if (disconnectModal) {
      setConnectedTools(prev => ({ ...prev, [disconnectModal]: null }));
      const toolName = integrationData.find(t => t.id === disconnectModal)?.name || "서비스";
      triggerToast(`${toolName} 연동 해제`, "필요할 때 언제든 다시 연결할 수 있습니다.");
      setDisconnectModal(null); 
    }
  };

  const integrationData: { id: ToolType, name: string, desc: string, icon: JSX.Element }[] = [
    { id: 'google', name: 'Google Calendar', desc: '일정 기반 회의록', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>) },
    { id: 'slack', name: 'Slack', desc: '회의록 요약 알림 수신', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522-2.52h-6.313z" fill="#E01E5A"/></svg>) },
    { id: 'notion', name: 'Notion', desc: '회의록 자동 내보내기', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4.14 6.72l12.44-3.41c.64-.17 1.15.17 1.15.77v14.16c0 .59-.51.94-1.15 1.11l-12.44 3.41c-.64.18-1.15-.17-1.15-.77V7.83c0-.59.51-.94 1.15-1.11zM6.43 18.1l8.52-2.34V6l-8.52 2.34v9.76zm1.75-8.32l4.94-1.35.04 6.84-4.98 1.37v-6.86z"/></svg>) },
    { id: 'jira', name: 'Jira Software', desc: '액션 아이템 이슈 생성', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="#0052CC"><path d="M11.53 2c0 0-4.04 4.02-4.04 8.52 0 4.5 4.04 8.52 4.04 8.52s4.04-4.02 4.04-8.52c0-4.5-4.04-8.52-4.04-8.52zM2.5 7.17C1.12 7.17 0 8.28 0 9.67c0 1.38 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-1.39-1.12-2.5-2.5-2.5zm19 0c-1.38 0-2.5 1.12-2.5 2.5 0 1.39 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-1.39-1.12-2.5-2.5-2.5z"/></svg>) }
  ];

  const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
  const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

  return (
    <>
      <PageMeta title="내 정보" description="사용자 프로필 및 계정 설정" />
      <Toast message={toastMessage} subMessage={toastSubMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
      
      {createPortal(<CapybaraZone />, document.body)}

      {/* 1. 로그인 연동 모달 */}
      {activeModal && (
        <div className="fixed inset-0 z-[999] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl animate-scale-up">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-4">
                {integrationData.find(t => t.id === activeModal)?.icon}
              </div>
              <h3 className="text-[20px] font-black text-gray-900">
                {integrationData.find(t => t.id === activeModal)?.name} 로그인
              </h3>
              <p className="text-[13px] font-medium text-gray-500 mt-2">
                계정을 연동하여 회의바라를 더 스마트하게 사용하세요.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  placeholder="이메일 주소 (연동 표시용)"
                  value={loginInputId}
                  onChange={(e) => setLoginInputId(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 font-bold text-gray-900 outline-none focus:border-[#91D148] focus:bg-white shadow-sm transition-all text-[14px]"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="비밀번호"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 font-bold text-gray-900 outline-none focus:border-[#91D148] focus:bg-white shadow-sm transition-all text-[14px]"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-4 rounded-2xl text-[14px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  disabled={isConnecting}
                  className="flex-1 py-4 rounded-2xl text-[14px] font-black text-white bg-[#91D148] hover:bg-[#82bd41] shadow-md transition-all flex justify-center items-center"
                >
                  {isConnecting ? <span className="animate-spin text-white">🔄</span> : "로그인 및 연동"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. 연동 해제 경고 모달 */}
      {disconnectModal && (
        <div className="fixed inset-0 z-[999] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl animate-scale-up text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-[20px] font-black text-gray-900 mb-2">
              연동 해제
            </h3>
            <p className="text-[14px] font-medium text-gray-500 mb-8 leading-relaxed">
              정말 <strong>{integrationData.find(t => t.id === disconnectModal)?.name}</strong> 연동을 해제하시겠습니까?<br/>
              연결된 기능이 일시적으로 중단됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDisconnectModal(null)}
                className="flex-1 py-4 rounded-2xl text-[14px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDisconnect}
                className="flex-1 py-4 rounded-2xl text-[14px] font-black text-white bg-red-500 hover:bg-red-600 shadow-md transition-all"
              >
                해제하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 max-w-[1400px] mx-auto h-[calc(100vh-120px)] overflow-y-auto no-scrollbar relative">
        <div className="flex flex-col lg:flex-row gap-8 h-full">

          {/* === 좌측 영역: 프로필 및 보안 === */}
          <div className="flex-1 flex flex-col h-full gap-5">
            <h2 className="text-[22px] font-black text-gray-900 ml-2">
              <span className="border-b-[4px] border-[#91D148] pb-1 inline-block">프로필 정보</span>
            </h2>

            <div className="flex-1 bg-[#F4F9ED] p-10 rounded-[32px] border border-[#91D148]/20 flex flex-col gap-8 shadow-sm overflow-y-auto no-scrollbar">
              
              <section className="bg-white p-8 rounded-2xl border border-[#E2F1D1] shadow-sm">
                <div className="mb-6">
                  <span className="text-[24px] font-black text-gray-900">{userInfo.name}</span>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 mb-2 ml-1">이메일 주소</label>
                    <input type="email" value={userInfo.email} disabled className="w-full bg-white border border-[#E2F1D1] rounded-xl px-4 py-3.5 font-bold text-gray-400 cursor-not-allowed text-[14px]"/>
                  </div>
                </div>
              </section>

              <section className="flex flex-col flex-1">
                <h3 className="text-[18px] font-black text-gray-900 mb-5 ml-1">비밀번호 변경</h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="현재 비밀번호 (1234)" className="w-full bg-white border border-[#E2F1D1] rounded-xl px-4 py-4 pr-12 font-bold text-gray-900 outline-none focus:border-[#91D148] shadow-sm transition-all text-[14px] placeholder:text-gray-300"/>
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#91D148] transition-colors">{showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="새 비밀번호 입력" className={`w-full bg-white border-2 rounded-xl px-4 py-4 pr-12 font-bold text-gray-900 outline-none shadow-sm transition-all text-[14px] placeholder:text-gray-300 ${newPassword.length > 0 ? isPasswordValid ? 'border-[#91D148]' : 'border-red-400 focus:border-red-500' : 'border-[#E2F1D1] focus:border-[#91D148]'}`}/>
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#91D148] transition-colors">{showNewPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                    </div>
                    <p className={`text-[12px] font-medium mt-2 ml-2 ${newPassword.length > 0 && !isPasswordValid ? 'text-red-500' : 'text-gray-500'}`}>* 숫자, 영문 대문자, 소문자, 특수문자를 포함해야 합니다.</p>
                  </div>
                  <div>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="새 비밀번호 확인" className={`w-full bg-white border-2 rounded-xl px-4 py-4 pr-12 font-bold text-gray-900 outline-none shadow-sm transition-all text-[14px] placeholder:text-gray-300 ${confirmPassword.length > 0 ? isMatch ? 'border-[#91D148]' : 'border-red-400 focus:border-red-500' : 'border-[#E2F1D1] focus:border-[#91D148]'}`}/>
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#91D148] transition-colors">{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                    </div>
                    {passwordError && <p className={`text-[12px] font-bold mt-2 ml-2 ${isMatch ? 'text-[#628a31]' : 'text-red-500'}`}>{passwordError}</p>}
                  </div>
                </div>
                <button onClick={handleSave} disabled={!isPasswordReady} className={`w-full py-4 mt-6 rounded-2xl text-[16px] font-black transition-all ${isPasswordReady ? 'bg-[#91D148] text-white hover:bg-[#82bd41] shadow-lg hover:translate-y-[-2px] cursor-pointer' : 'bg-[#E2F1D1] text-gray-400 cursor-not-allowed opacity-70'}`}>변경사항 저장하기</button>
              </section>
            </div>
          </div>

          {/* === 우측 영역: 서비스 연동 === */}
          <div className="flex-1 flex flex-col h-full gap-5">
            <h2 className="text-[22px] font-black text-gray-900 ml-2">
              <span className="border-b-[4px] border-[#91D148] pb-1 inline-block">계정 연동</span>
            </h2>

            <div className="flex-1 bg-[#F4F9ED] p-10 rounded-[32px] border border-[#91D148]/20 flex flex-col gap-6 shadow-sm overflow-y-auto no-scrollbar">

              <section className="space-y-3 pb-4">
                <p className="text-[14px] font-bold text-gray-500 ml-1 mb-4 mt-2">연동된 서비스에서 회의록을 불러오거나 알림을 받을 수 있습니다.</p>
                
                {integrationData.map((tool) => {
                  const connectedId = connectedTools[tool.id];
                  const isConnected = !!connectedId;

                  return (
                    <div key={tool.id} className="flex items-center justify-between p-5 bg-white border border-[#E2F1D1] rounded-2xl shadow-sm hover:border-[#91D148]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center border border-gray-100 ${isConnected ? 'bg-white' : 'bg-gray-50'}`}>
                          {tool.icon}
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-gray-900">{tool.name}</p>
                          {isConnected ? (
                            <p className="text-[12px] font-medium text-gray-400">
                              {connectedId}
                            </p>
                          ) : (
                            <p className="text-[12px] font-bold text-[#91D148]">{tool.desc}</p>
                          )}
                        </div>
                      </div>
                      
                      {isConnected ? (
                        <button 
                          onClick={() => handleDisconnectClick(tool.id)}
                          className="text-[12px] font-bold text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          연동 해제
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleConnectClick(tool.id)}
                          className="text-[12px] font-black text-white bg-[#91D148] px-4 py-2.5 rounded-xl hover:bg-[#82bd41] shadow-md transition-all hover:scale-105"
                        >
                          연동하기
                        </button>
                      )}
                    </div>
                  );
                })}

              </section>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default UserProfiles;