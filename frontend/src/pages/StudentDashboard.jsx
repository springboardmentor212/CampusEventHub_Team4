import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ContentEmptyState from "../components/ContentEmptyState";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { fetchEvents } from "../services/eventService";
import {
  cancelRegistration as cancelRegistrationRequest,
  fetchMyRegistrations,
} from "../services/registrationService";
import {
  Calendar,
  Clock,
  Compass,
  Layers,
  MapPin,
  Search,
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

const StudentDashboard = ({ view = "alias" }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Prevent superadmin from seeing student dashboard
  if (user && (user.role === 'admin' || String(user.role).toLowerCase().includes('admin'))) {
    window.location.replace('/superadmin');
    return null;
  }

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

  const sectionAlias = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get("section");
  }, [location.search]);

  const resolvedView = useMemo(() => {
    if (view && view !== "alias") return view;
    if (location.pathname === "/student/dashboard") return "dashboard";
    if (location.pathname === "/student/explore") return "explore";
    if (location.pathname === "/student/my-events") return "my-events";
    if (location.pathname === "/student/activity") return "activity";

    if (location.pathname === "/campus-feed") {
      if (sectionAlias === "discover") return "explore";
      if (sectionAlias === "my-events") return "my-events";
      if (sectionAlias === "activity") return "activity";
    }

    return "dashboard";
  }, [view, location.pathname, sectionAlias]);

  const showDashboard = resolvedView === "dashboard";
  const showExplore = resolvedView === "explore";
  const showMyEvents = resolvedView === "my-events";
  const showActivity = resolvedView === "activity";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myCollegeRes, otherCollegeRes, statsRes, myRegsRes] = await Promise.allSettled([
        fetchEvents({ scope: "my_college" }),
        fetchEvents({ scope: "other_colleges" }),
        API.get("/dashboards/student"),
        fetchMyRegistrations(),
      ]);

      const myCollegeEvents = myCollegeRes.status === "fulfilled" ? (myCollegeRes.value?.data?.data?.events || []) : [];
      const otherCollegeEvents = otherCollegeRes.status === "fulfilled" ? (otherCollegeRes.value?.data?.data?.events || []) : [];

      setDiscover([...myCollegeEvents, ...otherCollegeEvents]);
      setStats(statsRes.status === "fulfilled" ? (statsRes.value?.data?.data || null) : null);
      setRegistrations(myRegsRes.status === "fulfilled" ? (myRegsRes.value?.data?.data?.registrations || []) : []);
    } catch (error) {
      toast.error("We couldn't load your dashboard just yet.");
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

  const recommendedEvents = useMemo(() => {
    const now = new Date();
    return [...discover]
      .filter((event) => event.startDate && new Date(event.startDate) > now)
      .sort((a, b) => (b.currentParticipants || 0) - (a.currentParticipants || 0))
      .slice(0, 3);
  }, [discover]);

  const cancelRegistration = async (registrationId) => {
    try {
      await cancelRegistrationRequest(registrationId);
      toast.success("Registration cancelled.");
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel registration.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-500 shadow-sm">
            Getting your dashboard ready...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const myCollegeLabel = String(user?.college?.name || user?.collegeName || user?.college || "").trim();
  const myCollegeLower = myCollegeLabel.toLowerCase();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-10 pb-16">
        {showDashboard && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm md:px-8 md:py-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Your dashboard</p>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                    Hello, {user?.firstName || "Student"}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                    Keep track of what is coming up, where you stand, and what to explore next.
                  </p>
                </div>

                {nextEvent ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Coming up next</p>
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                            {nextEvent.event?.title}
                          </h2>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-2">
                              <Clock className="h-4 w-4 text-indigo-600" />
                              {new Date(nextEvent.event.startDate).toLocaleString()}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-indigo-600" />
                              {nextEvent.event?.location || "Location will be shared soon"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/event/${nextEvent.event?._id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                        >
                          View event details
                        </Link>
                        {canCancel(nextEvent) && (
                          <button
                            onClick={() => cancelRegistration(nextEvent._id)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                          >
                            Leave this event
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ContentEmptyState
                    icon={Calendar}
                    title="Your next event will show up here"
                    description="Browse upcoming events and reserve a spot when something feels worth your time."
                    actionLabel="Explore events"
                    onAction={() => (window.location.href = "/student/explore")}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="grid w-full grid-cols-2 gap-3 xl:max-w-md">
                <StatCard label="Joined" value={stats?.totalRegistrations || registrations.length} icon={UserCheck} />
                <StatCard
                  label="On waitlist"
                  value={stats?.waitlistedCount || registrations.filter((registration) => registration.status === "waitlisted").length}
                  icon={Layers}
                />
                <StatCard
                  label="Coming up"
                  value={stats?.futureTickets || registrations.filter((registration) => registration.status === "approved" && isUpcoming(registration)).length}
                  icon={Calendar}
                />
                <StatCard label="Attended" value={attendedCount} icon={Compass} />
              </div>
            </div>
          </section>
        )}

        {showDashboard && (
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Panel
              title="Worth a Look"
              eyebrow="Picked for you"
              contentClassName="space-y-3"
            >
              {recommendedEvents.length === 0 && (
                <p className="text-sm leading-6 text-slate-500">As you browse and attend more events, better recommendations will appear here.</p>
              )}
              {recommendedEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/event/${event._id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-indigo-300 hover:bg-white"
                >
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-900 md:text-base">{event.title}</p>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {event.college?.name || "Campus event"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {event.startDate ? new Date(event.startDate).toLocaleString() : "Schedule details are still being finalized"}
                    </p>
                  </div>
                </Link>
              ))}
            </Panel>

            <Panel
              title="Recent Activity"
              eyebrow="Latest updates"
              contentClassName="space-y-4"
            >
              {activityTimeline.length === 0 && (
                <p className="text-sm leading-6 text-slate-500">When you register, cancel, or join a waitlist, those updates will appear here.</p>
              )}
              {activityTimeline.map((registration, index) => (
                <div key={registration._id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600" />
                    {index !== activityTimeline.length - 1 && <span className="mt-2 h-full w-px bg-slate-200" />}
                  </div>
                  <div className="min-w-0 space-y-1.5 pb-4">
                    <p className="text-sm font-medium leading-6 text-slate-900">
                      {registration.status === "waitlisted" ? "You joined the waitlist for" : "You registered for"} {registration.event?.title}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {new Date(registration.createdAt || registration.registrationDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </Panel>
          </section>
        )}

        {showMyEvents && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm md:px-8 md:py-8" id="my-events">
            <SectionHeader
              eyebrow="Your schedule"
              title="My Events"
              description="Track your registrations, waitlist spots, and past activity in one place."
            />

            <div className="mt-6 flex flex-wrap gap-2">
              {["upcoming", "waitlisted", "past", "cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMyEventsTab(tab)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-semibold capitalize transition-colors ${
                    myEventsTab === tab
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {myEventsByTab.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-900">Nothing to show in this section yet.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Explore upcoming events to start building a schedule that feels worth keeping.</p>
                  <Link
                    to="/student/explore"
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Explore events
                  </Link>
                </div>
              )}

              {myEventsByTab.map((registration) => (
                <div
                  key={registration._id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-base font-semibold text-slate-950">{registration.event?.title}</p>
                      <StatusPill status={registration.status} />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {registration.event?.college?.name || "Campus event"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {registration.event?.startDate ? new Date(registration.event.startDate).toLocaleString() : "Schedule details are still being finalized"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/event/${registration.event?._id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                    >
                      Open details
                    </Link>
                    {canCancel(registration) && (
                      <button
                        onClick={() => cancelRegistration(registration._id)}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        Cancel registration
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {showExplore && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm md:px-8 md:py-8" id="discover">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Discovery"
                title="Discover Events"
                description="Find campus events that match your interests, timing, and availability."
              />
              <div className="inline-flex w-fit items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {discoverByTab.length} events
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, location, or topic"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400"
                />
              </div>

              <select
                value={institutionFilter}
                onChange={(event) => setInstitutionFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400"
              >
                <option value="all">All Campuses</option>
                {myCollegeLabel && <option value={myCollegeLower}>{myCollegeLabel}</option>}
                {colleges.filter((college) => college !== myCollegeLower).map((college) => (
                  <option key={college} value={college}>
                    {college.toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400"
              >
                <option value="all">All categories</option>
                <option value="technical">Technical</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="hackathon">Hackathon</option>
                <option value="career">Career</option>
              </select>
            </div>

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "upcoming", label: "Upcoming" },
                  { key: "today", label: "Today" },
                  { key: "this_week", label: "This Week" },
                  { key: "all", label: "Any time" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setDateFilter(option.key)}
                    className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                      dateFilter === option.key
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: "upcoming", label: "Soonest", icon: Calendar },
                  { key: "trending", label: "Popular", icon: TrendingUp },
                  { key: "recommended", label: "For you", icon: Zap },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDiscoverTab(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                      discoverTab === tab.key
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {discoverByTab.slice(0, 9).map((event) => {
                const seatsFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;

                return (
                  <Link
                    to={`/event/${event._id}`}
                    key={event._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-indigo-300"
                  >
                    <img src={event.bannerImage || "/images/campus_life_professional.png"} alt={event.title} className="h-40 w-full object-cover" />
                    <div className="space-y-3 px-5 py-5">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                          {event.college?.name || "Campus event"}
                        </p>
                        <h4 className="line-clamp-2 text-base font-semibold tracking-tight text-slate-950 transition-colors group-hover:text-indigo-700">
                          {event.title}
                        </h4>
                      </div>

                      <div className="space-y-1.5 text-sm text-slate-600">
                        <p>{event.startDate ? new Date(event.startDate).toLocaleString() : "Schedule details are still being finalized"}</p>
                        <p>Seats filled: {event.currentParticipants || 0} / {event.maxParticipants || "Open"}</p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          seatsFull
                            ? "border border-amber-200 bg-amber-50 text-amber-700"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {seatsFull ? "Joinable by waitlist" : "Registration open"}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {discoverByTab.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-900">Nothing matches these filters right now.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Try a broader date range or clear a filter to uncover more events.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {showActivity && (
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]" id="activity">
            <Panel
              title="Activity Timeline"
              eyebrow="History"
              contentClassName="space-y-4"
            >
              {activityTimeline.length === 0 && (
                <p className="text-sm leading-6 text-slate-500">Once you start joining events, your activity timeline will build itself here.</p>
              )}

              {activityTimeline.map((registration, index) => (
                <div key={registration._id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600" />
                    {index !== activityTimeline.length - 1 && <span className="mt-2 h-full w-px bg-slate-200" />}
                  </div>
                  <div className="min-w-0 space-y-1.5 pb-4">
                    <p className="text-sm font-medium leading-6 text-slate-900">
                      {registration.status === "waitlisted" ? "You joined the waitlist for" : "You registered for"} {registration.event?.title}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {new Date(registration.createdAt || registration.registrationDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </Panel>

            <Panel
              title="Campus Snapshot"
              eyebrow="At a glance"
              contentClassName="space-y-6"
            >
              <div className="grid grid-cols-2 gap-3">
                <InsightCard icon={Compass} label="Available now" value={discover.length} />
                <InsightCard icon={Users} label="Popular picks" value={insights.trending.length} />
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Getting attention right now</p>
                <div className="space-y-2">
                  {insights.trending.map((event) => (
                    <Link
                      key={event._id}
                      to={`/event/${event._id}`}
                      className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition-colors hover:border-indigo-300 hover:text-indigo-700"
                    >
                      {event.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Popular categories</p>
                <div className="flex flex-wrap gap-2">
                  {insights.topCategories.map((item) => (
                    <span key={item.category} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {item.category}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
            </Panel>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

const SectionHeader = ({ eyebrow, title, description }) => (
  <div className="space-y-2">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
    {description ? <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
  </div>
);

const Panel = ({ eyebrow, title, children, contentClassName = "" }) => (
  <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm md:px-7 md:py-7">
    <div className="border-b border-slate-200 pb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
    </div>
    <div className={`pt-5 ${contentClassName}`}>{children}</div>
  </div>
);

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      </div>
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2">
        <Icon className="h-4 w-4 text-indigo-600" />
      </div>
    </div>
  </div>
);

const InsightCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      </div>
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2">
        <Icon className="h-4 w-4 text-indigo-600" />
      </div>
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  const styles = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    waitlisted: "border-amber-200 bg-amber-50 text-amber-700",
    cancelled: "border-rose-200 bg-rose-50 text-rose-700",
    attended: "border-indigo-200 bg-indigo-50 text-indigo-700",
    no_show: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
        styles[status] || "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {status === "approved" ? "confirmed" : status === "waitlisted" ? "waitlisted" : status === "cancelled" ? "cancelled" : status === "attended" ? "attended" : status === "no_show" ? "missed" : status}
    </span>
  );
};

export default StudentDashboard;
