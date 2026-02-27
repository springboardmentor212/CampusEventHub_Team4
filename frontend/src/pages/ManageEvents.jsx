import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
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
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await API.delete(`/events/${id}`);
            toast.success("Event deleted successfully");
            setEvents(events.filter(e => e._id !== id));
        } catch (err) {
            toast.error("Failed to delete event");
        }
    };

    return (
        <DashboardLayout>
            <div className="w-full max-w-[1000px] mx-auto">
                <header className="flex justify-between items-start mb-8 w-full">
                    <div className="flex flex-col">
                        <h1 className="text-[32px] font-bold text-gray-900 leading-tight">Manage Events</h1>
                        <p className="text-[16px] text-gray-500 mt-1">View, edit, and manage all your events</p>
                    </div>
                    <div className="bg-gray-700 text-white text-[14px] px-4 py-1.5 rounded-full font-medium">
                        {events.length} events
                    </div>
                </header>

                <main className="bg-white rounded-[24px] p-10 shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-[24px] font-bold text-gray-900">All Events</h2>
                        <p className="text-[16px] text-gray-500 mt-1">Complete overview of all campus events</p>
                    </div>

                    <div className="mb-8 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg py-3 pl-12 pr-4 border-none focus:ring-2 focus:ring-gray-300 transition duration-200"
                            placeholder="Search"
                            type="text"
                        />
                    </div>

                    <div className="hidden md:grid grid-cols-[2.5fr_1.5fr_1.2fr_1fr_1fr_0.5fr] gap-4 mb-3 px-6 text-[14px] font-medium text-gray-500 capitalize">
                        <div>Events</div>
                        <div>College</div>
                        <div>Date</div>
                        <div>Status</div>
                        <div>Participants</div>
                        <div></div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">No events found.</div>
                        ) : (
                            events.map((event) => (
                                <article key={event._id} className="grid grid-cols-1 md:grid-cols-[2.5fr_1.5fr_1.2fr_1fr_1fr_0.5fr] gap-4 bg-gray-100 rounded-xl p-6 py-4 items-center">
                                    <div className="flex flex-col items-start justify-center">
                                        <h3 className="text-[16px] font-medium text-gray-900">{event.title}</h3>
                                        <div className="mt-1 bg-gray-200 text-gray-700 text-[12px] px-2.5 py-1 rounded-full inline-block">
                                            {event.category}
                                        </div>
                                    </div>
                                    <div className="text-[14px] text-gray-600 truncate">{event.college?.name || 'N/A'}</div>
                                    <div className="text-[14px] text-gray-600">{new Date(event.startDate).toLocaleDateString()}</div>
                                    <div className="text-[14px] text-gray-600 capitalize">
                                        {new Date(event.startDate) > new Date() ? 'Upcoming' : 'Past'}
                                    </div>
                                    <div className="text-[14px] text-gray-600">Max: {event.maxParticipants}</div>
                                    <div className="flex justify-end gap-2">
                                        <button className="text-gray-500 hover:text-gray-900 p-1" onClick={() => navigate(`/edit-event/${event._id}`)}>
                                            <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                        <button className="text-red-500 hover:text-red-700 p-1" onClick={() => handleDelete(event._id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
};

export default ManageEvents;
