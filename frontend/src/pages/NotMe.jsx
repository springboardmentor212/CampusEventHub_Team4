import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";

const NotMe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("idle");
  const [statusBanner, setStatusBanner] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setStatusBanner(null);

    try {
      await API.post("/auth/report-not-me", { email, reason });
      setStatus("done");
      setStatusBanner({
        type: "success",
        message: "Got it. We've flagged this for review.",
      });
    } catch (err) {
      setStatus("idle");
      setStatusBanner({
        type: "error",
        message: "Something went wrong. Try again in a moment.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Account review
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              That wasn't you?
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              If someone else used your email to register, we'll look into it.
            </p>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {email || "No email address was provided."}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Anything else you want to tell us? (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Add a short note if it helps."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400"
              />
            </div>

            {statusBanner && (
              <div className={`rounded-2xl border p-4 ${statusBanner.type === "success" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                <p className={`text-sm leading-6 ${statusBanner.type === "success" ? "text-emerald-800" : "text-rose-700"}`}>
                  {statusBanner.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!email || status === "submitting" || status === "done"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending report
                </>
              ) : (
                "Report this"
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotMe;
