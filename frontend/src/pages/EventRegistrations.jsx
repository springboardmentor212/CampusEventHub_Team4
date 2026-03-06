import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
    Users,
    ArrowLeft,
    CheckCircle,
    XCircle,
    FileDown,
    Clock,
    Search,
    UserCheck,
    MoreHorizontal,
    Mail,
    Filter,
    Calendar,
    Ban
} from "lucide-react";

const EventRegistrations = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [regRes, eventRes] = await Promise.all([
                API.get(`/registrations/event/${id}`),
                API.get(`/events/${id}`)
            ]);
            setRegistrations(regRes.data.data.registrations);
            setEvent(eventRes.data.data.event);
        } catch (err) {
            toast.error("Failed to load registration data");
            navigate("/manage-events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleUpdateStatus = async (regId, status) => {
        try {
            await API.patch(`/registrations/${regId}/status`, { status });
            toast.success(`Registration ${status}`);
            setRegistrations(prev => prev.map(r => r._id === regId ? { ...r, status } : r));
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleMarkAttendance = async (regId, status) => {
        try {
            await API.patch(`/registrations/${regId}/attendance`, { status });
            toast.success(`Marked as ${status}`);
            setRegistrations(prev => prev.map(r => r._id === regId ? { ...r, status } : r));
        } catch (err) {
            toast.error("Failed to mark attendance");
        }
    };

    const handleExportCSV = async () => {
        try {
            const res = await API.get(`/registrations/event/${id}/export`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `registrations-${event?.title?.toLowerCase().replace(/\s+/g, '-')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Export successful");
        } catch (err) {
            toast.error("Export failed");
        }
    };

    const filteredRegs = registrations.filter(r => {
        const matchesSearch = (r.user?.firstName + " " + r.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.user?.officialId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || r.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto animate-fade-in">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-6 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Catalog
                </button>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                                Event Operations
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{event?.title}</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage attendees, verify identities, and track participation</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleExportCSV} className="secondary-btn flex items-center gap-2">
                            <FileDown className="w-4 h-4" />
                            Export Roster
                        </button>
                    </div>
                </header>

                {/* Sub-Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <StatBox label="Total Applied" value={registrations.length} color="indigo" />
                    <StatBox label="Approved" value={registrations.filter(r => r.status === 'approved' || r.status === 'attended').length} color="emerald" />
                    <StatBox label="Attended" value={registrations.filter(r => r.status === 'attended').length} color="blue" />
                    <StatBox label="Remaining" value={(event?.maxParticipants || 0) - event?.currentParticipants} color="rose" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter attendees by name or ID..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider outline-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Every State</option>
                                <option value="pending">Pending Review</option>
                                <option value="approved">Approved Access</option>
                                <option value="attended">Attended Event</option>
                                <option value="rejected">Rejected Entry</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Profile</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participation</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRegs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-slate-400 text-sm font-medium italic">
                                            No registrations found matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegs.map(reg => (
                                        <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                        {reg.user?.firstName[0]}{reg.user?.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-bold text-slate-900">{reg.user?.firstName} {reg.user?.lastName}</h5>
                                                        <div className="flex items-center gap-3 mt-1 text-slate-400">
                                                            <span className="text-[10px] font-bold uppercase tracking-tighter">ID: {reg.user?.officialId}</span>
                                                            <span className="opacity-20">|</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                                                <School className="w-3 h-3" />
                                                                {reg.user?.college?.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${reg.status === 'approved' || reg.status === 'attended' ? 'bg-emerald-100 text-emerald-700' :
                                                        reg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {reg.status === 'attended' ? 'Approved' : reg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {reg.status === 'attended' ? (
                                                    <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-[10px] uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 w-fit">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Checked In
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Pending Check-in
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    {reg.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(reg._id, 'approved')}
                                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                                                                title="Approve Registration"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(reg._id, 'rejected')}
                                                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                                title="Reject Registration"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {(reg.status === 'approved' || reg.status === 'attended') && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleMarkAttendance(reg._id, reg.status === 'attended' ? 'approved' : 'attended')}
                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 border ${reg.status === 'attended'
                                                                        ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white'
                                                                        : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                                                                    }`}
                                                            >
                                                                {reg.status === 'attended' ? 'Undo Check-in' : 'Mark Attended'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarkAttendance(reg._id, 'no-show')}
                                                                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-600 hover:text-white transition-all"
                                                            >
                                                                No Show
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const StatBox = ({ label, value, color }) => {
    const colors = {
        indigo: "text-indigo-600 border-indigo-100 bg-indigo-50/30",
        emerald: "text-emerald-600 border-emerald-100 bg-emerald-50/30",
        blue: "text-blue-600 border-blue-100 bg-blue-50/30",
        rose: "text-rose-600 border-rose-100 bg-rose-50/30"
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]} shadow-sm`}>
            <p className="stats-label !text-slate-400">{label}</p>
            <p className="stats-value mt-1">{value}</p>
        </div>
    );
};

const School = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
);

export default EventRegistrations;
