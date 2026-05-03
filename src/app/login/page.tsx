import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in to Chalk",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; message?: string }>;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground font-bold tracking-tight">
            C
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Sign in to Chalk
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coaching workspace for film, recruiting, and game plan.
          </p>
        </div>

        <LoginForm searchParamsPromise={searchParams} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Chalk?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
