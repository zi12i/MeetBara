import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="회원가입 | 회의바라" 
        description="회의바라 서비스에 로그인하여 스마트한 회의 기록을 시작하세요."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
