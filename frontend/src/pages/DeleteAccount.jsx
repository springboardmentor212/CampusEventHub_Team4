import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Loader2, ShieldAlert, Trash2 } from "lucide-react";

const DeleteAccount = () => {
  const { token } = useParams();
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  const handleDelete = async (e) => {
    e.preventDefault();
    setStatusBanner(null);

    if (confirmText.trim() !== "DELETE") {
      setStatusBanner({
        type: "error",
        message: "Type DELETE exactly as shown before you continue.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await API.get(`/auth/delete-account/${token}`);
      setStatusBanner({
        type: "success",
        message: res.data?.message || "Your account has been deleted.",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        message: "We couldn't delete your account right now. Try again or contact support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuccess = statusBanner?.type === "success";

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Account removal
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Delete your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This is permanent. Your registrations, history, and profile will be removed.
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleDelete} className="space-y-5">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm leading-6 text-rose-800">
                  Once this is done, your account cannot be restored from this screen.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400"
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </div>

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
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting your account
                  </>
                ) : (
                  <>
                    Yes, delete my account
                    <Trash2 className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/"
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                >
                  Actually, keep my account
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm leading-6 text-emerald-800">
                  {statusBanner.message}
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Back to home
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
