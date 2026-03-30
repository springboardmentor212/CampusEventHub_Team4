import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import ImageUpload from "../components/ImageUpload";
import { createEvent } from "../services/eventService";
import {
    MapPin,
    Type,
    Calendar,
    Users,
    ListRestart,
    ArrowRight,
    ChevronDown,
    Clock,
    FileText,
    Target,
    ShieldAlert,
    Image as ImageIcon,
    Zap,
    Trash2,
    Settings,
    Activity,
    Layers,
    Globe,
    CreditCard,
    CheckCircle2,
    AlertTriangle,
    Plus
} from "lucide-react";

const CreateEvent = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "workshop",
        location: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        maxParticipants: "",
        requirements: [""],
        dosAndDonts: [""],
        bannerImage: "",
        audience: "all_colleges",
        isTeamEvent: false,
        minTeamSize: "1",
        maxTeamSize: "4",
        participationMode: "solo"
    });
    const [customCategory, setCustomCategory] = useState("");

    const categories = [
        { value: "workshop", label: "Workshop" },
        { value: "seminar", label: "Seminar" },
        { value: "cultural", label: "Cultural" },
        { value: "sports", label: "Sports" },
        { value: "technical", label: "Technical" },
        { value: "hackathon", label: "Hackathon" },
        { value: "other", label: "Other" },
    ];

    const addListItem = (fieldName) => {
        setForm((prev) => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), ""]
        }));
    };

    const updateListItem = (fieldName, index, value) => {
        setForm((prev) => ({
            ...prev,
            [fieldName]: (prev[fieldName] || []).map((item, itemIndex) => (
                itemIndex === index ? value : item
            ))
        }));
    };

    const removeListItem = (fieldName, index) => {
        setForm((prev) => {
            const nextItems = (prev[fieldName] || []).filter((_, itemIndex) => itemIndex !== index);
            return {
                ...prev,
                [fieldName]: nextItems.length ? nextItems : [""]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const loadingToast = toast.loading("Publishing your event proposal...");

        const resolvedCategory = form.category;
        const resolvedCustomCategory = form.category === "other" ? customCategory.trim() : "";

        if (form.category === "other" && !resolvedCustomCategory) {
            toast.error("Please enter a custom category name.", { id: loadingToast });
            setSubmitting(false);
            return;
        }

        const requirementsArray = (form.requirements || []).map((req) => req.trim()).filter((req) => req !== "");
        const dosArray = (form.dosAndDonts || []).map((item) => item.trim()).filter((item) => item !== "");

        if (!requirementsArray.length) {
            toast.error("Add at least one requirement checklist item.", { id: loadingToast });
            setSubmitting(false);
            return;
        }

        if (!dosArray.length) {
            toast.error("Add at least one important rule.", { id: loadingToast });
            setSubmitting(false);
            return;
        }

        // Validate date ordering
        if (form.registrationDeadline && form.startDate) {
            if (new Date(form.registrationDeadline) >= new Date(form.startDate)) {
                toast.error("Registration deadline must be before the event start time.", { id: loadingToast });
                setSubmitting(false);
                return;
            }
        }
        if (form.startDate && form.endDate) {
            if (new Date(form.startDate) >= new Date(form.endDate)) {
                toast.error("Event start time must be before the end time.", { id: loadingToast });
                setSubmitting(false);
                return;
            }
        }

        try {
            const res = await createEvent({
                ...form,
                category: resolvedCategory,
                customCategory: resolvedCustomCategory,
                requirements: requirementsArray,
                dosAndDonts: dosArray,
                participationRequirements: [],
                maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null
            });

            toast.success("Proposal submitted!", { id: loadingToast });
            setSuccessData(res.data?.data || { status: 'success' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create event.", { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    if (successData) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto py-20 animate-fade-in text-center">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Event Submitted!</h1>
                    <p className="text-slate-500 font-medium text-lg mb-10 leading-relaxed">
                        Your event proposal has been received. It is now pending review by the system administrators.
                        You will be notified once it goes live.
                    </p>

                    {successData.warnings?.includes('DUPLICATE_FOUND') && (
                        <div className="mb-10 p-6 bg-amber-50 border border-amber-200 rounded-32xl text-left flex items-start gap-4">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 flex-shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 mb-1">Potential Duplicate Detected</h4>
                                <p className="text-sm text-amber-700 font-medium">
                                    Our system found a similar event already exists around this time.
                                    Admins will specifically review this for uniqueness before approval.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate("/manage-events")}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                        >
                            Go to Manage Events
                        </button>
                        <button
                            onClick={() => setSuccessData(null)}
                            className="px-8 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                        >
                            Create Another
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
                {/* Header Section */}
                <header className="rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Event Creator</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Create a New Event</h1>
                            <p className="text-slate-500 mt-2 font-medium max-w-xl">Publish your vision. Once approved, your event will reach thousands of students across campuses.</p>
                        </div>
                        <button onClick={() => navigate(-1)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">Discard</button>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8" autoComplete="off">
                    {/* Left Column: Visual & Configuration */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Visual Identity */}
                        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Cover Identity</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Premium banner for your event card</p>
                                </div>
                            </div>

                            <ImageUpload
                                label="Event Banner"
                                onUpload={(url) => setForm(f => ({ ...f, bannerImage: url }))}
                                defaultValue={form.bannerImage}
                            />
                        </section>

                        {/* 2. Primary Configuration */}
                        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Core Details</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define the essence of the event</p>
                                </div>
                            </div>

                            <FormInput
                                label="Event Title"
                                icon={Type}
                                required
                                placeholder="e.g. TEDx Campus: The Future of AI"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Category"
                                    icon={Target}
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    suffix={<ChevronDown className="w-4 h-4 text-slate-400" />}
                                >
                                    {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                </FormInput>

                                <FormInput
                                    label="Location"
                                    icon={MapPin}
                                    required
                                    placeholder="e.g. Main Hall, Tech Lab 2"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </div>

                            {form.category === "other" && (
                                <FormInput
                                    label="Custom Category Name"
                                    icon={Type}
                                    required
                                    placeholder="Enter custom category"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                />
                            )}

                            <FormInput
                                label="Description"
                                icon={FileText}
                                type="textarea"
                                required
                                placeholder="What's the agenda? Why should students attend?"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={6}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rules & Integrity</p>
                                        <button
                                            type="button"
                                            onClick={() => addListItem("dosAndDonts")}
                                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 transition-all"
                                        >
                                            <Plus className="w-4 h-4 text-indigo-600" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(form.dosAndDonts || []).map((rule, idx) => (
                                            <div key={`rule-${idx}`} className="flex items-center gap-2 group/item">
                                                <input
                                                    type="text"
                                                    value={rule}
                                                    onChange={(e) => updateListItem("dosAndDonts", idx, e.target.value)}
                                                    placeholder={`Policy ${idx + 1}`}
                                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeListItem("dosAndDonts", idx)}
                                                    className="p-2.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Requirements</p>
                                        <button
                                            type="button"
                                            onClick={() => addListItem("requirements")}
                                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 transition-all"
                                        >
                                            <Plus className="w-4 h-4 text-indigo-600" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(form.requirements || []).map((requirement, idx) => (
                                            <div key={`requirement-${idx}`} className="flex items-center gap-2 group/item">
                                                <input
                                                    type="text"
                                                    value={requirement}
                                                    onChange={(e) => updateListItem("requirements", idx, e.target.value)}
                                                    placeholder={`Must-have ${idx + 1}`}
                                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeListItem("requirements", idx)}
                                                    className="p-2.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Timeline & Authority */}
                    <div className="space-y-8">
                        {/* 4. Chronology Details */}
                        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 sticky top-24">
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Logistics</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control access and timing</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <FormInput
                                    label="Registration Deadline"
                                    icon={Clock}
                                    type="datetime-local"
                                    value={form.registrationDeadline}
                                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                                />

                                <FormInput
                                    label="Event Start"
                                    icon={Calendar}
                                    type="datetime-local"
                                    required
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                />

                                <FormInput
                                    label="Event End"
                                    icon={Calendar}
                                    type="datetime-local"
                                    required
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                />
                            </div>

                            <div className="pt-8 border-t border-slate-50 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Maximum Spots</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            placeholder="e.g. 150"
                                            className="w-full bg-slate-50 border-none rounded-2xl px-12 py-4 text-sm font-black text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-100 transition"
                                            value={form.maxParticipants}
                                            onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Audience</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100"
                                            value={form.audience}
                                            onChange={(e) => setForm({ ...form, audience: e.target.value })}
                                        >
                                            <option value="my_college">Intracollegiate</option>
                                            <option value="all_colleges">Intercollegiate</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Mode</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100"
                                            value={form.participationMode}
                                            onChange={(e) => {
                                                const mode = e.target.value;
                                                const isTeam = mode !== "solo";
                                                let sizes = { min: "1", max: "1" };
                                                if (mode === "duo") sizes = { min: "2", max: "2" };
                                                if (mode === "trio") sizes = { min: "3", max: "3" };
                                                if (mode === "quad") sizes = { min: "4", max: "4" };

                                                setForm({
                                                    ...form,
                                                    participationMode: mode,
                                                    isTeamEvent: isTeam,
                                                    minTeamSize: sizes.min,
                                                    maxTeamSize: sizes.max
                                                });
                                            }}
                                        >
                                            <option value="solo">Solo</option>
                                            <option value="duo">Duo (2)</option>
                                            <option value="trio">Trio (3)</option>
                                            <option value="quad">Quad (4)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 px-6 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-0 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 fill-white" />
                                            Publish Event Proposal
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest mt-4 leading-relaxed px-6">
                                    By publishing, you agree to our community guidelines. Proposal requires superadmin approval.
                                </p>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CreateEvent;
