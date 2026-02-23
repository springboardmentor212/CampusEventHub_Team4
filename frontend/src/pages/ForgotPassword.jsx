import { useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        try {
            await API.post("/auth/request-password-reset", { email });
            setMessage({
                type: "success",
                text: "Reset link sent! Please check your email.",
            });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Something went wrong",
            });
        }
    };

    return (
        <div className="font-display bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] min-h-screen flex md:items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-white rounded-xl shadow-xl border border-gray-200 px-6 py-8 md:px-8 md:py-10 mt-10 md:mt-0">
                <h1 className="text-xl md:text-2xl font-bold text-center text-[#111827]">
                    Forgot Password
                </h1>

                <p className="text-sm text-[#6B7280] text-center mt-2">
                    Enter your registered email. We’ll send a password reset link.
                </p>

                {message.text && (
                    <p
                        className={`text-sm mt-4 text-center font-medium ${message.type === "error" ? "text-red-500" : "text-green-500"
                            }`}
                    >
                        {message.text}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <label className="hidden md:block text-sm font-medium">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-[#5048e5] focus:border-[#5048e5] text-sm outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 md:py-4 rounded-lg text-white font-semibold bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Send Reset Link
                    </button>

                    <p className="text-xs text-center text-[#6B7280]">
                        If the email exists, a reset link will be sent.
                    </p>

                    <div className="text-center pt-2">
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-[#5048e5] hover:underline"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
