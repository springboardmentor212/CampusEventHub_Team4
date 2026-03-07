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
  Bookmark,
  Compass,
  CreditCard,
  Heart,
  TrendingUp,
  Award
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover"); // discover, passes, helpdesk
  const [filterCategory, setFilterCategory] = useState("All");
  const [participationFilter, setParticipationFilter] = useState("all"); // all, ongoing, upcoming, past

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [eventsRes] = await Promise.all([
        API.get("/events")
      ]);
      setEvents(eventsRes.data?.data?.events || []);

      if (user?.role === 'student') {
        const [statsRes, regRes] = await Promise.all([
          API.get("/dashboards/student"),
          API.get("/registrations/my")
        ]);
        setStats(statsRes.data?.data || null);
        setRegistrations(regRes.data?.data?.registrations || []);
      }
    } catch (err) {
      toast.error("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Workshop", "Seminar", "Cultural", "Sports", "Technical"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || (event.category || '').toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Events...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Hello, {user?.firstName}</h1>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3 fill-emerald-500" />
                Student
              </span>
            </div>
            <p className="text-slate-500 font-medium">Ready for your next campus adventure? Discover events below.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 3242}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                +12k
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Active<br />Students</p>
          </div>
        </header>

        {user?.role === 'student' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              icon={Compass}
              label="Total Registrations"
              value={stats.totalRegistrations}
              trend="All Time"
              accent="text-indigo-600 bg-indigo-50 border-indigo-100"
            />
            <MetricCard
              icon={Ticket}
              label="Upcoming Events"
              value={stats.futureTickets}
              trend="Registered"
              accent="text-emerald-600 bg-emerald-50 border-emerald-100"
            />
            <MetricCard
              icon={Award}
              label="Events Attended"
              value={stats.pastAttended}
              trend="Completed"
              accent="text-amber-600 bg-amber-50 border-amber-100"
            />
            <MetricCard
              icon={TrendingUp}
              label="Student Rank"
              value="Top 5%"
              trend="Campus Wide"
              accent="text-purple-600 bg-purple-50 border-purple-100"
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:space-y-0">
          <div className="flex gap-1 p-1 bg-slate-50 rounded-xl w-full md:w-auto">
            <NavTab active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} label="Browse Events" icon={LayoutGrid} />
            {user?.role === 'student' && (
              <>
                <NavTab active={activeTab === 'passes'} onClick={() => setActiveTab('passes')} label="My Events" icon={Bookmark} />
                <NavTab active={activeTab === 'helpdesk'} onClick={() => setActiveTab('helpdesk')} label="Help Desk" icon={Shield} />
              </>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto px-4 md:px-0">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full bg-slate-50 border-slate-200 rounded-xl pl-9 text-xs font-medium focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 py-2.5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === "discover" ? (
          <div className="space-y-12">
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shrink-0 ${filterCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Events Found</p>
                <p className="text-slate-400 text-xs mt-2">Adjust your filters or search term to see more events.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredEvents.map((event, idx) => (
                  <Link
                    to={`/event/${event._id}`}
                    key={event._id}
                    className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col h-[520px] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-700 hover:-translate-y-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={event.bannerImage || event.image || "/images/campus_life_professional.png"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="absolute top-6 right-6">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.15em] text-slate-900 shadow-xl">
                          {event.category}
                        </span>
                      </div>

                      <div className="absolute bottom-6 left-6 flex items-center gap-2 text-white/90">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{event.location}</span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{event.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">{event.description}</p>

                      <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                            <span className="text-xs font-bold text-slate-900">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spots</span>
                            <span className="text-xs font-bold text-slate-900">{event.maxParticipants - event.currentParticipants} Left</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to View Details</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300">
                            View
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "passes" ? (
          <div className="space-y-12">
            <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl w-fit">
              {['all', 'ongoing', 'upcoming', 'past'].map((f) => (
                <button
                  key={f}
                  onClick={() => setParticipationFilter(f)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${participationFilter === f ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {f === 'all' ? 'All My Events' : f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {(() => {
                const now = new Date();
                const filtered = registrations.filter(reg => {
                  if (!reg.event) return false;
                  const start = new Date(reg.event.startDate);
                  const end = new Date(reg.event.endDate);
                  if (participationFilter === 'ongoing') return start <= now && end >= now;
                  if (participationFilter === 'upcoming') return start > now;
                  if (participationFilter === 'past') return end < now;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="col-span-full py-24 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
                      <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Events Found</p>
                      <p className="text-slate-400 text-xs mt-2 font-medium">Try changing your filter or browse new events.</p>
                    </div>
                  );
                }

                return filtered.map(reg => (
                  <div key={reg._id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                    <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={reg.event?.bannerImage || reg.event?.image || "/images/campus_life_professional.png"}
                        className="w-full h-full object-cover"
                        alt="Event Banner"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 mb-1">{reg.event?.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{reg.event?.category}</span>
                            {new Date(reg.event?.startDate) <= now && new Date(reg.event?.endDate) >= now && (
                              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase animate-pulse">
                                <Activity className="w-3 h-3" /> Live Now
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${reg.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {reg.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">College</span>
                          <span className="text-xs font-medium text-slate-700 truncate">{reg.event?.college?.name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</span>
                          <span className="text-xs font-medium text-slate-700">{new Date(reg.event?.startDate).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <Link to={`/event/${reg.event?._id}`} className="px-5 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-center">View Details</Link>
                        {reg.status === 'approved' && new Date(reg.event?.startDate) > now && (
                          <button className="px-5 py-2 border border-rose-200 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-rose-50 transition-colors text-center">Withdraw</button>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        ) : (
          <div className="space-y-12 py-20 px-10 bg-white rounded-[3rem] border border-slate-100 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Shield className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">How can we help?</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Having trouble with a registration or technical issues? Contact our campus help desk for immediate assistance.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="p-6 bg-slate-50 rounded-2xl text-left border border-slate-100 group hover:border-indigo-200 transition-all">
                <Mail className="w-6 h-6 text-indigo-500 mb-4" />
                <p className="text-xs font-black text-slate-900 uppercase">Email Support</p>
                <p className="text-xs text-slate-500 mt-1">support@campuseventhub.edu</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl text-left border border-slate-100 group hover:border-indigo-200 transition-all">
                <Activity className="w-6 h-6 text-indigo-500 mb-4" />
                <p className="text-xs font-black text-slate-900 uppercase">System Status</p>
                <p className="text-xs text-emerald-600 mt-1 font-bold">All Systems Operational</p>
              </div>
            </div>
            <button className="hero-btn w-full mt-10 py-5 italic">
              Raise a Support Ticket
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const NavTab = ({ active, onClick, label, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 w-full md:w-auto ${active
      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
      : 'text-slate-500 hover:bg-slate-100'
      }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
    {label}
  </button>
);

const MetricCard = ({ icon: Icon, label, value, trend, accent }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative">
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-2.5 rounded-xl border ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-widest">
        {trend}
      </div>
    </div>
    <div className="mt-6 relative z-10">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default StudentDashboard;
