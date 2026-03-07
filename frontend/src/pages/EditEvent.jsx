import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
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
    Save,
    RotateCcw,
    ShieldAlert,
    Zap,
    Image as ImageIcon,
    Trash2,
    Settings,
    Activity,
    Layers,
    Globe,
    CreditCard
} from "lucide-react";

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
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
        participationRequirements: []
    });

    const categories = ["Workshop", "Seminar", "Cultural", "Sports", "Technical", "Hackathon", "Other"];

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await API.get(`/events/${id}`);
                const event = res.data.data.event;

                const formatForInput = (dateStr) => {
                    if (!dateStr) return "";
                    const d = new Date(dateStr);
                    return d.toISOString().slice(0, 16);
                };

                setForm({
                    title: event.title,
                    description: event.description,
                    category: event.category.charAt(0).toUpperCase() + event.category.slice(1),
                    location: event.location,
                    startDate: formatForInput(event.startDate),
                    endDate: formatForInput(event.endDate),
                    registrationDeadline: event.registrationDeadline ? formatForInput(event.registrationDeadline) : "",
                    maxParticipants: event.maxParticipants || "",
                    requirements: event.requirements ? event.requirements.join(", ") : "",
                    dosAndDonts: event.dosAndDonts ? event.dosAndDonts.join(", ") : "",
                    bannerImage: event.bannerImage || "",
                    participationRequirements: event.participationRequirements || []
                });
            } catch (err) {
                toast.error("Resource retrieval failure");
                navigate("/manage-events");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const addRequirement = () => {
        setForm({
            ...form,
            participationRequirements: [
                ...form.participationRequirements,
                { label: "", fieldType: "text", isRequired: true }
            ]
        });
    };

    const removeRequirement = (idx) => {
        const updated = [...form.participationRequirements];
        updated.splice(idx, 1);
        setForm({ ...form, participationRequirements: updated });
    };

    const updateRequirement = (idx, field, value) => {
        const updated = [...form.participationRequirements];
        updated[idx][field] = value;
        setForm({ ...form, participationRequirements: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Syncing modifications...");

        const requirementsArray = form.requirements
            ? form.requirements.split(",").map(req => req.trim()).filter(req => req !== "")
            : [];

        const dosArray = form.dosAndDonts
            ? form.dosAndDonts.split(",").map(d => d.trim()).filter(d => d !== "")
            : [];

        try {
            await API.patch(`/events/${id}`, {
                ...form,
                category: form.category.toLowerCase(),
                requirements: requirementsArray,
                dosAndDonts: dosArray,
                maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null
            });
            toast.success("Event parameters updated.", { id: loadingToast });
            navigate("/manage-events");
        } catch (err) {
            toast.error(err.response?.data?.message || "Sync protocol failure", { id: loadingToast });
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Datatheory...</span>
                </div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Event Refiner</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Update Mode</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">Modify Parameters.</h1>
                        <p className="text-slate-500 mt-3 font-medium text-lg">Adjust the technical specifications and narrative of your event.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel Changes</button>
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
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Asset management for public feed.</p>
                                </div>
                            </div>

                            <ImageUpload
                                label="Update Hero Asset"
                                defaultValue={form.bannerImage}
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
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Adjust core identity parameters.</p>
                                </div>
                            </div>

                            <FormInput
                                label="Institutional Title"
                                icon={Type}
                                required
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
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </div>

                            <FormInput
                                label="Narrative Content"
                                icon={FileText}
                                type="textarea"
                                required
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={6}
                            />
                        </section>

                        {/* 3. Participation Protocol */}
                        <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8">
                            <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Participation Protocol</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Data capture requirements.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addRequirement}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Attribute
                                </button>
                            </div>

                            <div className="space-y-4">
                                {form.participationRequirements.map((req, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 bg-slate-50 rounded-[2rem] relative group">
                                        <div className="flex-1 space-y-4">
                                            <FormInput
                                                label="Field Prompt"
                                                value={req.label}
                                                onChange={(e) => updateRequirement(idx, "label", e.target.value)}
                                            />
                                            <div className="flex gap-4">
                                                <select
                                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-600 uppercase tracking-tighter"
                                                    value={req.fieldType}
                                                    onChange={(e) => updateRequirement(idx, "fieldType", e.target.value)}
                                                >
                                                    <option value="text">Text Input</option>
                                                    <option value="number">Numeric</option>
                                                    <option value="email">Email Mask</option>
                                                    <option value="file">File Asset</option>
                                                </select>
                                                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-3.5 h-3.5 rounded-full border-slate-300 text-indigo-600"
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
                                            className="p-2 text-rose-400 hover:text-rose-600"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-12">
                        <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-10 sticky top-8">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Chronology</h3>
                            </div>

                            <FormInput
                                label="Window Start"
                                icon={Calendar}
                                type="datetime-local"
                                required
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            />

                            <FormInput
                                label="Window End"
                                icon={Calendar}
                                type="datetime-local"
                                required
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            />

                            <FormInput
                                label="Reg. Deadline"
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
                                            placeholder="No limit"
                                            className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 outline-none"
                                            value={form.maxParticipants}
                                            onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 space-y-4">
                                <button type="submit" className="hero-btn w-full py-6 group shadow-3xl shadow-amber-100/50 italic bg-slate-900 text-white hover:bg-slate-800">
                                    <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                    Commit Modifications
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Discard Changes
                                </button>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EditEvent;
