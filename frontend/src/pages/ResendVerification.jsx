import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import FormInput from "../components/FormInput";
import { ArrowLeft, ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusBanner(null);
    setLoading(true);

    try {
      await API.post("/auth/resend-verification", { email: email.trim() });
      setStatusBanner({
        type: "success",
        message: "Sent. Check your inbox — and your spam folder just in case.",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        message: "We couldn't find that email. Make sure it matches the one you signed up with.",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Verification
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Resend verification email
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter your email and we'll send a fresh link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Email"
              icon={Mail}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu"
              autoComplete="email"
            />

            {statusBanner && (
              <div className={`rounded-2xl border p-4 ${statusBanner.type === "success" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                <p className={`text-sm leading-6 ${statusBanner.type === "success" ? "text-emerald-800" : "text-rose-700"}`}>
                  {statusBanner.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending link
                </>
              ) : (
                <>
                  Send link
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
