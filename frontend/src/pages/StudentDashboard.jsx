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
  const [activeTab, setActiveTab] = useState("discover"); // discover, passes
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes, regRes] = await Promise.all([
        API.get("/events"),
        API.get("/dashboards/student"),
        API.get("/registrations/my-registrations")
      ]);
      setEvents(eventsRes.data.data.events);
      setStats(statsRes.data.data);
      setRegistrations(regRes.data.data.registrations);
    } catch (err) {
      toast.error("Internal Feed Synchronization: Delayed.");
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

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compiling Personalized Experience...</p>
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
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight italic">Hello, {user?.firstName}</h1>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3 fill-emerald-500" />
                Verified Student
              </span>
            </div>
            <p className="text-slate-500 font-medium">Ready for your next campus adventure? Discover events below.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 3242}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                +12k
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global Campus <br />Engagement</p>
          </div>
        </header>

        <div className="stats-grid">
          <MetricCard
            icon={Compass}
            label="Discovery Score"
            value={stats.totalRegistrations}
            trend="Level 4 Explorer"
            accent="accent-operations"
          />
          <MetricCard
            icon={CreditCard}
            label="Active Passes"
            value={stats.futureTickets}
            trend="Institutional Access"
            accent="accent-financial"
          />
          <MetricCard
            icon={Award}
            label="Experience Points"
            value={stats.pastAttended * 150}
            trend="+15% Growth"
            accent="accent-marketing"
          />
          <MetricCard
            icon={TrendingUp}
            label="Network Peak"
            value="Top 5%"
            trend="Global Ranking"
            accent="accent-sales"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-2 rounded-3xl border border-slate-100 space-y-4 md:space-y-0">
          <div className="flex gap-1 p-1 bg-slate-50 rounded-2xl w-full md:w-auto">
            <NavTab active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} label="Discovery" icon={LayoutGrid} />
            <NavTab active={activeTab === 'passes'} onClick={() => setActiveTab('passes')} label="My Passes" icon={Ticket} />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto px-4 md:px-0">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Query system..."
                className="w-full bg-slate-50 border-none rounded-xl pl-9 text-xs font-medium focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
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
              <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-6 opacity-30" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Zero Query Results</p>
                <p className="text-slate-400 text-xs mt-2">Adjust your filters to see more results.</p>
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

                    <div className="p-10 flex-1 flex flex-col">
                      <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 italic">{event.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-8 font-medium leading-relaxed opacity-70 italic">{event.description}</p>

                      <div className="mt-auto space-y-6">
                        <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Enrollment Opens</span>
                            <span className="text-xs font-bold text-slate-900">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Availability</span>
                            <span className="text-xs font-bold text-slate-900">{event.maxParticipants - event.currentParticipants} Spots Left</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden border border-white">
                              <Zap className="w-full h-full p-1 text-amber-500 fill-amber-500" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fast Track</span>
                          </div>
                          <span className="flex items-center gap-2 text-[10px] font-black italic text-indigo-600 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-500">
                            Secure Pass
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {registrations.length === 0 ? (
                <div className="col-span-full py-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                  <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-6 opacity-30" />
                  <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">No Active Admissions</p>
                  <p className="text-slate-400 text-xs mt-4 italic font-medium">Your historical records and future tickets will appear here.</p>
                </div>
              ) : (
                registrations.map(reg => (
                  <div key={reg._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 hover:border-indigo-100 group">
                    <div className="w-full md:w-40 h-40 rounded-[2rem] overflow-hidden shrink-0 border border-slate-50 group-hover:scale-105 transition-transform">
                      <img
                        src={reg.event?.bannerImage || reg.event?.image || "/images/campus_life_professional.png"}
                        className="w-full h-full object-cover"
                        alt="Pass"
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-xl text-slate-900 group-hover:text-indigo-600 transition-colors italic">{reg.event?.title}</h3>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{reg.event?.category}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${reg.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {reg.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Institutional Hub</span>
                          <span className="text-xs font-bold text-slate-700 truncate">{reg.event?.college?.name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Event Date</span>
                          <span className="text-xs font-bold text-slate-700">{new Date(reg.event?.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6 border-t border-slate-50">
                        <button className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">View Passport</button>
                        <button className="px-6 py-2.5 border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-colors">Withdrawal</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const NavTab = ({ active, onClick, label, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 w-full md:w-auto ${active
        ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50'
        : 'text-slate-400 hover:text-slate-600'
      }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-300'}`} />
    {label}
  </button>
);

const MetricCard = ({ icon: Icon, label, value, trend, accent }) => (
  <div className="metric-card greta-card-hover group overflow-hidden bg-white border border-slate-100 shadow-sm shadow-slate-200/40 p-8 rounded-[2rem]">
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 rounded-2xl border ${accent} bg-white shadow-xl shadow-slate-100/50`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-[0.1em]">
        {trend}
      </div>
    </div>
    <div className="mt-8 relative z-10">
      <p className="metric-label text-slate-400 font-bold mb-1">{label}</p>
      <p className="metric-value text-4xl font-black text-slate-900 italic tracking-tight">{value}</p>
    </div>
    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50/50 rounded-full group-hover:scale-150 transition-transform opacity-50 blur-2xl" />
  </div>
);

export default StudentDashboard;
