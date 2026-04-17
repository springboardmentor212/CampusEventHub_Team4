import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";

const EmailVerification = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <MailCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Email verification
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Check your inbox
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              We sent a verification link to your email. Click it to activate your account.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <p className="text-sm leading-6 text-slate-600">
                  Check your spam folder if it hasn't arrived in a few minutes.
                </p>
              </div>
            </div>

            <Link
              to="/resend-verification"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Didn't get it? Resend the link.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
