import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import FormInput from "../components/FormInput";
import {
    Mail,
    ArrowRight,
    ArrowLeft,
    Inbox,
    ShieldCheck
} from "lucide-react";

const ResendVerification = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        const loadingToast = toast.loading("Processing request...");
        try {
            await API.post("/auth/resend-verification", { email: email.trim() });
            toast.success("Verification link dispatched.", { id: loadingToast });
            setSubmitted(true);
        } catch (err) {
            const msg = err.response?.data?.message || "Internal error.";
            if (msg.toLowerCase().includes("already verified")) {
                toast.error("Account already active. Please sign in.", { id: loadingToast });
            } else {
                // To prevent email discovery, we show a generic success message
                toast.success("Request processed.", { id: loadingToast });
                setSubmitted(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-white flex flex-col items-center justify-center p-8 animate-fade-in overflow-hidden">
            <div className="w-full max-w-sm text-center">
                {submitted ? (
                    <div className="space-y-8">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            <Inbox className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div className="space-y-3">
                            <span className="inline-badge">Email Outbox</span>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check Your Inbox</h1>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                If a pending account exists for <span className="text-slate-900 font-bold">{email}</span>, a new link is on its way.
                            </p>
                        </div>
                        <Link to="/login" className="hero-btn w-full py-4 text-sm group">
                            Return to Login
                            <ArrowLeft className="w-4 h-4 ml-2" />
                        </Link>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Links remain valid for 24 hours.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            <Mail className="w-10 h-10 text-indigo-600" />
                        </div>

                        <header className="space-y-3 text-center">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Request New Link</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Recover your verification email to finalize your account setup.
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <FormInput
                                label="University Email"
                                icon={Mail}
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="uday.somapuram@university.edu"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="hero-btn w-full py-4 text-sm group"
                            >
                                Dispatch New Link
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <Link to="/login" className="block text-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                                Back to Sign In
                            </Link>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mt-8">
                                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed text-center">
                                    Verification links are only sent to accounts pending activation.
                                </p>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResendVerification;
