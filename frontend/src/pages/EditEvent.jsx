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
    Image as ImageIcon
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
        bannerImage: ""
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await API.get(`/events/${id}`);
                const event = res.data.data.event;

                const formatForInput = (dateStr) => {
                    const d = new Date(dateStr);
                    return d.toISOString().slice(0, 16);
                };

                setForm({
                    title: event.title,
                    description: event.description,
                    category: event.category,
                    location: event.location,
                    startDate: formatForInput(event.startDate),
                    endDate: formatForInput(event.endDate),
                    registrationDeadline: event.registrationDeadline ? formatForInput(event.registrationDeadline) : "",
                    maxParticipants: event.maxParticipants || "",
                    requirements: event.requirements ? event.requirements.join(", ") : "",
                    dosAndDonts: event.dosAndDonts ? event.dosAndDonts.join(", ") : "",
                    bannerImage: event.bannerImage || ""
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
            <div className="h-[calc(100vh-140px)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Datatheory...</span>
                </div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col animate-fade-in">
                <header className="mb-8 shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="inline-badge">Event Refiner</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-widest">Update Mode</span>
                    </div>
                    <h1 className="editorial-header">Modify Parameters.</h1>
                    <p className="text-slate-500 mt-2 font-medium">Adjust the technical specifications and narrative of your event.</p>
                </header>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm relative">
                    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-16 pb-20">
                        {/* Banner Upload Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Visual Identity</h3>
                            </div>

                            <ImageUpload
                                label="Update Event Banner"
                                defaultValue={form.bannerImage}
                                onUpload={(url) => setForm({ ...form, bannerImage: url })}
                            />
                        </div>

                        {/* Section 1: Identity */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Type className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Identity & Scope</h3>
                            </div>

                            <FormInput
                                label="Event Title"
                                icon={Type}
                                required
                                placeholder="e.g. Annual Tech Symposium 2026"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    label="Category"
                                    icon={Target}
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    suffix={<ChevronDown className="w-4 h-4 text-slate-400" />}
                                >
                                    <option value="Workshop">Workshop</option>
                                    <option value="Seminar">Seminar</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Technical">Technical</option>
                                </FormInput>

                                <FormInput
                                    label="Location"
                                    icon={MapPin}
                                    required
                                    placeholder="e.g. Vikram Sarabhai Hall"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Section 2: Chronology */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Chronology</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormInput
                                    label="Start Window"
                                    icon={Calendar}
                                    type="datetime-local"
                                    required
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                />
                                <FormInput
                                    label="End Window"
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
                            </div>
                        </div>

                        {/* Section 3: Parameters */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Users className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Capacity & Protocols</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    label="Personnel Threshold"
                                    icon={Users}
                                    type="number"
                                    placeholder="Unlimited if empty"
                                    value={form.maxParticipants}
                                    onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                                />
                                <FormInput
                                    label="Asset Requirements"
                                    icon={ListRestart}
                                    placeholder="e.g. Laptop, ID Card, Notebook"
                                    value={form.requirements}
                                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                                />
                            </div>

                            <FormInput
                                label="Institutional Protocols (Do's & Don'ts)"
                                icon={ShieldAlert}
                                placeholder="e.g. No ID no entry, Maintain silence, Bags not allowed"
                                value={form.dosAndDonts}
                                onChange={(e) => setForm({ ...form, dosAndDonts: e.target.value })}
                            />
                        </div>

                        {/* Section 4: Narrative */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Narrative Content</h3>
                            </div>

                            <FormInput
                                label="Description"
                                icon={FileText}
                                type="textarea"
                                required
                                placeholder="State the core objectives, schedule, and outcomes of the session..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={8}
                            />
                        </div>

                        <div className="pt-10 sticky bottom-0 bg-white/90 backdrop-blur-md pb-4 z-20 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/manage-events")}
                                className="secondary-hero-btn flex-1 py-5"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Revert Changes
                            </button>
                            <button type="submit" className="hero-btn flex-1 py-5 group shadow-2xl shadow-indigo-100/50">
                                <Zap className="w-4 h-4 group-hover:animate-pulse" />
                                Commit Modifications
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EditEvent;
