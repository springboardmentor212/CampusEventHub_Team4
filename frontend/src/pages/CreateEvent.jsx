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
        const loadingToast = toast.loading("Broadcasting Institutional Asset...");

        const requirementsArray = form.requirements
            ? form.requirements.split(",").map(req => req.trim()).filter(req => req !== "")
            : [];

        const dosArray = form.dosAndDonts
            ? form.dosAndDonts.split(",").map(d => d.trim()).filter(d => d !== "")
            : [];

        try {
            await API.post("/events/create", {
                ...form,
                category: form.category.toLowerCase(),
                requirements: requirementsArray,
                dosAndDonts: dosArray,
                maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null
            });
            toast.success("Event Broadcast: Active.", { id: loadingToast });
            navigate("/manage-events");
        } catch (err) {
            toast.error(err.response?.data?.message || "Protocol Interruption", { id: loadingToast });
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Event Architect</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Operations Mode</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">Initialize New Event.</h1>
                        <p className="text-slate-500 mt-3 font-medium text-lg">Define parameters, protocols, and visual identity for campus-wide broadcast.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Abort Deployment</button>
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
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Visual Identity</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Banner asset for global discovery.</p>
                                </div>
                            </div>

                            <ImageUpload
                                label="Event Hero Asset"
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
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Logical Architecture</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Core identity and narrative parameters.</p>
                                </div>
                            </div>

                            <FormInput
                                label="Institutional Title"
                                icon={Type}
                                required
                                placeholder="e.g. Annual Advanced Robotics Seminar 2026"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <FormInput
                                    label="Classification"
                                    icon={Target}
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    suffix={<ChevronDown className="w-4 h-4 text-slate-400" />}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </FormInput>

                                <FormInput
                                    label="Geography / Location"
                                    icon={MapPin}
                                    required
                                    placeholder="e.g. Central Auditorium, Block B"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </div>

                            <FormInput
                                label="Narrative Intelligence (Description)"
                                icon={FileText}
                                type="textarea"
                                required
                                placeholder="Outline the core objectives, mission, and scope of this event..."
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
                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Participation Protocol</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Define custom data capture requirements.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addRequirement}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Attribute
                                </button>
                            </div>

                            <div className="space-y-4">
                                {form.participationRequirements.length === 0 ? (
                                    <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Default Student ID only.</p>
                                    </div>
                                ) : (
                                    form.participationRequirements.map((req, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 bg-slate-50 rounded-[2rem] animate-fade-in relative group">
                                            <div className="flex-1 space-y-4">
                                                <FormInput
                                                    label="Field Prompt (Label)"
                                                    placeholder="e.g. Department, Laptop Serial, etc."
                                                    value={req.label}
                                                    onChange={(e) => updateRequirement(idx, "label", e.target.value)}
                                                />
                                                <div className="flex gap-4">
                                                    <select
                                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold font-black text-slate-600 uppercase tracking-tighter"
                                                        value={req.fieldType}
                                                        onChange={(e) => updateRequirement(idx, "fieldType", e.target.value)}
                                                    >
                                                        <option value="text">Text Input</option>
                                                        <option value="number">Numeric</option>
                                                        <option value="email">Email Mask</option>
                                                        <option value="file">File Asset</option>
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
                                                onClick={() => removeRequirement(index)}
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
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Chronology</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Deployment timeline.</p>
                                </div>
                            </div>

                            <FormInput
                                label="Window Start (Live)"
                                icon={Calendar}
                                type="datetime-local"
                                required
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            />

                            <FormInput
                                label="Window End (Archive)"
                                icon={Calendar}
                                type="datetime-local"
                                required
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            />

                            <FormInput
                                label="Registration Cut-off"
                                icon={Clock}
                                type="datetime-local"
                                value={form.registrationDeadline}
                                onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                            />

                            <div className="pt-6 space-y-6 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-600">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendance Threshold</p>
                                        <input
                                            type="number"
                                            placeholder="Max capacity (e.g. 500)"
                                            className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 placeholder:text-slate-200 outline-none"
                                            value={form.maxParticipants}
                                            onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10">
                                <button type="submit" className="hero-btn w-full py-6 group shadow-3xl shadow-indigo-100 italic">
                                    <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                    Initialize Broadcast
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest mt-6">Protocol Verification Required</p>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CreateEvent;
