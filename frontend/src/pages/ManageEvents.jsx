import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Edit2,
    Trash2,
    FileDown,
    Users,
    Calendar,
    AlertCircle,
    ChevronRight,
    Ban,
    ExternalLink,
    Filter
} from "lucide-react";

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            const res = await API.get("/events/my/events");
            setEvents(res.data.data.events);
        } catch (err) {
            toast.error("Failed to load your events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this event? This will remove all registration records.")) return;
        try {
            await API.delete(`/events/${id}`);
            toast.success("Event purged from system");
            setEvents(events.filter(e => e._id !== id));
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleCancelEvent = async (id) => {
        if (!window.confirm("Cancel this event? Registrants will be automatically notified via email.")) return;
        try {
            await API.patch(`/events/${id}/cancel`);
            toast.success("Event cancelled and notifications sent");
            fetchMyEvents();
        } catch (err) {
            toast.error("Failed to cancel event");
        }
    };

    const handleExportCSV = async (eventId, title) => {
        try {
            const res = await API.get(`/registrations/event/${eventId}/export`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `registrations-${title.toLowerCase().replace(/\s+/g, '-')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("CSV Export successful");
        } catch (err) {
            toast.error("Failed to export registrations");
        }
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto animate-fade-in">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Manage Events</h1>
                        <p className="text-slate-500 font-medium mt-1">View, edit, or cancel your events</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => navigate("/create-event")} className="metallic-btn">New Event</button>
                    </div>
                </header>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrations</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                                <p className="text-xs font-bold uppercase tracking-widest">Loading Events...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center animate-fade-in group">
                                                <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm relative">
                                                    <Calendar className="w-10 h-10 text-slate-300" />
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white">
                                                        <Plus className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No Events Found</h3>
                                                <p className="text-slate-500 font-medium mb-10 max-w-xs mx-auto leading-relaxed">
                                                    You haven't created any events yet. Click below to create your first event.
                                                </p>
                                                <button
                                                    onClick={() => navigate("/create-event")}
                                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 group/btn"
                                                >
                                                    Create Event
                                                    <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEvents.map(event => {
                                        const isPast = new Date(event.endDate) < new Date();
                                        const isCancelled = event.status === 'cancelled';

                                        return (
                                            <tr key={event._id} className={`hover:bg-slate-50/50 transition-colors ${isCancelled ? 'opacity-60 grayscale' : ''}`}>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest mb-1">{event.category}</span>
                                                        <h4 className="font-bold text-slate-900">{event.title}</h4>
                                                        <div className="flex items-center gap-3 mt-2 text-slate-400">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(event.startDate).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                                                <Users className="w-3 h-3" />
                                                                {event.currentParticipants}/{event.maxParticipants}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${event.currentParticipants / event.maxParticipants > 0.8 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                                                            style={{ width: `${Math.min(100, (event.currentParticipants / event.maxParticipants) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">
                                                        {Math.round((event.currentParticipants / event.maxParticipants) * 100)}% Occupancy
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${isCancelled ? 'bg-rose-100 text-rose-700' :
                                                        !event.isApproved ? 'bg-amber-100 text-amber-700' :
                                                            isPast ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {isCancelled ? 'Cancelled' :
                                                            !event.isApproved ? 'Awaiting Approval' :
                                                                isPast ? 'Completed' : 'Live & Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/event-registrations/${event._id}`)}
                                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                                                            title="View Registrations"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleExportCSV(event._id, event.title)}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                                                            title="Export CSV"
                                                        >
                                                            <FileDown className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/edit-event/${event._id}`)}
                                                            className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-600 hover:text-white transition-all active:scale-95"
                                                            title="Edit Details"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        {!isCancelled && !isPast && (
                                                            <button
                                                                onClick={() => handleCancelEvent(event._id)}
                                                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                                title="Cancel Event"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(event._id)}
                                                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageEvents;
