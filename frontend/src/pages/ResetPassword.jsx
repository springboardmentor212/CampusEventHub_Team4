import { useState } from "react";
import API from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import FormInput from "../components/FormInput";
import { ArrowRight, Loader2, Lock, ShieldCheck } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusBanner(null);

    if (form.password !== form.confirmPassword) {
      setStatusBanner({
        type: "error",
        message: "That link has expired. Request a new reset link.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await API.post("/auth/reset-password", {
        token,
        newPassword: form.password,
      });
      setStatusBanner({
        type: "success",
        message: "Password updated. You can sign in now.",
      });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setStatusBanner({
        type: "error",
        message: "That link has expired. Request a new reset link.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Password reset
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Set a new password
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Make it something strong you haven't used before.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="New password"
              icon={Lock}
              type="password"
              placeholder="Create a new password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              required
            />

            <FormInput
              label="Confirm password"
              icon={Lock}
              type="password"
              placeholder="Repeat your new password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
              required
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
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting password
                </>
              ) : (
                <>
                  Set password
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

export default ResetPassword;
