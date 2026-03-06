import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";

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

    const icons = {
        loading: { emoji: "⏳", color: "#4F46E5", title: "Verifying your email..." },
        success: { emoji: "🎉", color: "#16a34a", title: "Email Verified!" },
        expired: { emoji: "⏰", color: "#D97706", title: "Link Expired" },
        used: { emoji: "✅", color: "#16a34a", title: "Already Verified" },
        error: { emoji: "❌", color: "#DC2626", title: "Verification Failed" },
    };

    const current = icons[status] || icons.error;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-10 text-center">
                {/* Icon */}
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
                    style={{ backgroundColor: `${current.color}15` }}
                >
                    {current.emoji}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">{current.title}</h1>

                {/* Status messages */}
                {status === "loading" && (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                )}

                {status === "success" && (
                    <>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block w-full py-3 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                        >
                            Go to Login →
                        </Link>
                    </>
                )}

                {status === "expired" && (
                    <>
                        <p className="text-gray-500 mb-6">
                            Your verification link has expired. Request a new one below — a fresh link is valid for 24 hours.
                        </p>
                        <Link
                            to="/resend-verification"
                            className="inline-block w-full py-3 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white font-semibold rounded-xl hover:opacity-90 transition-all mb-3"
                        >
                            Request New Link
                        </Link>
                        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
                            Back to Login
                        </Link>
                    </>
                )}

                {status === "used" && (
                    <>
                        <p className="text-gray-500 mb-6">Your account is already verified. You can log in now.</p>
                        <Link
                            to="/login"
                            className="inline-block w-full py-3 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                        >
                            Go to Login →
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <Link
                            to="/resend-verification"
                            className="inline-block w-full py-3 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white font-semibold rounded-xl hover:opacity-90 transition-all mb-3"
                        >
                            Request New Link
                        </Link>
                        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
                            Back to Login
                        </Link>
                    </>
                )}

                <p className="text-xs text-gray-400 mt-6">
                    🎓 CampusEventHub · Secure Email Verification
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
