import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import { ShieldAlert, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";



const NotMe = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState("idle"); // idle, submitting, done, error
    const [resultType, setResultType] = useState(""); // cancelled, blocked

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus("submitting");
        try {
            const res = await API.post("/auth/report-not-me", { email, reason });
            setResultType(res.data.message);
            setStatus("done");
        } catch (err) {
            setStatus("error");
        }
    };

    const renderCard = (content, icon, iconColor) => {
        const Icon = icon;
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 text-center text-slate-900">
                    <div className={`w-20 h-20 ${iconColor} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm`}>
                        <Icon className="w-10 h-10" />
                    </div>
                    {content}
                </div>
            </div>
        );
    };

    if (status === "submitting") {
        return renderCard(
            <>
                <h2 className="text-2xl font-bold mb-2 animate-pulse">Submitting report...</h2>
                <div className="mt-8 flex justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            </>,
            Loader2,
            "bg-indigo-50 text-indigo-600"
        );
    }

    if (status === "done") {
        return renderCard(
            <>
                {resultType === "blocked" ? (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Registration Blocked</h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            Multiple reports were received for this email. Registration has been blocked for 24 hours.
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Report Received</h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            The registration attempt has been cancelled and your data has been removed.
                        </p>
                    </>
                )}
                <Link to="/" className="hero-btn w-full">
                    Back to Home
                </Link>
            </>,
            CheckCircle,
            "bg-emerald-50 text-emerald-600"
        );
    }

    if (status === "error") {
        return renderCard(
            <>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-slate-500 font-medium mb-8">Please try again.</p>
                <button onClick={() => setStatus("idle")} className="hero-btn w-full bg-slate-900 hover:bg-slate-800 border-none">
                    Retry
                </button>
            </>,
            ShieldAlert,
            "bg-rose-50 text-rose-600"
        );
    }

    return renderCard(
        <>
            <h2 className="text-2xl font-bold mb-2">Report Unauthorized Registration</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                If you didn't create this account, let us know and we'll cancel it.
            </p>

            <div className="bg-slate-100 rounded-2xl p-4 mb-8 text-sm font-bold text-slate-600 select-all">
                {email || "No email provided"}
            </div>

            <form onSubmit={handleSubmit} className="text-left space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Reason (optional)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Tell us more (optional)..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-100 placeholder:text-slate-300 transition-all resize-none shadow-inner"
                        rows="4"
                    ></textarea>
                </div>

                <button
                    disabled={!email}
                    className="hero-btn w-full bg-rose-600 text-white hover:bg-rose-700 border-none"
                >
                    Confirm — This wasn't me
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-50">
                <Link to="/login" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Actually, it was me — Back to Sign In
                </Link>
            </div>
        </>,
        ShieldAlert,
        "bg-rose-50 text-rose-600"
    );
};

export default NotMe;
