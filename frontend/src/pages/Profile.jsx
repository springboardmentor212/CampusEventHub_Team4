import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import FormInput from "../components/FormInput";
import { Building2, Mail, Phone, ShieldCheck, User } from "lucide-react";

const Profile = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusBanner(null);

    try {
      await API.patch("/auth/profile", form);
      await loadUser();
      setStatusBanner({
        type: "success",
        message: "Profile updated.",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        message: "We couldn't save that. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const collegeName =
    user?.role === "admin"
      ? "Not linked to a college"
      : typeof user?.college === "object"
        ? user?.college?.name
        : user?.collegeName || user?.college || "No college assigned";

  const roleLabel =
    user?.role === "college_admin"
      ? "College admin"
      : user?.role === "admin"
        ? "Superadmin"
        : "Student";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Account settings
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Your profile
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep your account details up to date so approvals, reminders, and account access stay smooth.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-8">
            <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                  Personal info
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  The basics tied to your account.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInput
                  label="First name"
                  icon={User}
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                <FormInput
                  label="Last name"
                  icon={User}
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>

              <FormInput
                label="Phone"
                icon={Phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </section>

            <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                  Account
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  The details used to identify and sign in to your account.
                </p>
              </div>

              <FormInput
                label="Email"
                icon={Mail}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Role
                </p>
                <p className="mt-1 text-sm text-slate-800">{roleLabel}</p>
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                  College
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Your current campus association on the platform.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      College
                    </p>
                    <p className="mt-1 text-sm text-slate-800">{collegeName}</p>
                  </div>
                </div>
              </div>
            </section>

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
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? "Saving changes..." : "Save changes"}
            </button>

            <div className="border-t border-slate-200 pt-5">
              <Link
                to="/delete-account"
                className="text-sm font-medium text-rose-600 transition-colors hover:text-rose-700"
              >
                Delete account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
