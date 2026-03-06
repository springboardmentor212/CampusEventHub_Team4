import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
    Calendar, MapPin, Clock, Users, ArrowLeft,
    ShieldCheck, ListChecks, Info, ChevronRight,
    Sparkles, Zap, GraduationCap, Building2,
    CalendarCheck, AlertCircle, Share2
} from "lucide-react";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await API.get(`/events/${id}`);
                setEvent(res.data.data.event);
            } catch (err) {
                toast.error("Event retrieval failure. Asset might be archived.");
                navigate("/student");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const handleRegister = async () => {
        setRegistering(true);
        const loadingToast = toast.loading("Verifying credentials and capacity...");
        try {
            await API.post(`/registrations/register/${id}`);
            toast.success("Registration protocol complete. Check your dashboard.", { id: loadingToast });
            navigate("/student");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration conflict detected.", { id: loadingToast });
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Event Asset...</span>
                </div>
            </div>
        </DashboardLayout>
    );

    if (!event) return null;

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                {/* Upper Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Feed
                    </button>
                    <div className="flex gap-3">
                        <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Banner Asset */}
                        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 aspect-video shadow-2xl shadow-slate-200/50 group">
                            <img
                                src={event.bannerImage || "/images/campus_life_professional.png"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                alt={event.title}
                            />
                            <div className="absolute top-6 left-6 flex gap-2">
                                <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-100 shadow-sm flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                    {event.category}
                                </span>
                            </div>
                        </div>

                        {/* Title & Organization */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Organizer</p>
                                        <p className="font-bold text-slate-700">{event.college?.name}</p>
                                    </div>
                                </div>
                                <div className="h-6 w-px bg-slate-100 hidden md:block"></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Eligibility</p>
                                        <p className="font-bold text-slate-700">Open for all students</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Info className="w-5 h-5 text-indigo-500" />
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Narrative & Context</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>

                        {/* Requirements Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Dos & Don'ts */}
                            <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 tracking-tight">Institutional Protocol</h3>
                                </div>
                                <ul className="space-y-4">
                                    {event.dosAndDonts?.length > 0 ? event.dosAndDonts.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm font-semibold text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></div>
                                            {item}
                                        </li>
                                    )) : <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">No restricted protocols listed.</span>}
                                </ul>
                            </div>

                            {/* Asset Requirements */}
                            <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <ListChecks className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 tracking-tight">Asset Prerequisites</h3>
                                </div>
                                <ul className="space-y-4">
                                    {event.requirements?.length > 0 ? event.requirements.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm font-semibold text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></div>
                                            {item}
                                        </li>
                                    )) : <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Standard campus equipment only.</span>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Details & Action */}
                    <div className="space-y-8">
                        <div className="premium-card sticky top-8">
                            <div className="space-y-8">
                                {/* Time & Location Container */}
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-indigo-600 shrink-0">
                                            <CalendarCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Chronology</p>
                                            <p className="font-bold text-slate-900 mt-1">{startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-xs text-slate-500 font-bold">{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-indigo-600 shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Geography</p>
                                            <p className="font-bold text-slate-900 mt-1">{event.location}</p>
                                            <p className="text-xs text-slate-500 font-bold">Standard Campus Access</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-indigo-600 shrink-0">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Availability</p>
                                            <p className="font-bold text-slate-900 mt-1">
                                                {event.maxParticipants ? `${event.maxParticipants - event.currentParticipants} Spots Reserved` : "Public Admission"}
                                            </p>
                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: event.maxParticipants ? `${(event.currentParticipants / event.maxParticipants) * 100}%` : '20%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Action */}
                                <div className="pt-8 border-t border-slate-100 space-y-4">
                                    <button
                                        onClick={handleRegister}
                                        disabled={registering || isFull}
                                        className={`w-full hero-btn py-5 text-base flex flex-col gap-1 ${isFull ? 'bg-slate-200 cursor-not-allowed opacity-70' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Zap className={`w-4 h-4 ${registering ? 'animate-spin' : ''}`} />
                                            {isFull ? "Admission Threshold Reached" : "Request Admission"}
                                        </div>
                                        {!isFull && <span className="text-[10px] font-black opacity-60 uppercase tracking-tighter">Requires ID Verification</span>}
                                    </button>

                                    <div className="flex items-center gap-2 justify-center py-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Small */}
                        <div className="px-4 text-center">
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                Protocol ID: {event._id.slice(-12)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EventDetails;
