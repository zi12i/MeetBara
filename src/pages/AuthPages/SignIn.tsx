import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="로그인 | 회의바라" 
        description="회의바라 서비스에 로그인하여 스마트한 회의 기록을 시작하세요."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
