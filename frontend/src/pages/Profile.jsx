import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
    User,
    Mail,
    Phone,
    LayoutGrid,
    Save,
    ShieldCheck,
    Hash,
    Lock,
    KeyRound,
    AlertCircle,
    Calendar,
    Award
} from "lucide-react";
import FormInput from "../components/FormInput";

const Profile = () => {
    const { user, loadUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    const [form, setForm] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
        email: user?.email || ""
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
                email: user.email || ""
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading("Updating profile...");
        try {
            await API.patch("/auth/profile", form);
            await loadUser();
            toast.success("Profile updated successfully!", { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setPasswordLoading(true);
        const loadingToast = toast.loading("Updating password...");
        try {
            await API.post("/auth/change-password", {
                currentPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success("Password changed successfully!", { id: loadingToast });
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password", { id: loadingToast });
        } finally {
            setPasswordLoading(false);
        }
    };

    const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
                <header>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="h-[2px] w-8 bg-indigo-600 rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Profile Settings</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Your Profile</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Summary Card */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-slate-200/50 shadow-2xl text-center space-y-6">
                            <div className="w-32 h-32 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto shadow-2xl shadow-slate-300">
                                {initials}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 italic">{user?.firstName} {user?.lastName}</h2>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2 px-4 py-1.5 bg-indigo-50 rounded-full inline-block">
                                    {user?.role === 'admin' ? 'Superadmin' : user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                            
                            <div className="space-y-4 text-left pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Member Since</p>
                                        <p className="text-xs font-bold text-slate-700">{new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {user?.role === 'college_admin' && (
                            <div className="bg-indigo-600 border border-indigo-500 rounded-[2.5rem] p-8 shadow-2xl text-white space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl">
                                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Commission</p>
                                        <h4 className="text-lg font-black italic">Campus Authority</h4>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        "Manage your college events",
                                        "Approve event requests",
                                        "Manage student accounts",
                                        "Maintain campus standards"
                                    ].map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-white/70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                            {p}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {user?.role === 'student' && (
                            <div className="bg-emerald-600 border border-emerald-500 rounded-[2.5rem] p-8 shadow-2xl text-white space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl">
                                        <Award className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Protocol</p>
                                        <h4 className="text-lg font-black italic">Academic Dossier</h4>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        "Official student profile",
                                        "Account approval status",
                                        "Track your event activity",
                                        "System usage history"
                                    ].map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-white/70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                            {p}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Profile Info Form */}
                        <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm space-y-10">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-900 rounded-2xl text-white">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal</p>
                                        <h3 className="text-lg font-black text-slate-900 italic">Personal Information</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="First Name" icon={User} required value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} />
                                <FormInput label="Last Name" icon={User} required value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} />
                                <FormInput label="Email Address" icon={Mail} value={form.email || user?.email || ""} onChange={(e) => setForm({...form, email: e.target.value})} />
                                <FormInput label="Phone Number" icon={Phone} required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                                {user?.role === 'student' && (
                                    <>
                                        <FormInput label="College ID" icon={Hash} value={user?.officialId || ""} disabled />
                                        <FormInput label="Department" icon={LayoutGrid} value={user?.department || "General"} disabled />
                                    </>
                                )}
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button type="submit" disabled={loading} className="hero-btn px-10 py-5 italic text-lg shadow-xl shadow-indigo-100">
                                    <Save className="w-5 h-5" />
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>

                        {/* Password Change Form */}
                        <form onSubmit={handlePasswordSubmit} className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm space-y-10">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                        <KeyRound className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</p>
                                        <h3 className="text-lg font-black text-slate-900 italic">Change Password</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormInput label="Current Password" type="password" icon={Lock} required value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} />
                                <FormInput label="New Password" type="password" icon={Lock} required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                                <FormInput label="Confirm Password" type="password" icon={Lock} required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button type="submit" disabled={passwordLoading} className="hero-btn hover:bg-slate-800 bg-slate-900 border-none px-10 py-5 italic text-lg shadow-xl shadow-slate-200">
                                    <KeyRound className="w-5 h-5" />
                                    {passwordLoading ? "Updating..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
