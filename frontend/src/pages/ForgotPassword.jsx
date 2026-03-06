import { useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import FormInput from "../components/FormInput";
import {
    Mail,
    ArrowRight,
    ShieldCheck,
    ArrowLeft
} from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading("Verifying identity...");
        try {
            const res = await API.post("/auth/request-password-reset", { email });
            toast.success(res.data.message || "Reset link dispatched if account exists.", { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failure", { id: loadingToast });
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
                        <span className="inline-badge">Security Control</span>
                        <h1 className="editorial-header mt-4">Access Recovery.</h1>
                        <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                            Verify your university credentials to regain secure access to your campus dashboard.
                        </p>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                        <img
                            src="/images/campus_life_professional.png"
                            alt="Campus Life Recovery"
                            className="w-full h-auto object-cover opacity-90"
                        />
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-white overflow-y-auto no-scrollbar">
                <div className="w-full max-w-sm">
                    <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-12 uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Sign In
                    </Link>

                    <header className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Recover Access</h2>
                        <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                            Dispatch a verification link to your registered university email.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            label="Email Address"
                            icon={Mail}
                            type="email"
                            placeholder="uday.somapuram@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="hero-btn w-full py-4 text-sm group"
                        >
                            Dispatch Reset Link
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                Reset protocols are encrypted and valid for 60 minutes for your security.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
