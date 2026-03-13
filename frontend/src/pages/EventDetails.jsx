import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
    Calendar, MapPin, Clock, Users, ArrowLeft,
    ShieldCheck, ListChecks, Info, ChevronRight,
    Sparkles, Zap, GraduationCap, Building2,
    CalendarCheck, AlertCircle, Share2, ClipboardList,
    CheckCircle2, XCircle, Rocket, Layers, ShieldAlert,
    FileText, UserCircle
} from "lucide-react";

const normalizeList = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeRequirements = (requirements) => {
    if (!Array.isArray(requirements)) {
        return [];
    }

    return requirements
        .map((requirement) => ({
            ...requirement,
            fieldType: requirement.fieldType || requirement.type || "text",
            label: requirement.label || "Additional field",
        }))
        .filter((requirement) => requirement.label);
};

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [showRegModal, setShowRegModal] = useState(false);
    const [customResponses, setCustomResponses] = useState({});

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await API.get(`/events/${id}`);
                setEvent(res.data.data.event);
            } catch (err) {
                toast.error("Event retrieval failure. Asset might be archived.");
                navigate("/campus-feed");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const handleRegister = async () => {
        const requiresRegistrationDetails = event.isTeamEvent || event.participationRequirements?.length > 0;

        if (requiresRegistrationDetails && !showRegModal) {
            setShowRegModal(true);
            return;
        }

        setRegistering(true);
        const loadingToast = toast.loading("Verifying credentials and capacity...");
        try {
            await API.post(`/registrations/register/${id}`, {
                customResponses
            });
            toast.success("Registration protocol complete. Check your dashboard.", { id: loadingToast });
            navigate("/campus-feed");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration conflict detected.", { id: loadingToast });
        } finally {
            setRegistering(false);
            setShowRegModal(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Querying Event Asset...</span>
                </div>
            </div>
        </DashboardLayout>
    );

    if (!event) return null;

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
    const rules = normalizeList(event.dosAndDonts);
    const requirements = normalizeList(event.requirements);
    const participationRequirements = normalizeRequirements(event.participationRequirements);
    const categoryLabel = event.category === "other" ? (event.customCategory || "Other") : event.category;
    const spotsLeft = event.maxParticipants ? Math.max(event.maxParticipants - event.currentParticipants, 0) : null;
    const registrationClosed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;
    const actionDisabled = registering || event.status === "cancelled" || registrationClosed;
    const actionLabel = isFull ? "Join Waitlist" : "Secure Entry";

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                {/* Upper Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest transition-all group italic"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to Feed
                    </button>
                    <div className="flex gap-3">
                        <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Banner Asset */}
                        <div className="relative rounded-[3rem] overflow-hidden bg-slate-100 border border-slate-200 aspect-video shadow-3xl shadow-slate-200/40 group">
                            <img
                                src={event.bannerImage || "/images/campus_life_professional.png"}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                                alt={event.title}
                            />
                            <div className="absolute top-8 left-8 flex gap-3">
                                <span className="bg-white/95 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-100 shadow-xl flex items-center gap-2 italic">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    {categoryLabel}
                                </span>
                                {event.isTeamEvent && (
                                    <span className="bg-indigo-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 italic">
                                        <Users className="w-3.5 h-3.5" />
                                        {(event.participationMode || "team").toUpperCase()} Admission
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Title & Organization */}
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none italic">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-8 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Organizer</p>
                                        <p className="font-bold text-slate-700 text-lg mt-1">{event.college?.name}</p>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Eligibility</p>
                                        <p className="font-bold text-slate-700 text-lg mt-1">Institutional Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <section className="space-y-8 bg-slate-50/30 rounded-[3rem] p-10 border border-slate-100/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-slate-900 text-white">
                                    <Info className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">About Event</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-xl font-medium whitespace-pre-wrap">
                                {event.description || "Event details will be announced by the organizing college."}
                            </p>
                        </section>

                        {/* Requirements Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs italic">Important Rules</h3>
                                </div>
                                <ul className="space-y-5">
                                    {rules.length > 0 ? rules.map((item, idx) => (
                                        <li key={idx} className="flex gap-4 text-sm font-semibold text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-sm shadow-emerald-200"></div>
                                            {item}
                                        </li>
                                    )) : <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Default campus safety standards apply.</span>}
                                </ul>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                                        <ListChecks className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs italic">Requirements</h3>
                                </div>
                                <ul className="space-y-5">
                                    {requirements.length > 0 ? requirements.map((item, idx) => (
                                        <li key={idx} className="flex gap-4 text-sm font-semibold text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-sm shadow-amber-200"></div>
                                            {item}
                                        </li>
                                    )) : <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Standard personnel kit expected.</span>}
                                </ul>
                            </div>
                        </div>

                        {/* Custom Participation Fields Preview */}
                        {participationRequirements.length > 0 && (
                            <section className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-200">
                                <div className="flex items-center gap-4 mb-8">
                                    <Rocket className="w-8 h-8 opacity-80" />
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tight">Additional Fields.</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Admission requires dynamic data</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-90">
                                    {participationRequirements.map((req, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                                            <div className="w-2 h-2 rounded-full bg-white/40"></div>
                                            <span className="text-xs font-black uppercase tracking-widest">{req.label}</span>
                                            <span className="text-[8px] rounded-full border border-white/15 px-2 py-1 uppercase tracking-[0.2em] opacity-75">{req.fieldType}</span>
                                            {req.isRequired && <span className="text-[8px] bg-white text-indigo-600 px-1.5 py-0.5 rounded font-black italic ml-auto">REQ</span>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar: Details & Action */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 sticky top-8">
                            <div className="space-y-10">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-indigo-600 shrink-0">
                                            <CalendarCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Event Timing</p>
                                            <p className="font-extrabold text-slate-900 mt-2 text-lg leading-tight">{startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1 italic">{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-indigo-600 shrink-0">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Event Location</p>
                                            <p className="font-extrabold text-slate-900 mt-2 text-lg leading-tight">{event.location}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Campus Ground Access</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-indigo-600 shrink-0">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Event Capacity</p>
                                            <p className="font-extrabold text-slate-900 mt-2 text-lg leading-tight">
                                                {spotsLeft !== null ? `${spotsLeft} Spots Open` : "Open Admission"}
                                            </p>
                                            {event.isTeamEvent && (
                                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1 italic">Teams of {event.minTeamSize}—{event.maxTeamSize} members</p>
                                            )}
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 rounded-full"
                                                    style={{ width: event.maxParticipants ? `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%` : '15%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-100 space-y-6">
                                    <button
                                        onClick={handleRegister}
                                        disabled={actionDisabled}
                                        className={`w-full premium-btn py-6 flex flex-col gap-1 items-center justify-center relative group overflow-hidden ${actionDisabled ? 'bg-slate-200 cursor-not-allowed opacity-70' : 'bg-slate-900 text-white'}`}
                                    >
                                        <div className="flex items-center gap-2 relative z-10 transition-transform group-hover:scale-110">
                                            <Zap className={`w-5 h-5 ${registering ? 'animate-spin' : ''}`} />
                                            <span className="font-black uppercase tracking-widest text-sm italic">{actionLabel}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    </button>

                                    <div className="flex items-center gap-3 justify-center">
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                            Deadline: {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'Open until capacity is reached'}
                                        </p>
                                    </div>
                                    {isFull && (
                                        <p className="text-center text-xs font-bold text-indigo-600">This event is full. New submissions will be added to the waitlist automatically.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 px-8 text-center text-slate-300">
                            <ShieldAlert className="w-6 h-6 opacity-30" />
                            <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                                Admission involves automatic institutional ID verification. False credentials may result in blacklist protocols.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showRegModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/60 transition-all animate-fade-in">
                    <div className="bg-white rounded-[4rem] p-12 max-w-md w-full shadow-4xl animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>

                        <header className="mb-10 text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                                <ClipboardList className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 italic tracking-tight">Final Verification.</h2>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">{event.title}</p>
                        </header>

                        <div className="space-y-8">
                            {event.isTeamEvent && (
                                <>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Team Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-indigo-50/30 border border-indigo-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                            placeholder="Enter your team's name..."
                                            required
                                            onChange={(e) => setCustomResponses((prev) => ({ ...prev, "Team Name": e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Team Member Emails <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            className="w-full bg-indigo-50/30 border border-indigo-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                            placeholder={`Emails of exactly ${event.maxTeamSize - 1} other members`}
                                            required
                                            rows={2}
                                            onChange={(e) => setCustomResponses((prev) => ({ ...prev, "Team Members": e.target.value }))}
                                        />
                                    </div>
                                </>
                            )}
                            {participationRequirements.map((req, idx) => (
                                <div key={idx} className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {req.label}
                                        {req.isRequired && <span className="text-rose-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        {req.fieldType === 'text' && (
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                                placeholder={`Enter ${req.label.toLowerCase()}...`}
                                                required={req.isRequired}
                                                onChange={(e) => setCustomResponses((prev) => ({ ...prev, [req.label]: e.target.value }))}
                                            />
                                        )}
                                        {req.fieldType === 'number' && (
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                                required={req.isRequired}
                                                onChange={(e) => setCustomResponses((prev) => ({ ...prev, [req.label]: e.target.value }))}
                                            />
                                        )}
                                        {req.fieldType === 'email' && (
                                            <input
                                                type="email"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                                placeholder="institutional@domain.com"
                                                required={req.isRequired}
                                                onChange={(e) => setCustomResponses((prev) => ({ ...prev, [req.label]: e.target.value }))}
                                            />
                                        )}
                                        {req.fieldType === 'file' && (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    className="w-full opacity-0 absolute inset-0 cursor-pointer z-10"
                                                    required={req.isRequired}
                                                    onChange={(e) => setCustomResponses((prev) => ({ ...prev, [req.label]: e.target.files[0]?.name }))}
                                                />
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 flex items-center justify-between group-hover:bg-slate-100 transition-colors">
                                                    <span className="text-slate-400 text-xs font-bold">{customResponses[req.label] || "Select File Asset"}</span>
                                                    <FileText className="w-4 h-4 text-slate-300" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 space-y-4">
                            <button
                                onClick={handleRegister}
                                disabled={registering}
                                className="hero-btn w-full py-5 bg-slate-900 text-white italic"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Commit Admission
                            </button>
                            <button
                                onClick={() => setShowRegModal(false)}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Revert Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default EventDetails;
