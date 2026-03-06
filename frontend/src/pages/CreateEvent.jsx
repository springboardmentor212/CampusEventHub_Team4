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
    Zap
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
        bannerImage: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Verifying event parameters...");

        const requirementsArray = form.requirements
            ? form.requirements.split(",").map(req => req.trim()).filter(req => req !== "")
            : [];

        const dosArray = form.dosAndDonts
            ? form.dosAndDonts.split(",").map(d => d.trim()).filter(d => d !== "")
            : [];

        try {
            await API.post("/events/create", {
                ...form,
                requirements: requirementsArray,
                dosAndDonts: dosArray,
                maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null
            });
            toast.success("Event broadcasted successfully!", { id: loadingToast });
            navigate("/manage-events");
        } catch (err) {
            toast.error(err.response?.data?.message || "Protocol failure", { id: loadingToast });
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col animate-fade-in">
                <header className="mb-8 shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="inline-badge">Event Orchestrator</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-widest">Protocol V2.0</span>
                    </div>
                    <h1 className="editorial-header">Initialize New Event.</h1>
                    <p className="text-slate-500 mt-2 font-medium">Broadcast your next initiative to the entire campus ecosystem.</p>
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
                                label="Event Banner"
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

                        <div className="pt-10 sticky bottom-0 bg-white/90 backdrop-blur-md pb-4 z-20">
                            <button type="submit" className="hero-btn w-full py-5 text-base group shadow-2xl shadow-indigo-100/50">
                                <Zap className="w-5 h-5 group-hover:animate-pulse" />
                                Initialize Event Broadcast
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateEvent;
