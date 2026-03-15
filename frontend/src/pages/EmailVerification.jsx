import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { Mail, CheckCircle, XCircle, Clock, ArrowRight, Loader2 } from "lucide-react";

const EmailVerification = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("loading"); // loading, verified, expired, already_verified, error
    const [role, setRole] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await API.get(`/auth/verify-email/${token}`);
                if (res.data.message === "verified") {
                    setRole(res.data.data.role);
                    setStatus("verified");
                }
            } catch (err) {
                const msg = err.response?.data?.message;
                if (msg === "expired") setStatus("expired");
                else if (msg === "already_verified") setStatus("already_verified");
                else setStatus("error");
            }
        };
        verify();
    }, [token]);

    const Card = ({ children, icon: Icon, iconColor }) => (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 text-center animate-fade-in">
                <div className={`w-20 h-20 ${iconColor} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm`}>
                    <Icon className="w-10 h-10" />
                </div>
                {children}
            </div>
        </div>
    );

    if (status === "loading") {
        return (
            <Card icon={Loader2} iconColor="bg-indigo-50 text-indigo-600">
                <h2 className="text-2xl font-bold mb-2">Verifying your email...</h2>
                <div className="mt-8 flex justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            </Card>
        );
    }

    if (status === "expired") {
        return (
            <Card icon={XCircle} iconColor="bg-rose-50 text-rose-500">
                <h2 className="text-2xl font-bold mb-2">Link Expired</h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    This verification link has expired. Please register again to get a new link.
                </p>
                <Link to="/register" className="hero-btn w-full">
                    Register Again <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </Card>
        );
    }

    if (status === "already_verified" || status === "verified") {
        return (
            <Card icon={Clock} iconColor="bg-amber-50 text-amber-600">
                <h2 className="text-2xl font-bold mb-2">Wait for Approval</h2>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 text-left">
                    <p className="text-sm font-bold text-amber-900 leading-relaxed mb-4">
                        Your email has been verified, but your account is still pending administrative review.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex gap-3 text-xs font-bold text-amber-700 uppercase tracking-wide">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            Email Confirmed
                        </li>
                        <li className="flex gap-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            Admin Review Pending
                        </li>
                    </ul>
                </div>

                <p className="text-xs font-medium text-slate-500 mb-8 leading-relaxed">
                    You'll receive an automated email once a decision has been made by the {role === 'college_admin' ? 'platform superadmin' : 'college administrator'}.
                    You cannot sign in until then.
                </p>

                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="hero-btn w-full bg-indigo-600 text-white hover:bg-indigo-700 block text-center">
                    Check Mail for Confirmation
                </a>
            </Card>
        );
    }

    return (
        <Card icon={XCircle} iconColor="bg-rose-50 text-rose-500">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-500 font-medium mb-8">
                We couldn't verify your email. Please try again or contact support.
            </p>
            <Link to="/login" className="hero-btn w-full px-10">
                Back to Sign In
            </Link>
        </Card>
    );
};

export default EmailVerification;
