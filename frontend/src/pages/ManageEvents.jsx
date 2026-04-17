import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { cancelEvent, deleteEvent, fetchMyEvents as fetchMyEventsAPI, pauseEvent, resumeEvent } from "../services/eventService";
import { exportEventRegistrations } from "../services/registrationService";
import {
    Edit2,
    Trash2,
    FileDown,
    Users,
    Calendar,
    AlertCircle,
    ChevronRight,
    Ban,
    ExternalLink,
    Filter,
    Plus,
    ArrowRight,
    Pause,
    Play,
    Clock
} from "lucide-react";

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();


    const loadMyEvents = async () => {
        setLoading(true);
        try {
            const res = await fetchMyEventsAPI();
            setEvents(res.data.data.events || []);
        } catch (err) {
            toast.error("Failed to load your events from the server.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadMyEvents();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this event? This will remove all registration records.")) return;
        try {
            await deleteEvent(id);
            toast.success("Event purged from system");
            setEvents(events.filter(e => e._id !== id));
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleCancelEvent = async (id) => {
        if (!window.confirm("Cancel this event? Registrants will be automatically notified via email.")) return;
        try {
            await cancelEvent(id);
            toast.success("Event cancelled and notifications sent");
            loadMyEvents();
        } catch (err) {
            toast.error("Failed to cancel event");
        }
    };

    const handlePauseEvent = async (id) => {
        try {
            await pauseEvent(id);
            toast.success("Event paused");
            loadMyEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to pause event");
        }
    };

    const handleResumeEvent = async (id) => {
        try {
            await resumeEvent(id);
            toast.success("Event resumed");
            loadMyEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resume event");
        }
    };

    const handleExportCSV = async (eventId, title) => {
        try {
            const res = await exportEventRegistrations(eventId, {
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
                        <p className="text-slate-500 font-medium mt-1">View, edit, or control your event lifecycle</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search event..."
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none w-64 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => navigate("/create-event")} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">New Event</button>
                    </div>
                </header>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Details</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrations</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
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
                                        <td colSpan="4" className="px-6 py-32 text-center text-slate-500">
                                            No events found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEvents.map(event => {
                                        const isPast = new Date(event.endDate) < new Date();
                                        const isCancelled = event.status === 'cancelled';
                                        const isPaused = event.status === 'paused';
                                        const maxCapacity = Number(event.maxParticipants) > 0 ? Number(event.maxParticipants) : null;
                                        const currentCount = Number(event.currentParticipants) || 0;
                                        const occupancyPercent = maxCapacity ? Math.min(100, Math.round((currentCount / maxCapacity) * 100)) : 0;

                                        return (
                                            <tr key={event._id} className={`hover:bg-slate-50/50 transition-colors ${isCancelled ? 'opacity-60 grayscale' : ''}`}>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest mb-1">{event.category}</span>
                                                        <h4 className="font-bold text-slate-900">{event.title}</h4>
                                                        <div className="flex items-center gap-3 mt-2 text-slate-400">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {new Date(event.startDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                          <div
                                                              className={`h-full rounded-full transition-all duration-500 ${occupancyPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                              style={{ width: `${occupancyPercent}%` }}
                                                          ></div>
                                                      </div>
                                                      <span className="text-[10px] font-black text-slate-900">{currentCount}/{maxCapacity ?? "∞"}</span>
                                                    </div>
                                                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                                                        {maxCapacity ? `${occupancyPercent}% Occupancy` : "Open Capacity"}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col items-start gap-1">
                                                      <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                                                          isCancelled ? 'bg-rose-100 text-rose-700' :
                                                          event.hasPendingUpdate ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                                          isPaused ? 'bg-amber-100 text-amber-700' :
                                                          event.status === 'pending_approval' || !event.isApproved ? 'bg-amber-100 text-amber-700' :
                                                          event.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                          isPast ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                                                      }`}>
                                                          {isCancelled ? 'Cancelled' :
                                                              event.hasPendingUpdate ? 'Pending Review' :
                                                              isPaused ? 'Paused' :
                                                              event.status === 'pending_approval' || !event.isApproved ? 'Awaiting Approval' :
                                                              event.status === 'rejected' ? 'Rejected' :
                                                              isPast ? 'Completed' : 'Live & Active'}
                                                      </span>
                                                      {event.hasPendingUpdate && (
                                                          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tight flex items-center gap-1">
                                                              <Clock className="w-2 h-2" /> Live version active
                                                          </span>
                                                      )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/event-registrations/${event._id}`)}
                                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                            title="View Registrations"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleExportCSV(event._id, event.title)}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                            title="Export CSV"
                                                        >
                                                            <FileDown className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/edit-event/${event._id}`)}
                                                            disabled={event.hasPendingUpdate}
                                                            className={`p-2 rounded-lg transition-all shadow-sm active:scale-95 ${event.hasPendingUpdate ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white'}`}
                                                            title={event.hasPendingUpdate ? "Updates already pending review" : "Edit Details"}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        {!isCancelled && !isPast && (
                                                            <button
                                                                onClick={() => handleCancelEvent(event._id)}
                                                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                                title="Cancel Event"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {!isCancelled && !isPast && !isPaused && !event.hasPendingUpdate && (
                                                            <button
                                                                onClick={() => handlePauseEvent(event._id)}
                                                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                                title="Pause Event"
                                                            >
                                                                <Pause className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {isPaused && !event.hasPendingUpdate && (
                                                            <button
                                                                onClick={() => handleResumeEvent(event._id)}
                                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                                title="Resume Event"
                                                            >
                                                                <Play className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(event._id)}
                                                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
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
