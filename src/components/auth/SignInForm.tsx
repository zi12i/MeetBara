import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setError("");
    console.log('로그인 시도:', email, password);
    const success = await login(email, password);
    console.log('로그인 결과:', success);
    setIsLoading(false);
    if (success) {
      navigate("/");
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-8">
      <form onSubmit={handleLogin} className="space-y-6">
        {/* 이메일 입력칸 */}
        <div>
          <Label className="text-gray-600 font-bold mb-2.5 ml-1 text-sm">이메일 주소</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@meetbara.com"
            className="rounded-2xl border-gray-100 bg-gray-50/40 focus:bg-white focus:border-[#86B156] focus:ring-0 h-13 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* 비밀번호 입력칸 */}
        <div>
          <Label className="text-gray-600 font-bold mb-2.5 ml-1 text-sm">비밀번호</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="rounded-2xl border-gray-100 bg-gray-50/40 focus:bg-white focus:border-[#86B156] focus:ring-0 h-13 transition-all placeholder:text-gray-300"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
            </span>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <p className="text-red-500 text-[13px] font-bold text-center">{error}</p>
        )}

        {/* 로그인 유지 및 비밀번호 찾기 */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Checkbox checked={isChecked} onChange={setIsChecked} className="accent-[#86B156] w-4 h-4 cursor-pointer" />
            <span className="text-[13px] font-bold text-gray-500 cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
              로그인 상태 유지
            </span>
          </div>
          <Link to="/reset-password" onClick={(e) => e.preventDefault()} className="text-[13px] font-bold text-gray-400 hover:text-[#86B156] transition-colors">
            비밀번호 찾기
          </Link>
        </div>

        {/* 로그인 버튼 */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#86B156] hover:bg-[#769d4b] text-white font-black text-lg rounded-2xl border-none transition-all active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </div>
      </form>

      {/* 하단 링크 */}
      <div className="mt-10 flex justify-center items-center gap-4 border-t border-gray-50 pt-8">
        <Link to="/signup" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">회원가입</Link>
        <span className="w-1.5 h-1.5 bg-gray-100 rounded-full"></span>
        <Link to="/" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">처음으로</Link>
      </div>
    </div>
  );
}