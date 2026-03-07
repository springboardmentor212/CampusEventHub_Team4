import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import {
    Trash2,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ArrowLeft,
    Loader2,
    Mail
} from "lucide-react";

const DeleteAccount = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("loading"); // loading | success | active | invalid
    const [message, setMessage] = useState("");

    useEffect(() => {
        const deleteAcc = async () => {
            try {
                const res = await API.get(`/auth/delete-account/${token}`);
                setStatus("success");
                setMessage(res.data.message);
            } catch (err) {
                const msg = err.response?.data?.message || "";
                if (msg.toLowerCase().includes("already active")) {
                    setStatus("active");
                } else {
                    setStatus("invalid");
                    setMessage(msg || "This link is no longer valid.");
                }
            }
        };
        if (token) deleteAcc();
    }, [token]);

    const ui = {
        loading: {
            icon: Loader2,
            color: "text-rose-600",
            bg: "bg-rose-50",
            title: "Processing Request",
            desc: "Purger protocols in effect...",
            animate: "animate-spin"
        },
        success: {
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            title: "Identity Purged",
            desc: "Your university account and data have been removed."
        },
        active: {
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-50",
            title: "Account Active",
            desc: "This account has already been verified and is operational."
        },
        invalid: {
            icon: XCircle,
            color: "text-slate-400",
            bg: "bg-slate-50",
            title: "Invalid Request",
            desc: "This removal token is no longer valid or has expired."
        },
    };

    const current = ui[status] || ui.invalid;
    const Icon = current.icon;

    return (
        <div className="h-screen bg-white flex flex-col items-center justify-center p-8 animate-fade-in overflow-hidden">
            <div className="w-full max-w-sm text-center space-y-8">
                <div className={`w-20 h-20 mx-auto rounded-3xl ${current.bg} flex items-center justify-center border border-slate-100 shadow-sm`}>
                    <Icon className={`w-10 h-10 ${current.color} ${current.animate || ''}`} />
                </div>

                <div className="space-y-3">
                    <span className="inline-badge">Data Control</span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{current.title}</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {status === "success" ? message : current.desc}
                    </p>
                </div>

                <div className="pt-4">
                    {status === "active" ? (
                        <div className="space-y-4">
                            <a
                                href="mailto:support@campuseventhub.com"
                                className="hero-btn w-full py-4 text-sm bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                            >
                                Contact Support
                                <Mail className="w-4 h-4 ml-2" />
                            </a>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                If you did not initiate this, secure your email immediately.
                            </p>
                        </div>
                    ) : (
                        <Link to="/" className="hero-btn w-full py-4 text-sm group">
                            Return to Homepage
                            <ArrowLeft className="w-4 h-4 ml-2" />
                        </Link>
                    )}
                </div>

                <div className="pt-12 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    🎓 CampusHub Identity Protocols
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;
