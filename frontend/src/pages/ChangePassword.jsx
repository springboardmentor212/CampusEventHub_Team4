import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Verifying identity and updating security credentials...");
        try {
            await API.post("/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success("Security credentials updated successfully", { id: loadingToast });
            navigate(-1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto py-12 animate-fade-in">
                <header className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 mx-auto border border-indigo-100">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Security</h1>
                    <p className="text-slate-500 font-medium mt-1">Rotate your credentials to maintain account integrity</p>
                </header>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Current Secret</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white transition-all text-sm font-bold"
                                    value={form.currentPassword}
                                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">New Secret</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white transition-all text-sm font-bold"
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Confirm New Secret</label>
                            <div className="relative">
                                <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white transition-all text-sm font-bold"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="metallic-btn w-full py-4 mt-4"
                        >
                            Update Credentials
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                        <ShieldCheck className="w-5 h-5 text-indigo-500 mt-0.5" />
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            Ensuring robust password complexity helps protect your campus identity. Use a mix of alphanumeric characters and symbols.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChangePassword;
