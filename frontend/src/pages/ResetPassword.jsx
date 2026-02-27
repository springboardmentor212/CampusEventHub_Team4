import { useState } from "react";
import API from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
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

        const loadingToast = toast.loading("Updating password...");
        try {
            await API.post("/auth/reset-password", {
                token: token,
                newPassword: form.password,
            });
            toast.success("Password reset successful!", { id: loadingToast });
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed", { id: loadingToast });
        }
    };

    return (
        <div className="font-display bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] min-h-screen flex md:items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-white rounded-xl shadow-xl border border-gray-100 px-6 py-8 md:px-8 md:py-10 mt-10 md:mt-0">
                <h2 className="text-xl md:text-2xl font-bold text-center text-[#111827]">
                    Reset Password
                </h2>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <input
                        type="password"
                        placeholder="New Password"
                        required
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-[#5048e5] focus:border-[#5048e5] text-sm outline-none transition-all"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        required
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-[#5048e5] focus:border-[#5048e5] text-sm outline-none transition-all"
                        value={form.confirmPassword}
                        onChange={(e) =>
                            setForm({ ...form, confirmPassword: e.target.value })
                        }
                    />

                    <button
                        type="submit"
                        className="w-full py-3.5 md:py-4 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white rounded-lg font-semibold shadow-lg shadow-[#5048e5]/20 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Reset Password
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        Passwords must be at least 8 characters with upper, lower, and numbers.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
