import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import {
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck,
    ArrowRight,
    Mail,
    Loader2
} from "lucide-react";

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("loading"); // loading | success | expired | used | error
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await API.get(`/auth/verify-email/${token}`);
                setStatus("success");
                setMessage(res.data.message);
            } catch (err) {
                const msg = err.response?.data?.message || "";
                if (msg.toLowerCase().includes("expired")) {
                    setStatus("expired");
                } else if (msg.toLowerCase().includes("already verified") || msg.toLowerCase().includes("already been used")) {
                    setStatus("used");
                } else {
                    setStatus("error");
                    setMessage(msg || "Verification failed.");
                }
            }
        };
        if (token) verify();
    }, [token]);

    const ui = {
        loading: {
            icon: Loader2,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            title: "Verifying Identity",
            desc: "Communicating with university secure nodes...",
            animate: "animate-spin"
        },
        success: {
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            title: "Access Granted",
            desc: "Your university email has been successfully verified."
        },
        expired: {
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
            title: "Token Expired",
            desc: "For security, verification links expire after 24 hours."
        },
        used: {
            icon: ShieldCheck,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            title: "Already Verified",
            desc: "This security token has already been processed."
        },
        error: {
            icon: XCircle,
            color: "text-rose-600",
            bg: "bg-rose-50",
            title: "System Error",
            desc: "We encountered an issue during verification protocols."
        },
    };

    const current = ui[status] || ui.error;
    const Icon = current.icon;

    return (
        <div className="h-screen bg-white flex flex-col items-center justify-center p-8 animate-fade-in overflow-hidden">
            <div className="w-full max-w-sm text-center space-y-8">
                <div className={`w-20 h-20 mx-auto rounded-3xl ${current.bg} flex items-center justify-center border border-slate-100 shadow-sm`}>
                    <Icon className={`w-10 h-10 ${current.color} ${current.animate || ''}`} />
                </div>

                <div className="space-y-3">
                    <span className="inline-badge">Security Node</span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{current.title}</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {current.desc}
                    </p>
                </div>

                <div className="pt-4">
                    {status === "loading" ? (
                        <div className="h-12 w-full bg-slate-50 rounded-xl flex items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Establishing Connection...</span>
                        </div>
                    ) : status === "success" || status === "used" ? (
                        <Link to="/login" className="hero-btn w-full py-4 text-sm group">
                            Continue to Login
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ) : (
                        <div className="space-y-4">
                            <Link to="/resend-verification" className="hero-btn w-full py-4 text-sm">
                                Request New Link
                                <Mail className="w-4 h-4 ml-2" />
                            </Link>
                            <Link to="/login" className="block text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                                Return to Sign In
                            </Link>
                        </div>
                    )}
                </div>

                <div className="pt-12 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        🎓 CampusHub Secure Verification
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
