import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [role, setRole] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await API.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setRole(res.data?.data?.role || null);
      } catch (err) {
        setStatus("error");
      }
    };

    if (token) verify();
  }, [token]);

  const content = {
    loading: {
      icon: Loader2,
      title: "Checking your link",
      text: "Give us a second while we confirm your email.",
      tone: "border-slate-200 bg-slate-50 text-slate-600",
      animate: "animate-spin",
    },
    success: {
      icon: CheckCircle2,
      title: role === "college_admin"
        ? "Account under review by Superadmin"
        : role === "student"
        ? "Account under review by Admin"
        : "Email verified!",
      text:
        role === "college_admin"
          ? (
              <>
                <span>Your email is confirmed. Your admin account is now pending superadmin approval.</span>
                <br />
                <span className="font-semibold">You will not be able to sign in until your account has been approved by a superadmin.</span>
              </>
            )
          : role === "student"
          ? (
              <>
                <span>Your email is confirmed. Your student account is now pending college admin approval.</span>
                <br />
                <span className="font-semibold">You will not be able to sign in until your account has been approved by a college admin.</span>
              </>
            )
          : "Your email is confirmed. You can sign in once your account is approved.",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    error: {
      icon: XCircle,
      title: role === "college_admin"
        ? "Account under review by Superadmin"
        : role === "student"
        ? "Account under review by Admin"
        : "Account under review",
      text:
        role === "college_admin"
          ? (
              <>
                <span>Your account is under review. You will get an email once approved by a superadmin.</span>
              </>
            )
          : role === "student"
          ? (
              <>
                <span>Your account is under review. You will get an email once approved by a college admin.</span>
              </>
            )
          : "Your account is under review. You will get an email once approved.",
      tone: "border-rose-200 bg-rose-50 text-rose-700",
    },
  }[status];

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${content.tone}`}>
            <Icon className={`h-8 w-8 ${content.animate || ""}`} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {content.title}
          </h1>
          <div className="mt-3 text-sm leading-6 text-slate-600">
            {content.text}
          </div>

          {status === "success" && ["college_admin", "student"].includes(role) && (
            <button
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-700 cursor-not-allowed"
              tabIndex={-1}
              aria-disabled="true"
            >
              Waiting for approval...
            </button>
          )}
          {status === "success" && !["college_admin", "student"].includes(role) && (
            <Link
              to="/login"
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Go to sign in
            </Link>
          )}
          {status === "error" && ["college_admin", "student"].includes(role) && (
            <div className="mt-8 text-center">
              <p className="mb-4 text-sm text-slate-600">You can close this page. We’ll email you once your account is approved.</p>
              <Link
                to="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Return to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
