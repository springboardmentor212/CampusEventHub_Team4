import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FormInput from "../components/FormInput";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusBanner(null);

    if (form.newPassword !== form.confirmPassword) {
      setStatusBanner({
        type: "error",
        message: "That didn't work. Double-check your current password and try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await API.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setStatusBanner({
        type: "success",
        message: "Your password has been updated.",
      });

      toast.success("Your password has been updated.");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setStatusBanner({
        type: "error",
        message: "That didn't work. Double-check your current password and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center justify-center px-6 py-10">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Password security
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Update your password
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose something you haven't used before.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Current password"
              icon={Lock}
              type="password"
              placeholder="Enter your current password"
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              autoComplete="current-password"
            />

            <FormInput
              label="New password"
              icon={Lock}
              type="password"
              placeholder="Create a new password"
              required
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              autoComplete="new-password"
            />

            <FormInput
              label="Confirm new password"
              icon={Lock}
              type="password"
              placeholder="Repeat your new password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />

            {statusBanner && (
              <div
                className={`rounded-2xl border p-4 ${
                  statusBanner.type === "success"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <p
                  className={`text-sm leading-6 ${
                    statusBanner.type === "success"
                      ? "text-emerald-800"
                      : "text-rose-700"
                  }`}
                >
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
                  Saving your password
                </>
              ) : (
                <>
                  Save new password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              A stronger password makes it much harder for someone else to get into your account.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChangePassword;