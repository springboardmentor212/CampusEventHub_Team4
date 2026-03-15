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
        const loadingToast = toast.loading("Checking...");
        try {
            await API.post("/auth/resend-verification", { email: email.trim() });
            toast.success("Verification link sent.", { id: loadingToast });
            setSubmitted(true);
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong.";
            if (msg.toLowerCase().includes("already verified")) {
                toast.error("Account already active. Please sign in.", { id: loadingToast });
            } else {
                // To prevent email discovery, we show a generic success message
                toast.success("Request sent.", { id: loadingToast });
                setSubmitted(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const Card = ({ children, icon: Icon, iconColor }) => (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 text-center animate-fade-in">
                <div className={`w-20 h-20 ${iconColor} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm`}>
                    <Icon className="w-10 h-10" />
                </div>
                {children}
            </div>
        </div>
    );

    if (submitted) {
        return (
            <Card icon={Inbox} iconColor="bg-emerald-50 text-emerald-600">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Inbox</h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    If an account exists for <span className="text-slate-900 font-bold">{email}</span>, you'll receive a new verification link shortly.
                </p>
                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="hero-btn w-full block text-center">
                    Open Gmail <ArrowRight className="w-4 h-4 ml-1" />
                </a>
                <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Links remain valid for 24 hours.
                </p>
            </Card>
        );
    }

    return (
        <Card icon={Mail} iconColor="bg-indigo-50 text-indigo-600">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Resend Verification</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">
                Enter your email address to receive a new verification link for your account.
            </p>

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
                    className="hero-btn w-full"
                >
                    {loading ? "Sending..." : "Resend Link"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <div className="text-center pt-2">
                    <Link to="/login" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                    </Link>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-8">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        Verification links are only sent to accounts that haven't been confirmed yet.
                    </p>
                </div>
            </form>
        </Card>
    );
};

export default ResendVerification;
