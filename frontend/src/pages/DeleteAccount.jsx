import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-10 text-center">
                {status === "loading" && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
                        </div>
                        <p className="text-gray-500">Processing your request...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-4xl mx-auto mb-6">🗑️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Account Removed</h1>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <p className="text-sm text-gray-400">
                            Your email address is free to use. If you believe this was a mistake, please contact{" "}
                            <a href="mailto:support@campuseventhub.com" className="text-indigo-500 underline">support</a>.
                        </p>
                    </>
                )}

                {status === "active" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center text-4xl mx-auto mb-6">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Account Already Active</h1>
                        <p className="text-gray-500 mb-6">
                            This account has already been verified and is active. If you believe someone else created it using your email,
                            please contact support immediately.
                        </p>
                        <a
                            href="mailto:support@campuseventhub.com"
                            className="inline-block w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all mb-3"
                        >
                            Contact Support
                        </a>
                    </>
                )}

                {status === "invalid" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-4xl mx-auto mb-6">❌</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Link Invalid</h1>
                        <p className="text-gray-500 mb-6">{message}</p>
                    </>
                )}

                {status !== "loading" && (
                    <Link to="/" className="text-sm text-indigo-500 hover:underline mt-2 block">
                        ← Back to Home
                    </Link>
                )}

                <p className="text-xs text-gray-400 mt-6">
                    🎓 CampusEventHub · Account Management
                </p>
            </div>
        </div>
    );
};

export default DeleteAccount;
