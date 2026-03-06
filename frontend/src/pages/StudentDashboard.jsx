import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  CheckCircle2,
  XCircle,
  User,
  GraduationCap,
  School,
  Mail,
  ChevronRight,
  Star,
  Sparkles,
  ArrowUpRight,
  Zap,
  Activity,
  Shield,
  LayoutGrid,
  Bookmark
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("marketplace"); // marketplace, my-events
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, regRes] = await Promise.all([
        API.get("/events"),
        API.get("/registrations/my-registrations")
      ]);
      setEvents(eventsRes.data.data.events);
      setRegistrations(regRes.data.data.registrations);
    } catch (err) {
      toast.error("Feed synchronization: Interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Workshop", "Seminar", "Cultural", "Sports", "Technical"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRegister = async (eventId) => {
    try {
      await API.post("/registrations/register", { eventId });
      toast.success("Registration confirmed");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Feed...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
        {/* Header & Stats */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Explore Campus Life</h1>
            <p className="text-slate-500 mt-2 font-medium">Discover opportunities, workshops, and gatherings.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'marketplace' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab("my-events")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'my-events' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              My Events
            </button>
          </div>
        </header>

        {activeTab === "marketplace" ? (
          <div className="space-y-8">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query system for events or categories..."
                  className="w-full pl-14"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${filterCategory === cat ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredEvents.length === 0 && (
              <div className="py-24 text-center">
                <div className="flex flex-col items-center animate-fade-in grayscale-[0.5] opacity-60">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-300 mb-4 border border-indigo-100">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">Zero Query Matches.</h3>
                  <p className="text-slate-500 text-sm mt-1 font-medium">No records matching your parameters found in active datatheory.</p>
                </div>
              </div>
            )}



            {/* Event Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, idx) => (
                <Link
                  to={`/event/${event._id}`}
                  key={event._id}
                  className="bento-item group p-0 overflow-hidden border-slate-200/60 shadow-sm flex flex-col h-full hover:border-indigo-200 hover:-translate-y-2 transition-all duration-500"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative h-56 overflow-hidden bg-slate-50">
                    <img
                      src={event.bannerImage || event.image || "/images/campus_life_professional.png"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <Zap className="w-2.5 h-2.5 text-amber-500" />
                        {event.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{event.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-8 font-medium leading-relaxed">{event.description}</p>

                    <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                      <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-black text-indigo-600 flex items-center gap-1">
                          Initialize Admission
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          {event.college?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {registrations.map(reg => (
                <div key={reg._id} className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-6 hover:shadow-lg transition-all">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img
                      src={reg.eventId?.image || "/images/campus_life_professional.png"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900">{reg.eventId?.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${reg.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {reg.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-4">{reg.eventId?.location} • {new Date(reg.eventId?.startDate).toLocaleDateString()}</p>
                    <div className="flex gap-3">
                      <button className="text-xs font-bold text-indigo-600 hover:underline">View Ticket</button>
                      <button className="text-xs font-bold text-rose-500 hover:underline">Cancel</button>
                    </div>
                  </div>
                </div>
              ))}
              {registrations.length === 0 && (
                <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                  <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-900">No active registrations</h3>
                  <p className="text-slate-500 text-sm mt-1">Start exploring the marketplace to find events.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
