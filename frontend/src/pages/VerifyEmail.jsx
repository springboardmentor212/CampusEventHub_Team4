import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verify = async () => {
      try {
        await API.get(`/auth/verify-email/${token}`);
        setStatus("success");
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
      title: "You're verified.",
      text: "Your email is confirmed. You can sign in once your account is approved.",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    error: {
      icon: XCircle,
      title: "That link didn't work.",
      text: "It may have expired. Request a new one below.",
      tone: "border-rose-200 bg-rose-50 text-rose-700",
    },
  }[status];

  const Icon = content.icon;

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

          <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${content.tone}`}>
            <Icon className={`h-8 w-8 ${content.animate || ""}`} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {content.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {content.text}
          </p>

          {status === "success" ? (
            <Link
              to="/login"
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Go to sign in
            </Link>
          ) : status === "error" ? (
            <Link
              to="/resend-verification"
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Resend verification email
              <Mail className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
