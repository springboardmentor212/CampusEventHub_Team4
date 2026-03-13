import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
    User,
    Mail,
    Phone,
    BookOpen,
    LayoutGrid,
    Building2,
    Save,
    ShieldCheck,
    CreditCard,
    Award,
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
        academicClass: user?.academicClass || "",
        section: user?.section || ""
    });

    const totalParticipated = user?.participatedEvents?.length || 0;
    const upcomingCount = user?.futureEvents?.length || 0;
    const pendingCount = user?.pendingRegistrations?.length || 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading("Saving profile changes...");
        try {
            await API.put("/auth/profile", form);
            await loadUser();
            toast.success("Profile updated successfully!", { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-[2px] w-8 bg-indigo-600 rounded-full"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Personal Identity</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">My Account Profile</h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage your personal information and academic credentials.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left side: Avatar and Badges */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm text-center">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 bg-indigo-100 rounded-[2rem] flex items-center justify-center border-4 border-indigo-50 shadow-inner group overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <User className="w-12 h-12 text-indigo-600" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Update</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">{user?.firstName} {user?.lastName}</h2>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">{user?.role?.replace('_', ' ')}</p>

                            <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center">
                                    <Award className="w-5 h-5 text-amber-500 mb-2" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Attended</span>
                                    <span className="text-sm font-bold text-slate-900">{totalParticipated}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center">
                                    <CreditCard className="w-5 h-5 text-indigo-500 mb-2" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Upcoming</span>
                                    <span className="text-sm font-bold text-slate-900">{upcomingCount}</span>
                                </div>
                            </div>
                            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Pending Approvals: {pendingCount}</p>
                            </div>
                        </section>

                        <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-indigo-400">Security Note</h3>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">Keep your profile details updated to ensure smooth event registration and certificate generation.</p>
                                <button className="mt-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white hover:text-indigo-300 transition-colors">
                                    <BookOpen className="w-4 h-4" /> Usage Guidelines
                                </button>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                        </section>
                    </div>

                    {/* Right side: Edit Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                                <div className="p-3 rounded-2xl bg-slate-900 text-white">
                                    <LayoutGrid className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Credential Management</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Edit your account specifications.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    label="First Name"
                                    icon={User}
                                    value={form.firstName}
                                    required
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                />
                                <FormInput
                                    label="Last Name"
                                    icon={User}
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    label="Email Address (Locked)"
                                    icon={Mail}
                                    value={user?.email || ""}
                                    disabled
                                />
                                <FormInput
                                    label="Mobile Number"
                                    icon={Phone}
                                    placeholder="+91 00000 00000"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    label="Academic Class"
                                    icon={BookOpen}
                                    placeholder="e.g. B.Tech III Year"
                                    value={form.academicClass}
                                    onChange={(e) => setForm({ ...form, academicClass: e.target.value })}
                                />
                                <FormInput
                                    label="Section"
                                    icon={Hash}
                                    placeholder="e.g. CSE-A"
                                    value={form.section}
                                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                                />
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl text-slate-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrolled Institution</p>
                                    <p className="text-sm font-bold text-slate-700">{user?.college?.name ? `${user.college.name} (${user.college.code || 'N/A'})` : 'Not linked to a college yet'}</p>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="hero-btn px-12 py-5 italic shadow-3xl shadow-indigo-100/50"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? "Syncing..." : "Save Identity"}
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
