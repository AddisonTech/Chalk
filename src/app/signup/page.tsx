import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create a Chalk account",
};

export default function SignupPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground font-bold tracking-tight">
            C
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Create a Chalk account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your workspace in under a minute.
          </p>
        </div>

        <SignupForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
