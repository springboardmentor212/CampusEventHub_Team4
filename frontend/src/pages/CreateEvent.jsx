import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import ImageUpload from "../components/ImageUpload";
import {
    Plus,
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
    CreditCard
} from "lucide-react";

const CreateEvent = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "Workshop",
        location: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        maxParticipants: "",
        requirements: "",
        dosAndDonts: "",
        bannerImage: "",
        isTeamEvent: false,
        minTeamSize: "1",
        maxTeamSize: "4",
        participationMode: "solo",
        participationRequirements: [] // Dynamic fields
    });

    const categories = ["Workshop", "Seminar", "Cultural", "Sports", "Technical", "Hackathon", "Other"];

    const addRequirement = () => {
        setForm({
            ...form,
            participationRequirements: [
                ...form.participationRequirements,
                { label: "", fieldType: "text", isRequired: true }
            ]
        });
    };

    const removeRequirement = (index) => {
        const updated = [...form.participationRequirements];
        updated.splice(index, 1);
        setForm({ ...form, participationRequirements: updated });
    };

    const updateRequirement = (index, field, value) => {
        const updated = [...form.participationRequirements];
        updated[index][field] = value;
        setForm({ ...form, participationRequirements: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Creating your event...");

        const requirementsArray = form.requirements
            ? form.requirements.split(",").map(req => req.trim()).filter(req => req !== "")
            : [];

        const dosArray = form.dosAndDonts
            ? form.dosAndDonts.split(",").map(d => d.trim()).filter(d => d !== "")
            : [];

        // ─── Validate date ordering ────────────────────────────
        if (form.registrationDeadline && form.startDate) {
            if (new Date(form.registrationDeadline) >= new Date(form.startDate)) {
                toast.error("Registration deadline must be before the event start time.", { id: loadingToast });
                return;
            }
        }
        if (form.startDate && form.endDate) {
            if (new Date(form.startDate) >= new Date(form.endDate)) {
                toast.error("Event start time must be before the end time.", { id: loadingToast });
                return;
            }
        }

        try {
            await API.post("/events/create", {
                ...form,
                category: form.category.toLowerCase(),
                requirements: requirementsArray,
                dosAndDonts: dosArray,
                maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null
            });
            toast.success("Event created successfully!", { id: loadingToast });
            navigate("/manage-events");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create event. Please try again.", { id: loadingToast });
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Create Event</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">Create a New Event.</h1>
                        <p className="text-slate-500 mt-3 font-medium text-lg">Fill in the details below to publish your event for students.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Visual & Configuration */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* 1. Visual Identity */}
                        <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Cover Image</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Banner image displayed on the event card.</p>
                                </div>
                            </div>

                            <ImageUpload
                                label="Event Banner"
                                onUpload={(url) => setForm({ ...form, bannerImage: url })}
                            />
                        </section>

                        {/* 2. Primary Configuration */}
                        <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-10">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                                <div className="p-3 rounded-2xl bg-slate-900 text-white">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Event Details</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Basic information about your event.</p>
                                </div>
                            </div>

                            <FormInput
                                label="Event Title"
                                icon={Type}
                                required
                                placeholder="e.g. Annual Robotics Workshop 2026"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <FormInput
                                    label="Category"
                                    icon={Target}
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    suffix={<ChevronDown className="w-4 h-4 text-slate-400" />}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </FormInput>

                                <FormInput
                                    label="Location"
                                    icon={MapPin}
                                    required
                                    placeholder="e.g. Central Auditorium, Block B"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </div>

                            <FormInput
                                label="Description"
                                icon={FileText}
                                type="textarea"
                                required
                                placeholder="Describe what this event is about, what students can expect..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={6}
                            />
                        </section>

                        {/* 3. Participation Protocol (Dynamic Fields) */}
                        <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8">
                            <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Additional Fields</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Add custom questions to collect from students during registration.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addRequirement}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Field
                                </button>
                            </div>

                            <div className="space-y-4">
                                {form.participationRequirements.length === 0 ? (
                                    <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No extra fields added. Only Student ID required by default.</p>
                                    </div>
                                ) : (
                                    form.participationRequirements.map((req, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 bg-slate-50 rounded-[2rem] animate-fade-in relative group">
                                            <div className="flex-1 space-y-4">
                                                <FormInput
                                                    label="Field Name"
                                                    placeholder="e.g. Team Name, Year of Study, etc."
                                                    value={req.label}
                                                    onChange={(e) => updateRequirement(idx, "label", e.target.value)}
                                                />
                                                <div className="flex gap-4">
                                                    <select
                                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold font-black text-slate-600 uppercase tracking-tighter"
                                                        value={req.fieldType}
                                                        onChange={(e) => updateRequirement(idx, "fieldType", e.target.value)}
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="number">Number</option>
                                                        <option value="email">Email</option>
                                                        <option value="file">File Upload</option>
                                                    </select>
                                                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            className="w-3.5 h-3.5 rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                            checked={req.isRequired}
                                                            onChange={(e) => updateRequirement(idx, "isRequired", e.target.checked)}
                                                        />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">Required</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeRequirement(idx)}
                                                className="md:self-start p-2 text-rose-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Timeline & Authority */}
                    <div className="space-y-12">
                        {/* 4. Chronology Details */}
                        <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-10 sticky top-8">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Schedule</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Event dates and times.</p>
                                </div>
                            </div>

                            <FormInput
                                label="Registration Closes At"
                                icon={Clock}
                                type="datetime-local"
                                value={form.registrationDeadline}
                                onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                            />

                            <FormInput
                                label="Event Start Date & Time"
                                icon={Calendar}
                                type="datetime-local"
                                required
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            />

                            <FormInput
                                label="Event End Date & Time"
                                icon={Calendar}
                                type="datetime-local"
                                required
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            />

                            <div className="pt-6 space-y-6 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-600">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Maximum Capacity</p>
                                        <input
                                            type="number"
                                            placeholder="e.g. 500"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
                                            value={form.maxParticipants}
                                            onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Participation Style</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Select team configuration</p>
                                    </div>
                                    <select
                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100"
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
                                        <option value="solo">Solo (Individual)</option>
                                        <option value="duo">Duo (2 Members)</option>
                                        <option value="trio">Trio (3 Members)</option>
                                        <option value="quad">Quad (4 Members)</option>
                                    </select>
                                </div>

                                {form.isTeamEvent && (
                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-fade-in">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-3.5 h-3.5 text-indigo-600" />
                                            <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Team Lockdown</p>
                                        </div>
                                        <p className="text-[10px] text-indigo-600 font-medium leading-relaxed">
                                            Event restricted to exactly {form.maxTeamSize} participants per team.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-10">
                                <button type="submit" className="hero-btn w-full py-6 group shadow-3xl shadow-indigo-100 italic">
                                    <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                    Publish Event
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest mt-6">Needs admin approval before going live</p>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CreateEvent;
