import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Compass,
  Layers,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

const isUpcoming = (registration) => {
  if (!registration?.event?.startDate) return false;
  return ["approved", "waitlisted"].includes(registration.status) && new Date(registration.event.startDate) > new Date();
};

const isPast = (registration) => {
  if (!registration?.event?.endDate) return false;
  return ["attended", "no_show", "approved"].includes(registration.status) && new Date(registration.event.endDate) < new Date();
};

const canCancel = (registration) => {
  if (!registration?.event?.startDate) return false;
  if (registration.status === "waitlisted") return true;
  if (registration.status !== "approved") return false;

  const cutoff = new Date(new Date(registration.event.startDate).getTime() - 24 * 60 * 60 * 1000);
  return new Date() <= cutoff;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [discover, setDiscover] = useState([]);

  const [search, setSearch] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("upcoming");
  const [discoverTab, setDiscoverTab] = useState("upcoming");
  const [myEventsTab, setMyEventsTab] = useState("upcoming");

  const myEventsRef = useRef(null);
  const discoverRef = useRef(null);
  const activityRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myCollegeRes, otherCollegeRes, statsRes, myRegsRes] = await Promise.allSettled([
        API.get("/events", { params: { scope: "my_college" } }),
        API.get("/events", { params: { scope: "other_colleges" } }),
        API.get("/dashboards/student"),
        API.get("/registrations/my"),
      ]);

      const myCollegeEvents = myCollegeRes.status === "fulfilled" ? (myCollegeRes.value?.data?.data?.events || []) : [];
      const otherCollegeEvents = otherCollegeRes.status === "fulfilled" ? (otherCollegeRes.value?.data?.data?.events || []) : [];

      setDiscover([...myCollegeEvents, ...otherCollegeEvents]);
      setStats(statsRes.status === "fulfilled" ? (statsRes.value?.data?.data || null) : null);
      setRegistrations(myRegsRes.status === "fulfilled" ? (myRegsRes.value?.data?.data?.registrations || []) : []);
    } catch (error) {
      toast.error("Failed to load student dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const collegeName = String(user?.college?.name || user?.collegeName || user?.college || "").trim().toLowerCase();
    if (!collegeName || institutionFilter !== "all") return;

    const hasCollegeEvents = discover.some(
      (event) => String(event.college?.name || "").trim().toLowerCase() === collegeName
    );

    if (hasCollegeEvents) {
      setInstitutionFilter(collegeName);
    }
  }, [discover, user, institutionFilter]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const section = query.get("section");

    if (section === "my-events") {
      myEventsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "discover") {
      discoverRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (section === "activity") {
      activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.search]);

  const nextEvent = useMemo(() => {
    return registrations
      .filter((registration) => registration.status === "approved" && registration.event?.startDate)
      .sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate))[0];
  }, [registrations]);

  const attendedCount = useMemo(() => {
    return registrations.filter((registration) => registration.status === "attended").length;
  }, [registrations]);

  const myEventsByTab = useMemo(() => {
    if (myEventsTab === "upcoming") return registrations.filter(isUpcoming);
    if (myEventsTab === "waitlisted") return registrations.filter((registration) => registration.status === "waitlisted");
    if (myEventsTab === "past") return registrations.filter(isPast);
    if (myEventsTab === "cancelled") return registrations.filter((registration) => registration.status === "cancelled");
    return registrations;
  }, [registrations, myEventsTab]);

  const activityTimeline = useMemo(() => {
    return [...registrations]
      .sort((a, b) => new Date(b.createdAt || b.registrationDate || 0) - new Date(a.createdAt || a.registrationDate || 0))
      .slice(0, 8);
  }, [registrations]);

  const colleges = useMemo(() => {
    return [
      ...new Set(
        discover
          .map((event) => String(event.college?.name || "").toLowerCase())
          .filter(Boolean)
      ),
    ];
  }, [discover]);

  const filteredDiscover = useMemo(() => {
    const now = new Date();

    return discover.filter((event) => {
      const title = String(event.title || "").toLowerCase();
      const desc = String(event.description || "").toLowerCase();
      const locationText = String(event.location || "").toLowerCase();
      const eventCategory = String(event.category || "").toLowerCase();
      const institution = String(event.college?.name || "").toLowerCase();

      const matchesSearch = !search || title.includes(search.toLowerCase()) || desc.includes(search.toLowerCase()) || locationText.includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || eventCategory === categoryFilter;
      const matchesInstitution = institutionFilter === "all" || institution === institutionFilter;

      const start = event.startDate ? new Date(event.startDate) : null;
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "upcoming" && start && start > now) ||
        (dateFilter === "today" && start && start.toDateString() === now.toDateString()) ||
        (dateFilter === "this_week" && start && start > now && start < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesCategory && matchesInstitution && matchesDate;
    });
  }, [discover, search, categoryFilter, institutionFilter, dateFilter]);

  const discoverByTab = useMemo(() => {
    if (discoverTab === "trending") {
      return [...filteredDiscover].sort((a, b) => (b.currentParticipants || 0) - (a.currentParticipants || 0));
    }

    if (discoverTab === "recommended") {
      const attendedCategories = registrations
        .filter((registration) => ["approved", "attended"].includes(registration.status))
        .map((registration) => String(registration.event?.category || "").toLowerCase())
        .filter(Boolean);

      const categoryScore = attendedCategories.reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return [...filteredDiscover].sort((a, b) => {
        const aScore = categoryScore[String(a.category || "").toLowerCase()] || 0;
        const bScore = categoryScore[String(b.category || "").toLowerCase()] || 0;
        return bScore - aScore;
      });
    }

    return [...filteredDiscover].sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
  }, [discoverTab, filteredDiscover, registrations]);

  const insights = useMemo(() => {
    const categoryMap = {};
    for (const event of discover) {
      const category = event.category || "other";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    }

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    const trending = [...discover]
      .sort((a, b) => (b.currentParticipants || 0) - (a.currentParticipants || 0))
      .slice(0, 3);

    return { topCategories, trending };
  }, [discover]);

  const cancelRegistration = async (registrationId) => {
    try {
      await API.delete(`/registrations/${registrationId}`);
      toast.success("Registration cancelled.");
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel registration.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center text-sm font-semibold text-slate-500">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  const myCollegeLabel = String(user?.college?.name || user?.collegeName || user?.college || "").trim();
  const myCollegeLower = myCollegeLabel.toLowerCase();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white p-6 md:p-8">
          <p className="text-xs uppercase tracking-widest text-indigo-200">Student Dashboard</p>
          <h1 className="text-2xl md:text-4xl font-black mt-2">Hello, {user?.firstName || "Student"} 👋</h1>
          <p className="text-slate-200 mt-1">What you need now, your events, and smarter campus discovery.</p>

          {nextEvent ? (
            <div className="mt-6 rounded-2xl bg-white/10 border border-white/20 p-4 md:p-5">
              <p className="text-xs uppercase tracking-widest text-indigo-100">Your Next Event</p>
              <h2 className="text-xl font-bold mt-2">{nextEvent.event?.title}</h2>
              <div className="mt-2 text-sm text-slate-200 flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(nextEvent.event.startDate).toLocaleString()}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{nextEvent.event?.location || "TBA"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={`/event/${nextEvent.event?._id}`} className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black uppercase tracking-widest">View Details</Link>
                {canCancel(nextEvent) && (
                  <button
                    onClick={() => cancelRegistration(nextEvent._id)}
                    className="px-4 py-2 rounded-xl border border-white/50 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10"
                  >
                    Cancel Registration
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-white/10 border border-white/20 p-4 md:p-5">
              <p className="text-xs uppercase tracking-widest text-indigo-100">Your Next Event</p>
              <p className="mt-2 text-lg font-bold">No confirmed events yet.</p>
              <p className="text-sm text-slate-200 mt-1">Explore events to participate across campuses.</p>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Registered" value={stats?.totalRegistrations || registrations.length} icon={UserCheck} />
          <StatCard label="Waitlisted" value={stats?.waitlistedCount || registrations.filter((registration) => registration.status === "waitlisted").length} icon={Layers} />
          <StatCard label="Upcoming" value={stats?.futureTickets || registrations.filter((registration) => registration.status === "approved" && isUpcoming(registration)).length} icon={Calendar} />
          <StatCard label="Attended" value={attendedCount} icon={Sparkles} />
          <StatCard label="Feedback" value={stats?.feedbackPending || 0} icon={TrendingUp} />
        </section>

        <section ref={myEventsRef} id="my-events" className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900">My Events</h3>

          <div className="flex flex-wrap gap-2">
            {["upcoming", "waitlisted", "past", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setMyEventsTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${myEventsTab === tab ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {myEventsByTab.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center bg-slate-50">
                <p className="text-sm font-bold text-slate-800">You haven't joined any events yet.</p>
                <p className="text-xs text-slate-500 mt-1">Start by exploring events across campuses.</p>
                <button
                  onClick={() => discoverRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="mt-3 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Explore Events
                </button>
              </div>
            )}

            {myEventsByTab.map((registration) => (
              <div key={registration._id} className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{registration.event?.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{registration.event?.college?.name || "Campus Event"}</p>
                  <p className="text-xs text-slate-500 mt-1">{registration.event?.startDate ? new Date(registration.event.startDate).toLocaleString() : "TBA"}</p>
                  <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider">{registration.status === "approved" ? "Seats Confirmed" : `Status: ${registration.status}`}</p>
                </div>

                <div className="flex gap-2">
                  <Link to={`/event/${registration.event?._id}`} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold">View</Link>
                  {canCancel(registration) && (
                    <button
                      onClick={() => cancelRegistration(registration._id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={discoverRef} id="discover" className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Discover Events</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">{discoverByTab.length} visible</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <select value={institutionFilter} onChange={(event) => setInstitutionFilter(event.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
              <option value="all">All Campuses</option>
              {myCollegeLabel && <option value={myCollegeLower}>{myCollegeLabel}</option>}
              {colleges.filter((college) => college !== myCollegeLower).map((college) => (
                <option key={college} value={college}>{college.toUpperCase()}</option>
              ))}
            </select>

            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
              <option value="all">Category: All</option>
              <option value="technical">Technical</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="hackathon">Hackathon</option>
              <option value="career">Career</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "upcoming", label: "Date: Upcoming" },
              { key: "today", label: "Date: Today" },
              { key: "this_week", label: "Date: This Week" },
              { key: "all", label: "Date: All" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setDateFilter(option.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${dateFilter === option.key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "upcoming", label: "Upcoming", icon: Calendar },
              { key: "trending", label: "Trending", icon: TrendingUp },
              { key: "recommended", label: "Recommended", icon: Zap },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDiscoverTab(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${discoverTab === tab.key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {discoverByTab.slice(0, 9).map((event) => {
              const seatsFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;

              return (
                <Link to={`/event/${event._id}`} key={event._id} className="rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 transition-colors">
                  <img src={event.bannerImage || "/images/campus_life_professional.png"} alt={event.title} className="h-36 w-full object-cover" />
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 line-clamp-2">{event.title}</h4>
                    <p className="text-xs text-slate-600">{event.college?.name || "Campus Event"}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{event.startDate ? new Date(event.startDate).toLocaleString() : "TBA"}</p>
                    <p className="text-xs text-slate-600">Seats: {event.currentParticipants || 0} / {event.maxParticipants || "Open"}</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${seatsFull ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                      {seatsFull ? "Join Waitlist" : "Register"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section ref={activityRef} id="activity" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Activity Timeline</h3>
            <div className="space-y-3">
              {activityTimeline.length === 0 && <p className="text-sm text-slate-500">No recent activity.</p>}
              {activityTimeline.map((registration) => (
                <div key={registration._id} className="flex items-start gap-3">
                  <span className="mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <div>
                    <p className="text-sm text-slate-800">
                      {registration.status === "waitlisted" ? "Joined waitlist for" : "Registered for"} {registration.event?.title}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(registration.createdAt || registration.registrationDate).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Campus Insights</h3>
            <div className="grid grid-cols-2 gap-3">
              <InsightCard icon={Compass} label="Total Discoverable" value={discover.length} />
              <InsightCard icon={Users} label="Top Campus Events" value={insights.trending.length} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Trending Events</p>
              <div className="space-y-2">
                {insights.trending.map((event) => (
                  <Link key={event._id} to={`/event/${event._id}`} className="block text-sm text-slate-800 hover:text-indigo-700">
                    {event.title}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Popular Categories</p>
              <div className="flex flex-wrap gap-2">
                {insights.topCategories.map((item) => (
                  <span key={item.category} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {item.category}: {item.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
      <Icon className="w-4 h-4 text-indigo-600" />
    </div>
    <p className="text-2xl font-black text-slate-900 mt-2">{value}</p>
  </div>
);

const InsightCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 p-3">
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
      <Icon className="w-4 h-4 text-emerald-600" />
    </div>
    <p className="text-xl font-black text-slate-900 mt-2">{value}</p>
  </div>
);

export default StudentDashboard;
