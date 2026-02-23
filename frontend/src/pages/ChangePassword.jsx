import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (form.newPassword !== form.confirmPassword) {
            setMessage({ type: "error", text: "Passwords must match." });
            return;
        }

        try {
            await API.post("/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            alert("Password updated successfully!");
            navigate("/student"); // Redirect back to dashboard
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Update failed",
            });
        }
    };

    return (
        <div className="font-display bg-[#EEF2FF] min-h-screen flex md:items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-white rounded-xl shadow-xl px-6 py-8 md:px-8 md:py-10 mt-10 md:mt-0">
                <h2 className="text-lg md:text-xl font-bold text-center md:text-left mb-6">
                    Change Password
                </h2>

                {message.text && (
                    <p
                        className={`text-sm mb-4 text-center font-medium ${message.type === "error" ? "text-red-500" : "text-green-500"
                            }`}
                    >
                        {message.text}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <input
                        type="password"
                        placeholder="Current Password"
                        required
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-[#5048e5] focus:border-[#5048e5] text-sm outline-none transition-all"
                        value={form.currentPassword}
                        onChange={(e) =>
                            setForm({ ...form, currentPassword: e.target.value })
                        }
                    />

                    <input
                        type="password"
                        placeholder="New Password"
                        required
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-[#5048e5] focus:border-[#5048e5] text-sm outline-none transition-all"
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    />

                    <input
                        type="password"
                        placeholder="Confirm New Password"
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
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
