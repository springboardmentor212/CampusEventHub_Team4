import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const ResendVerification = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        try {
            await API.post("/auth/resend-verification", { email: email.trim() });
            setSubmitted(true);
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong.";
            // Show specific errors (like "already verified") but not user-existence leaks
            if (msg.toLowerCase().includes("already verified")) {
                toast.error("This account is already verified. Please log in.");
            } else {
                setSubmitted(true); // Still show success to avoid leaking whether email exists
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-2xl mx-auto mb-4">
                        ✉️
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Resend Verification</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Enter your email and we'll send you a fresh verification link.
                    </p>
                </div>

                {submitted ? (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl mx-auto mb-4">
                            📬
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Inbox</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            If a pending account exists for <strong>{email}</strong>, a new verification email has been sent.
                            Please check your inbox (and spam folder).
                        </p>
                        <p className="text-xs text-gray-400">The link expires in 24 hours.</p>
                        <Link to="/login" className="block mt-6 text-sm text-indigo-500 hover:underline">
                            ← Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                    mail
                                </span>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@university.edu"
                                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Send New Link <span className="material-symbols-outlined text-sm">send</span></>
                            )}
                        </button>

                        <Link to="/login" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-2">
                            ← Back to Login
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResendVerification;
