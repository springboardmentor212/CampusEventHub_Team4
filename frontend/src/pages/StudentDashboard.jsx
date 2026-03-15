import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  MapPin,
  Ticket,
  Star,
  ArrowUpRight,
  Activity,
  LayoutGrid,
  Bookmark,
  Compass,
  Award,
  Shield,
  Mail
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCollegeAdminFeed = user?.role === "college_admin";
  const [myCollegeEvents, setMyCollegeEvents] = useState([]);
  const [otherCollegeEvents, setOtherCollegeEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home"); // home, events, activity
  const [filterCategory, setFilterCategory] = useState("All");
  const [participationFilter, setParticipationFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  useEffect(() => {
    fetchData();
  }, [user, searchQuery, filterCategory, availabilityFilter, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = {
        search: searchQuery || undefined,
        category: filterCategory !== "All" ? filterCategory.toLowerCase() : undefined,
        availability: availabilityFilter !== "all" ? availabilityFilter : undefined,
      };

      if (dateFilter !== "all") {
        const now = new Date();
        params.startDate = now.toISOString();
        if (dateFilter === "today") {
          const end = new Date();
          end.setHours(23, 59, 59, 999);
          params.endDate = end.toISOString();
        } else if (dateFilter === "week") {
          const end = new Date();
          end.setDate(now.getDate() + 7);
          params.endDate = end.toISOString();
        } else if (dateFilter === "month") {
          const end = new Date();
          end.setMonth(now.getMonth() + 1);
          params.endDate = end.toISOString();
        }
      }

      if (user?.role === "college_admin") {
        const [feedRes, statsRes] = await Promise.allSettled([
          API.get("/events", { params }),
          API.get("/dashboards/college-admin")
        ]);

        setMyCollegeEvents(feedRes.status === "fulfilled" ? (feedRes.value?.data?.data?.events || []) : []);
        setOtherCollegeEvents([]);
        setStats(statsRes.status === "fulfilled" ? (statsRes.value?.data?.data || null) : null);
        setRegistrations([]);
        setFeedbackHistory([]);
        return;
      }

      if (user?.role === 'student') {
        const [myCollegeRes, otherCollegesRes, statsRes, regRes, feedbackRes] = await Promise.allSettled([
          API.get("/events", { params: { ...params, scope: "my_college" } }),
          API.get("/events", { params: { ...params, scope: "other_colleges" } }),
          API.get("/dashboards/student"),
          API.get("/registrations/my"),
          API.get("/feedback/my")
        ]);

        setMyCollegeEvents(myCollegeRes.status === 'fulfilled' ? (myCollegeRes.value?.data?.data?.events || []) : []);
        setOtherCollegeEvents(otherCollegesRes.status === 'fulfilled' ? (otherCollegesRes.value?.data?.data?.events || []) : []);
        setStats(statsRes.status === 'fulfilled' ? (statsRes.value?.data?.data || null) : null);
        setRegistrations(regRes.status === 'fulfilled' ? (regRes.value?.data?.data?.registrations || []) : []);
        setFeedbackHistory(feedbackRes.status === 'fulfilled' ? (feedbackRes.value?.data?.data?.feedback || []) : []);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Workshop", "Seminar", "Cultural", "Sports", "Technical"];

  const renderEventCards = (eventList, showPreviewStatus = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {eventList.map((event) => (
        <Link
          to={`/event/${event._id}`}
          key={event._id}
          title={showPreviewStatus ? "Edit in My Events" : undefined}
          className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col min-h-[480px] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500 hover:-translate-y-2"
        >
          <div className="relative h-60 overflow-hidden">
            <img
              src={event.bannerImage || event.image || "/images/campus_life_professional.png"}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            {showPreviewStatus && (
              <div className="absolute top-4 left-4">
                {event.hasPendingUpdate ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Update Pending
                  </span>
                ) : (event.isApproved && event.isVisible) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Live
                  </span>
                ) : null}
              </div>
            )}
            <div className="absolute top-6 right-6">
              <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.15em] text-slate-900 shadow-xl">
                {event.category === 'other' ? (event.customCategory || 'other') : event.category}
              </span>
            </div>
            <div className="absolute bottom-6 left-6 flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">{event.location}</span>
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{event.title}</h3>
            <p className="text-slate-500 text-sm line-clamp-2 mb-8 font-medium leading-relaxed">{event.description}</p>

            <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Schedule</span>
                <span className="text-xs font-bold text-slate-900">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                View Access
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  if (!user?.isVerified) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-8 border border-amber-100 shadow-xl shadow-amber-50">
            <Mail className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 italic mb-4">Verification Required</h2>
          <p className="text-slate-500 max-w-md font-medium leading-relaxed mb-8">
            Your email is not verified yet. Please check your inbox and click the verification link.
            Need a new link? Use <Link to="/resend-verification" className="text-indigo-600 font-bold hover:underline">Resend Verification</Link> on the login page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user?.isApproved) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-8 border border-indigo-100 shadow-xl shadow-indigo-50 animate-pulse">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 italic mb-4">Verification Complete</h2>
          <p className="text-slate-500 max-w-md font-medium leading-relaxed">
            Your college admin will review your account.
            You'll get an email notification once your account is fully authorized.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fetching Events...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isCollegeAdminFeed) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-indigo-600 rounded-full"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Campus Feed Preview</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Campus Feed Preview</h1>
              <p className="text-slate-500 font-medium max-w-2xl">
                This is what your students currently see.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/create-event")}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Create Event
              </button>
              <button
                onClick={() => navigate("/manage-events")}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Manage Events
              </button>
            </div>
          </header>

          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visible Events</p>
                <p className="text-xl font-black text-slate-900 mt-1">{myCollegeEvents.length}</p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Events</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stats.totalEvents || 0}</p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Now</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stats.ongoingCount || 0}</p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registrations</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stats.totalRegistrations || 0}</p>
              </div>
            </div>
          )}

          <div className="sticky top-24 z-[100] flex flex-col lg:flex-row justify-between items-center bg-white/80 backdrop-blur-xl p-3 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 gap-4">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative flex-1 w-full lg:max-w-xs text-slate-400">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your feed..."
                className="w-full bg-slate-100/50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">What students can see</h2>
                <p className="text-slate-500 text-xs font-medium mt-1">Approved events from your institution that are currently visible in the feed.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 italic">{myCollegeEvents.length}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visible Events</p>
              </div>
            </div>

            {myCollegeEvents.length === 0 ? (
              <div className="p-16 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] text-center space-y-4">
                <Activity className="w-12 h-12 text-slate-200 mx-auto" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No approved events in the feed yet</p>
                <p className="text-sm text-slate-500 max-w-xl mx-auto">
                  If you just created an event, check Manage Events. It will appear here only after approval and once it is active.
                </p>
              </div>
            ) : (
              renderEventCards(myCollegeEvents, true)
            )}
          </section>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-[2px] w-8 bg-indigo-600 rounded-full"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Student Dashboard</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Hello, {user?.firstName}</h1>
            <p className="text-slate-500 font-medium">Explore campus activities and manage your event participation.</p>
          </div>
        </header>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard icon={Compass} label="Events Available" value={myCollegeEvents.length + otherCollegeEvents.length} trend="Total" accent="text-indigo-600 bg-indigo-50 border-indigo-100" />
            <MetricCard icon={Bookmark} label="My Registrations" value={stats.totalRegistrations} trend="Registered" accent="text-blue-600 bg-blue-50 border-blue-100" />
            <MetricCard icon={Ticket} label="Upcoming" value={stats.futureTickets} trend="Confirmed" accent="text-emerald-600 bg-emerald-50 border-emerald-100" />
            <MetricCard icon={Award} label="Attended" value={stats.pastAttended} trend="Completed" accent="text-amber-600 bg-amber-50 border-amber-100" />
          </div>
        )}

        <div className="sticky top-24 z-[100] flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-xl p-3 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 gap-4">
          <div className="flex gap-1 p-1 bg-slate-50 rounded-2xl w-full md:w-auto">
            <NavTab active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" icon={LayoutGrid} />
            <NavTab active={activeTab === 'events'} onClick={() => setActiveTab('events')} label="Explore" icon={Compass} />
            <NavTab active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} label="Activity" icon={Bookmark} />
          </div>

          <div className="relative flex-1 w-full md:max-w-xs text-slate-400">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campus..."
              className="w-full bg-slate-100/50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 text-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {activeTab === 'home' && (
          <div className="space-y-16 animate-fade-in">
            {myCollegeEvents.length > 0 ? (
              <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl group">
                <div className="relative z-10 max-w-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Featured Experience</span>
                  </div>
                  <h2 className="text-5xl font-black italic leading-[1.1] tracking-tighter line-clamp-2">
                    {myCollegeEvents[0].title}
                  </h2>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed line-clamp-2">
                    {myCollegeEvents[0].description}
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => navigate(`/event/${myCollegeEvents[0]._id}`)}
                      className="px-10 py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
                    >
                      Join Now
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block grayscale opacity-40 group-hover:grayscale-0 transition-all duration-1000">
                  <img
                    src={myCollegeEvents[0].bannerImage || "/images/campus_life_professional.png"}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900"></div>
                </div>
              </section>
            ) : (
              <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Discover Campus</span>
                  </div>
                  <h2 className="text-5xl font-black italic leading-[1.1] tracking-tighter">Your Campus, <span className="text-indigo-500">Amplified.</span></h2>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed">Stay tuned for upcoming events, workshops, and seminars at your institution.</p>
                  <div className="pt-4">
                    <button onClick={() => setActiveTab('events')} className="px-10 py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95">Explore All Events</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block grayscale opacity-20">
                  <img src="/images/campus_life_professional.png" className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900"></div>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">For You</h3>
                  <Link to="#" onClick={() => setActiveTab('events')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-4 py-2 bg-indigo-50 rounded-full italic">View All</Link>
                </div>
                {myCollegeEvents.length === 0 ? (
                  <div className="p-20 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] text-center">
                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Quiet on campus today</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {myCollegeEvents.slice(0, 2).map(event => (
                      <Link to={`/event/${event._id}`} key={event._id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-50 transition-all">
                        <div className="h-48 overflow-hidden relative">
                          <img src={event.bannerImage || "/images/campus_life_professional.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black uppercase text-indigo-600 tracking-widest shadow-lg">{event.category}</div>
                        </div>
                        <div className="p-8">
                          <h4 className="font-black text-slate-900 italic mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{event.title}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Activity className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 italic uppercase tracking-widest text-[10px]">Campus Velocity</h4>
                      <p className="text-slate-500 text-xs font-medium">Trends and insights across the university.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{stats?.platformStats?.totalPeers || "0"}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Peers</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{stats?.platformStats?.totalSocieties || "0"}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institutions</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{stats?.platformStats?.avgPulse || "8.5"}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Pulse</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{stats?.platformStats?.totalMoments || "0"}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Moments</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Recent Feedback</h3>
                <div className="space-y-6">
                  {feedbackHistory.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-[2rem] text-center border border-slate-100">
                      <Star className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No history yet</p>
                    </div>
                  ) : (
                    feedbackHistory.slice(0, 3).map(entry => (
                      <div key={entry._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-colors">
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1 italic">{entry.eventId?.title}</h5>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span className="text-[10px] font-black">{entry.rating}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium italic relative z-10">"{entry.comment}"</p>
                        <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                      </div>
                    ))
                  )}
                </div>

                <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl shadow-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-xl">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black italic">Achievements</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stats?.achievement?.tier || "Campus Explorer"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${stats?.achievement?.progress || 10}%` }}></div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {stats?.achievement?.remaining > 0
                        ? `${stats.achievement.remaining} more events till next rank`
                        : "Maximum rank achieved!"}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shrink-0 ${filterCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Around Campus</h2>
                  <p className="text-slate-500 text-xs font-medium mt-1">Opportunities from all institutional partners.</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 italic">{[...myCollegeEvents, ...otherCollegeEvents].length}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Events Live</p>
                </div>
              </div>
              {renderEventCards([...myCollegeEvents, ...otherCollegeEvents])}
            </section>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
              {['all', 'ongoing', 'upcoming', 'past'].map((f) => (
                <button
                  key={f}
                  onClick={() => setParticipationFilter(f)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${participationFilter === f ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50 font-black' : 'text-slate-500 hover:text-slate-900 font-bold'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <div className="col-span-full py-32 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] text-center">
                      <Bookmark className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No registrations found</p>
                    </div>
                  );
                }

                return filtered.map(reg => (
                  <div key={reg._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl hover:shadow-slate-100 transition-all group">
                    <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                      <img src={reg.event?.bannerImage || reg.event?.image || "/images/campus_life_professional.png"} className="w-full h-full object-cover" alt="Banner" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-xl text-slate-900 mb-1">{reg.event?.title}</h3>
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{reg.event?.category}</span>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${reg.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {reg.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <p className="text-xs font-bold text-slate-700">{reg.waitlistPosition ? `Waitlisted #${reg.waitlistPosition}` : reg.status}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                          <p className="text-xs font-bold text-slate-700">{new Date(reg.event?.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Link to={`/event/${reg.event?._id}`} className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors text-center">Details</Link>
                        {reg.status === 'waitlisted' && reg.confirmationDeadline && (
                          <button className="flex-1 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Confirm Spot</button>
                        )}
                        {reg.status !== 'attended' && (
                          <button className="px-6 py-3 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-colors">Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
            <section className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                  <Bookmark className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 italic">Participation Archive</h3>
                  <p className="text-slate-500 font-medium tracking-tight">Access your e-certificates and platform rewards after providing event reflections.</p>
                </div>
              </div>

              <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black italic">Claim Your Certificates</h4>
                    <p className="text-indigo-100 text-sm font-medium">You have {registrations.filter(r => r.status === 'attended' && !feedbackHistory.some(f => String(f.eventId?._id || f.eventId) === String(r.event?._id))).length} pending reviews.</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    {registrations
                      .filter((r) => r.status === "attended" && !feedbackHistory.some((f) => String(f.eventId?._id || f.eventId) === String(r.event?._id)))
                      .map((r) => (
                        <Link key={r._id} to={`/event/${r.event?._id}`} className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all text-center">
                          Review {r.event?.title}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const NavTab = ({ active, onClick, label, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 w-full md:w-auto ${active
      ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100'
      : 'text-slate-400 hover:text-slate-900 hover:bg-white'
      }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 transition-colors' : 'text-slate-300'}`} />
    {label}
  </button>
);

const Search = ({ className, ...props }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MetricCard = ({ icon: Icon, label, value, trend, accent }) => (
  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 overflow-hidden relative group">
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-4 rounded-2xl border ${accent} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-[9px] font-black px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-widest">
        {trend}
      </div>
    </div>
    <div className="mt-8 relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900 tracking-tight italic">{value}</p>
    </div>
  </div>
);

export default StudentDashboard;
