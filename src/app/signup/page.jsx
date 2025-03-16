import { LoginForm } from "@/components/login-form"
import { SignUpForm } from "@/components/signup-form";

export default function page() {
  return (
    <div
      className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignUpForm />
      </div>
    </div>
  );
}
