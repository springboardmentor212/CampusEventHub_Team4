import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const loadingToast = toast.loading("Updating password...");
        try {
            await API.post("/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success("Password updated successfully!", { id: loadingToast });
            navigate("/student"); // Redirect back to dashboard
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed", { id: loadingToast });
        }
    };

    return (
        <div className="font-display bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] min-h-screen flex md:items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-white rounded-xl shadow-xl border border-gray-100 px-6 py-8 md:px-8 md:py-10 mt-10 md:mt-0">
                <h2 className="text-xl md:text-2xl font-bold text-center text-[#111827] mb-6">
                    Change Password
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-[#5048e5] focus:border-[#5048e5] text-sm outline-none transition-all"
                            value={form.currentPassword}
                            onChange={(e) =>
                                setForm({ ...form, currentPassword: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-[#5048e5] focus:border-[#5048e5] text-sm outline-none transition-all"
                            value={form.newPassword}
                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-[#5048e5] focus:border-[#5048e5] text-sm outline-none transition-all"
                            value={form.confirmPassword}
                            onChange={(e) =>
                                setForm({ ...form, confirmPassword: e.target.value })
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 md:py-4 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white rounded-lg font-semibold shadow-lg shadow-[#5048e5]/20 hover:opacity-90 active:scale-[0.98] transition-all mt-4"
                    >
                        Update Password
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        Password must be at least 8 characters with uppercase, lowercase, and numbers.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
