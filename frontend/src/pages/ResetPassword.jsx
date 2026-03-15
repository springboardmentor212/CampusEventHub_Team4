import { useState } from "react";
import API from "../api/axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import FormInput from "../components/FormInput";
import {
    Lock,
    ArrowRight,
    ShieldCheck,
    Eye,
    EyeOff,
    CheckCircle2
} from "lucide-react";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Updating password...");
        try {
            await API.post("/auth/reset-password", {
                token: token,
                newPassword: form.password,
            });
            toast.success("Password updated successfully!", { id: loadingToast });
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden">
            {/* Visual Section */}
            <div className="hidden md:flex md:w-1/2 relative p-12 bg-slate-50 border-r border-slate-100 items-center justify-center">
                <div className="relative z-10 w-full max-w-lg mx-auto">
                    <div className="mb-8">
                        <h1 className="editorial-header mt-4 italic">Reset Password</h1>
                        <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                            Create a strong, unique password to secure your account.
                        </p>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                        <img
                            src="/images/campus_life_professional.png"
                            alt="Campus Security"
                            className="w-full h-auto object-cover opacity-90"
                        />
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-white overflow-y-auto no-scrollbar">
                <div className="w-full max-w-sm">
                    <header className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Set New Password</h2>
                        <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                            Enter your new password below.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            label="New Password"
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            placeholder="8+ characters recommended"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            suffix={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />

                        <FormInput
                            label="Confirm New Password"
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            placeholder="Verify password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="hero-btn w-full py-4 text-sm group"
                        >
                            Update Password
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            {[
                                "Minimum 8 characters",
                                "Mix of letters and numerals",
                                "Not a previous password"
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rule}</span>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
