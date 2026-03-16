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
    Hash
} from "lucide-react";
import FormInput from "../components/FormInput";

const Profile = () => {
    const { user, loadUser } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
        email: user?.email || ""
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

    const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
    const isCollegeAdmin = user?.role === 'college_admin';
    const collegeName = user?.role === 'admin'
        ? "Not associated with any college"
        : (typeof user?.college === 'object' ? user?.college?.name : (user?.collegeName || user?.college || "No college assigned"));

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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black mx-auto">
                                {initials}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 text-center mt-4">{user?.firstName} {user?.lastName}</h2>
                            <div className="text-center mt-3">
                                <span className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                    {isCollegeAdmin ? 'College Admin' : user?.role === 'admin' ? 'Superadmin' : 'Student'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 text-center mt-3">{collegeName}</p>
                            <p className="text-xs text-slate-400 text-center mt-1">Member since {new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>

                            {isCollegeAdmin && (
                                <div className="mt-6 grid grid-cols-3 gap-2">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                                        <p className="text-lg font-black text-slate-900">—</p>
                                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Live Events</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                                        <p className="text-lg font-black text-slate-900">—</p>
                                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Total Registrations</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                                        <p className="text-lg font-black text-slate-900">—</p>
                                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Avg Rating</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        {/* Profile Info Form */}
                        <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-900 rounded-2xl text-white">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 italic">Personal Information</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="First Name" icon={User} required value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} />
                                <FormInput label="Last Name" icon={User} required value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} />
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <FormInput label="Email Address" icon={Mail} value={form.email || user?.email || ""} onChange={(e) => setForm({...form, email: e.target.value})} />
                                    <p className="text-xs text-amber-600 font-medium mt-2">Changing your email will require re-verification</p>
                                </div>
                                <FormInput label="Phone Number" icon={Phone} required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />

                                {isCollegeAdmin && (
                                    <div>
                                        <FormInput label="College" icon={LayoutGrid} value={collegeName} disabled />
                                        <p className="text-xs text-slate-400 font-medium mt-2">College cannot be changed</p>
                                    </div>
                                )}

                                {user?.role === 'student' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormInput label="College ID" icon={Hash} value={user?.officialId || ""} disabled />
                                        <FormInput label="Department" icon={LayoutGrid} value={user?.department || "General"} disabled />
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
                                    {loading ? "Saving..." : "Save Changes"}
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
