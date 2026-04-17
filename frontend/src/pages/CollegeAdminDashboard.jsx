import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { fetchMyEvents } from "../services/eventService";
import { fetchEventRegistrations, rejectRegistration } from "../services/registrationService";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Search,
  ArrowRight,
  Plus,
  FileText,
  Settings,
  UserCheck,
  ClipboardList,
  LayoutDashboard,
  AlertCircle,
  Check,
  Zap,
  Activity,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Globe,
  DollarSign,
  Briefcase,
  Info,
  Mail,
  Phone,
  AlertTriangle,
  Star,
  MessageSquare,
  Trophy,
  X,
  Loader2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";

const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");
    // Fetch all students for this college
    const fetchAllStudents = async () => {
      try {
        setStudentsLoading(true);
        const res = await API.get("/auth/college/all-students");
        setAllStudents(res.data?.data?.users || []);
      } catch (err) {
        setAllStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
  const [pendingStudentsLoading, setPendingStudentsLoading] = useState(false);
  const [feedbackRows, setFeedbackRows] = useState([]);
  const [feedbackSummaries, setFeedbackSummaries] = useState([]);
  const [feedbackMeta, setFeedbackMeta] = useState({ responseRate: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, topIssues: [] });
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectionDetail, setSelectionDetail] = useState({ show: false, type: null, data: null });
  const [regSearch, setRegSearch] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("all");
  const [regEventFilter, setRegEventFilter] = useState("all");
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);

  // Rejection Modal State
  const [rejectionModal, setRejectionModal] = useState({ show: false, id: null, type: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
  const emptyStats = { totalEvents: 0, ongoingCount: 0, totalRegistrations: 0, totalParticipants: 0, pendingRegistrations: 0, averageCapacityPercent: 0, pendingApprovalCount: 0, capacityAlerts: [] };

  useEffect(() => {
    fetchDashboardData();
    fetchPendingStudents();
    fetchAllStudents();
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await API.get("/feedback/college/mine");
      setFeedbackRows(res.data?.data?.feedback || []);
      setFeedbackSummaries(res.data?.data?.eventSummaries || []);
      setFeedbackMeta(res.data?.data?.analytics || { responseRate: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, topIssues: [] });
    } catch (err) {
      setFeedbackRows([]);
      setFeedbackSummaries([]);
      setFeedbackMeta({ responseRate: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, topIssues: [] });
    }
  };

  const fetchManagedRegistrations = async (events) => {
    if (!events.length) {
      setRegistrations([]);
      return;
    }

    const registrationResults = await Promise.allSettled(
      events.map((event) => fetchEventRegistrations(event._id))
    );

    const nextRegistrations = registrationResults.flatMap((result, index) => {
      if (result.status !== "fulfilled") {
        return [];
      }

      const sourceEvent = events[index];
      const rows = result.value?.data?.data?.registrations || [];

      return rows.map((registration) => ({
        ...registration,
        event: registration.event && typeof registration.event === "object"
          ? registration.event
          : {
              _id: sourceEvent._id,
              title: sourceEvent.title,
              category: sourceEvent.category,
            },
      }));
    });

    setRegistrations(nextRegistrations);
  };

  const fetchPendingStudents = async () => {
    try {
      setPendingStudentsLoading(true);
      const res = await API.get("/auth/college/pending-students");
      setPendingStudents(res.data?.data?.users || []);
    } catch (err) {
      setPendingStudents([]);
    } finally {
      setPendingStudentsLoading(false);
    }
  };

  const handlePendingStudentAction = async (studentId, action) => {
    if (action === "reject") {
      setRejectionModal({ show: true, id: studentId, type: 'student' });
      return;
    }
    try {
      await API.patch(`/auth/admin/approve-user/${studentId}`);
      toast.success("Student approved");
      fetchPendingStudents();
      fetchAllStudents();
    } catch (err) {
      toast.error("Failed to approve student");
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setRejectionLoading(true);
    try {
      if (rejectionModal.type === 'student') {
        await API.delete(`/auth/admin/reject-user/${rejectionModal.id}`, { data: { reason: rejectionReason } });
        toast.success("Student application rejected");
        fetchPendingStudents();
        fetchAllStudents();
      } else {
        await rejectRegistration(rejectionModal.id, { reason: rejectionReason });
        toast.success("Registration rejected");
        fetchDashboardData();
      }
      setRejectionModal({ show: false, id: null, type: null });
      setRejectionReason("");
    } catch (err) {
      toast.error("Rejection failed");
    } finally {
      setRejectionLoading(false);
    }
  };
  // Filtered students for all-students view
  const filteredAllStudents = allStudents.filter((student) => {
    const haystack = `${student.firstName || ""} ${student.lastName || ""} ${student.email || ""}`.toLowerCase();
    const status = student.accountStatus;
    const matchesSearch = haystack.includes(studentSearch.toLowerCase());
    const matchesStatus = studentStatusFilter === "all" || status === studentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, eventsRes] = await Promise.allSettled([
        API.get("/dashboards/college-admin"),
        API.get("/dashboards/analytics"),
        fetchMyEvents()
      ]);
      setStats(statsRes.status === "fulfilled" ? { ...emptyStats, ...statsRes.value?.data?.data } : emptyStats);
      setAnalytics(analyticsRes.status === "fulfilled" ? analyticsRes.value?.data?.data : null);

      const events = eventsRes.status === "fulfilled" ? (eventsRes.value?.data?.data?.events || []) : [];
      setMyEvents(events);
      await fetchManagedRegistrations(events);
    } catch (err) {
      toast.error("Failed to load dashboard data.");
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (regId, status) => {
    toast("Registrations are auto-managed. Students are confirmed or waitlisted automatically.");
  };

  const handleViewEvent = (event) => {
    setSelectionDetail({ show: true, type: 'event', data: event });
  };

  const handleViewStudent = (student) => {
    setSelectionDetail({ show: true, type: 'user', data: student });
  };

  const pendingRegistrations = registrations.filter(r => r.status === 'pending');
  const averageRating = feedbackSummaries.length
    ? (feedbackSummaries.reduce((acc, curr) => acc + (curr.avgRating || 0), 0) / feedbackSummaries.length)
    : null;
  const ratingDisplay = averageRating ? `${averageRating.toFixed(1)} / 5` : "-";
  const registrationsThisMonth = (analytics?.registrationTrend || []).reduce((acc, row) => acc + (row.count || 0), 0);

  const filteredActivity = (stats?.recentActivity || [])
    .filter((activity) => {
      const msg = (activity.displayMessage || activity.message || "").toLowerCase();
      const title = (activity.title || "").toLowerCase();
      const type = (activity.type || "").toLowerCase();

      if (title === "account approved") return false;
      if (msg.includes("you can now log in")) return false;
      if (type === "success" && msg.includes("approved")) return false;

      return (
        msg.includes("student") ||
        msg.includes("registration") ||
        msg.includes("event") ||
        msg.includes("application")
      );
    })
    .slice(0, 5);

  const recentEvents = [...myEvents].slice(0, 3);

  const getEventStatusLabel = (event) => {
    if (event.status === "cancelled") return "Cancelled";
    if (event.hasPendingUpdate) return "Update Pending";
    if (!event.isApproved || event.status === "pending_approval") return "Pending Approval";
    if (event.status === "rejected") return "Rejected";
    if (event.status === "paused") return "Paused";
    return "Live";
  };

  const getMyEventStatusKey = (event) => {
    if (event.status === "cancelled") return "cancelled";
    if (event.status === "rejected") return "rejected";
    if (event.status === "paused") return "paused";
    if (event.hasPendingUpdate || !event.isApproved || event.status === "pending_approval") return "pending";
    return "live";
  };

  const getEventStatusClass = (event) => {
    if (event.status === "cancelled") return "bg-slate-100 text-slate-600";
    if (event.hasPendingUpdate) return "bg-blue-50 text-blue-600";
    if (!event.isApproved || event.status === "pending_approval") return "bg-amber-50 text-amber-600";
    if (event.status === "rejected") return "bg-rose-50 text-rose-600";
    if (event.status === "paused") return "bg-orange-50 text-orange-600";
    return "bg-emerald-50 text-emerald-600";
  };

  const feedbackByEvent = feedbackSummaries.reduce((acc, row) => {
    acc[String(row.eventId)] = row;
    return acc;
  }, {});

  const eventStatusCounts = {
    all: myEvents.length,
    live: myEvents.filter((event) => getMyEventStatusKey(event) === "live").length,
    pending: myEvents.filter((event) => getMyEventStatusKey(event) === "pending").length,
    paused: myEvents.filter((event) => getMyEventStatusKey(event) === "paused").length,
    rejected: myEvents.filter((event) => getMyEventStatusKey(event) === "rejected").length,
  };

  const filteredMyEvents = myEvents
    .filter((event) => event.title?.toLowerCase().includes(eventSearch.toLowerCase()))
    .filter((event) => eventStatusFilter === "all" || getMyEventStatusKey(event) === eventStatusFilter);

  const normalizeRegistrationStatus = (status) => {
    if (status === "confirmed") return "approved";
    return status;
  };

  const registrationsWithMeta = registrations.map((registration) => ({
    ...registration,
    normalizedStatus: normalizeRegistrationStatus(registration.status),
  }));

  const registrationCounts = {
    all: registrationsWithMeta.length,
    pending: registrationsWithMeta.filter((r) => r.normalizedStatus === "pending").length,
    approved: registrationsWithMeta.filter((r) => r.normalizedStatus === "approved").length,
    rejected: registrationsWithMeta.filter((r) => r.normalizedStatus === "rejected").length,
  };

  const filteredRegistrations = registrationsWithMeta
    .filter((r) => regStatusFilter === "all" || r.normalizedStatus === regStatusFilter)
    .filter((r) => regEventFilter === "all" || String(r.event?._id) === regEventFilter)
    .filter((r) => {
      if (!regSearch) return true;
      const haystack = `${r.user?.firstName || ""} ${r.user?.lastName || ""} ${r.user?.email || ""} ${r.event?.title || ""}`.toLowerCase();
      return haystack.includes(regSearch.toLowerCase());
    });

  const registrationEmptyLabel = regStatusFilter === "pending"
    ? "No pending registrations."
    : regStatusFilter === "approved"
      ? "No approved registrations yet."
      : regStatusFilter === "rejected"
        ? "No rejected registrations."
        : "No registrations yet.";

  const participationStyleLabel = (registration) => {
    const teamSize = Number(registration.teamSize || registration.customRequirements?.teamSize || registration.customResponses?.teamSize || 1);
    if (teamSize === 2) return "Duo";
    if (teamSize === 3) return "Trio";
    if (teamSize >= 4) return "Quad";
    return "Solo";
  };

  const renderStars = (rating = 0) => {
    const rounded = Math.round(Number(rating));
    return "*****".slice(0, rounded) + ".....".slice(0, 5 - rounded);
  };

  if (!user?.isVerified) {
    return (
      <DashboardLayout pendingRegistrations={pendingRegistrations.length} pendingStudents={pendingStudents.length}>
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
      <DashboardLayout pendingRegistrations={pendingRegistrations.length} pendingStudents={pendingStudents.length}>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-8 border border-indigo-100 shadow-xl shadow-indigo-50 animate-pulse">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 italic mb-4">Verification Complete</h2>
          <p className="text-slate-500 max-w-md font-medium leading-relaxed">
            Your application is under review by the <span className="text-slate-900 font-bold">SuperAdmin</span>.
            You'll get an email notification once your account is fully authorized.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading || !stats) {
    return (
      <DashboardLayout pendingRegistrations={pendingRegistrations.length} pendingStudents={pendingStudents.length}>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pendingRegistrations={pendingRegistrations.length} pendingStudents={pendingStudents.length}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        {/* Admin Header */}
        <header className="flex flex-col gap-3 pb-5 border-b border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-[2.4rem] font-bold text-slate-900 tracking-tight">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'events' && 'My Events'}
                {activeTab === 'registrations' && 'Registrations'}
                {activeTab === 'approvals' && 'Students'}
                {activeTab === 'feedback' && 'Feedback'}
              </h1>
              <p className="text-slate-600 font-medium text-sm mt-1">
                {activeTab === 'overview' && 'Your college at a glance'}
                {activeTab === 'events' && "All events you've created"}
                {activeTab === 'registrations' && 'Manage registration requests'}
                {activeTab === 'approvals' && 'Review student applications'}
                {activeTab === 'feedback' && 'What students are saying'}
              </p>
            </div>
            {(activeTab === 'overview' || activeTab === 'events') && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/create-event")}
                  className="px-5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section className="admin-panel px-6 py-6 md:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="admin-kicker">Operations overview</p>
                  <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Manage events, student approvals, and registration momentum from one dashboard.</h2>
                  <p className="mt-2 text-sm text-slate-600 leading-6">Today&apos;s priority: keep the approval queue clear, monitor live event health, and protect participation quality.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => navigate('/admin?tab=approvals')} className="text-left rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors">
                    <p className="text-xs font-semibold text-slate-500">Student approvals</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{pendingStudents.length} pending review</p>
                  </button>
                  <button onClick={() => navigate('/admin?tab=registrations')} className="text-left rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors">
                    <p className="text-xs font-semibold text-slate-500">Registrations</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{pendingRegistrations.length} pending actions</p>
                  </button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <MetricCard icon={Calendar} label="Live Events" value={stats.totalEvents || 0} trend={`${stats.pendingApprovalCount || 0} pending approval`} trendTone="info" accent="text-indigo-600 bg-indigo-50 border-indigo-100" />
              <MetricCard icon={Users} label="Total Registrations" value={stats.totalRegistrations || 0} trend={`${registrationsThisMonth} this month`} trendTone="success" accent="text-emerald-600 bg-emerald-50 border-emerald-100" />
              <MetricCard icon={UserCheck} label="Pending Students" value={pendingStudents.length} trend="Needs review" trendTone={pendingStudents.length > 0 ? "warning" : "neutral"} accent="text-amber-600 bg-amber-50 border-amber-100" />
              <MetricCard icon={ClipboardList} label="Pending Registrations" value={pendingRegistrations.length} trend="Needs review" trendTone={pendingRegistrations.length > 0 ? "warning" : "neutral"} accent="text-orange-600 bg-orange-50 border-orange-100" />
              <MetricCard icon={Star} label="Avg Rating" value={ratingDisplay} trend={`${feedbackRows.length} reviews`} trendTone="warning" accent="text-yellow-600 bg-yellow-50 border-yellow-100" />
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
              <section className="flex-[3] admin-panel p-6">
                <h3 className="font-bold text-xl text-slate-900 tracking-tight">Registration Activity</h3>
                <p className="text-sm text-slate-600 font-medium mt-1 mb-6">Registrations over the last 30 days</p>
                <div className="min-h-[300px] h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.registrationTrend || []}>
                      <defs>
                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBold: 'bold', fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBold: 'bold', fill: '#94a3b8' }} dx={-10} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorReg)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="flex-[2] admin-panel p-6 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 tracking-tight">Recent Activity</h3>
                <div className="space-y-5 mt-6 flex-1">
                  {filteredActivity.length > 0 ? (
                    filteredActivity.map((activity, index) => (
                      <div key={activity._id || index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 text-lg">
                          {activity.icon || "*"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 line-clamp-2">{activity.displayMessage || activity.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{timeAgo(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={Activity}
                      title="No recent activity"
                      description="Activity updates will appear here when students apply, registrations change, or events are updated."
                    />
                  )}
                </div>
                <button onClick={() => navigate('/admin?tab=registrations')} className="mt-6 text-xs font-semibold tracking-widest text-indigo-600 hover:text-indigo-700 text-left">
                  View all
                </button>
              </section>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
              <section className="flex-[3] admin-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Recent Events</h3>
                </div>

                {recentEvents.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No events created yet"
                    description="Create your first event to start registrations and collect feedback."
                    actionLabel="Create Event"
                    onAction={() => navigate('/create-event')}
                  />
                ) : (
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/40">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{event.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-widest ${getEventStatusClass(event)}`}>
                            {getEventStatusLabel(event)}
                          </span>
                          <span className="text-xs font-bold text-slate-600">{event.registrationsCount || 0} regs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => navigate('/admin?tab=events')} className="mt-6 text-xs font-semibold tracking-widest text-indigo-600 hover:text-indigo-700">
                  View all events &gt;
                </button>
              </section>

              <section className="flex-[2] space-y-6">
                <div className="admin-panel p-6">
                  <h3 className="font-bold text-lg text-slate-900 tracking-tight mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate('/create-event')} className="p-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Create Event</button>
                    <button onClick={() => navigate('/admin?tab=events')} className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Manage Events</button>
                    <button onClick={() => navigate('/admin?tab=approvals')} className="p-4 rounded-2xl bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-colors">Student Approvals</button>
                    <button onClick={() => navigate('/manage-events')} className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">Export Data</button>
                  </div>
                </div>

                <div className="admin-panel p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-xs">
                    <PieIcon className="w-4 h-4 text-indigo-500" />
                    Events by Category
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.categoryDistribution || []}
                          dataKey="count"
                          nameKey="_id"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={8}
                        >
                          {analytics?.categoryDistribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl text-[10px] font-black uppercase tracking-widest">
                                {payload[0].name}: {payload[0].value} Events
                              </div>
                            );
                          }
                          return null;
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 italic">My Events</h3>
                <p className="text-sm text-slate-500 font-medium">All events you've created</p>
              </div>
              <button onClick={() => navigate('/create-event')} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
                New Event
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="w-full lg:max-w-sm">
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Search events..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'live', label: 'Live' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'paused', label: 'Paused' },
                  { key: 'rejected', label: 'Rejected' },
                ].map((pill) => (
                  <button
                    key={pill.key}
                    onClick={() => setEventStatusFilter(pill.key)}
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${eventStatusFilter === pill.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                  >
                    {pill.label}
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[9px] ${eventStatusFilter === pill.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {eventStatusCounts[pill.key] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {filteredMyEvents.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center">
                <Calendar className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                <h4 className="text-xl font-black text-slate-900 mb-2">No events yet.</h4>
                <p className="text-sm text-slate-500 mb-8">Create your first event to get started.</p>
                <button onClick={() => navigate('/create-event')} className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
                  Create Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMyEvents.map((event) => {
                  const currentParticipants = Number(event.currentParticipants || event.registrationsCount || 0);
                  const hasUnlimited = Number(event.maxParticipants) === 0 || event.maxParticipants === null;
                  const maxParticipants = hasUnlimited ? 0 : Number(event.maxParticipants || 0);
                  const progress = hasUnlimited || maxParticipants === 0 ? 0 : Math.min(100, Math.round((currentParticipants / maxParticipants) * 100));
                  const summary = feedbackByEvent[String(event._id)];

                  return (
                    <article key={event._id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                      <div className="relative h-40 bg-gradient-to-r from-indigo-100 to-slate-200 overflow-hidden">
                        {event.bannerImage ? (
                          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-200 via-indigo-100 to-slate-100" />
                        )}
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/90 text-slate-700">
                          {event.category}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <h4 className="font-black text-slate-900 line-clamp-1">{event.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} | {event.location || 'Location TBA'}
                        </p>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-600">
                            {hasUnlimited ? 'Unlimited' : `${currentParticipants} / ${maxParticipants} registered`}
                          </p>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        <span className={`inline-flex text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${getEventStatusClass(event)}`}>
                          {getEventStatusLabel(event)}
                        </span>

                        <p className="text-xs font-bold text-slate-600">
                          {summary ? `${Number(summary.avgRating).toFixed(1)} / 5` : 'No feedback yet'}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 p-4 flex items-center justify-between gap-2">
                        <button
                          onClick={() => navigate(`/edit-event/${event._id}`)}
                          disabled={event.hasPendingUpdate}
                          title={event.hasPendingUpdate ? 'Update under review' : 'Edit event'}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${event.hasPendingUpdate ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/event-registrations/${event._id}`)}
                          className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        >
                          Registrations
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="space-y-10">
            {/* Pending Students Section (as before, but visually distinct) */}
            <section className="admin-panel overflow-hidden border-2 border-amber-200 bg-amber-50/20">
              <div className="px-6 py-5 border-b border-amber-100 bg-amber-50/40 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-bold text-amber-900 flex items-center gap-3 text-lg">
                    <Shield className="w-5 h-5 text-amber-600" />
                    Pending Student Applications
                  </h3>
                  <p className="text-sm text-amber-700 font-medium mt-1">Students waiting to join your college</p>
                </div>
                <button onClick={fetchPendingStudents} className="px-3 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg hover:border-amber-300 hover:text-amber-900 transition-all text-xs font-semibold">
                  Refresh
                </button>
              </div>
              <div className="p-6 space-y-3">
                {pendingStudentsLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin" />
                  </div>
                ) : pendingStudents.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No student applications pending"
                    description="New student signups from your college will appear here for review."
                  />
                ) : (
                  pendingStudents.map((student) => (
                    <div key={student._id} className="rounded-xl border border-amber-200 bg-white px-4 py-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.firstName?.[0] || "?"}{student.lastName?.[0] || ""}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">{student.firstName} {student.lastName}</p>
                              <button onClick={() => handleViewStudent(student)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600">
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{student.email}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                              <span>ID: {student.officialId || student.staffId || "-"}</span>
                              <span className="text-slate-300">|</span>
                              <span>Phone: {student.phone || "-"}</span>
                              <span className="text-slate-300">|</span>
                              <span>Applied {timeAgo(student.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 lg:justify-end">
                          <span className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Pending</span>
                          <button onClick={() => handlePendingStudentAction(student._id, "approve")} className="px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handlePendingStudentAction(student._id, "reject")} className="px-3 py-2 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* All Students Section */}
            <section className="admin-panel overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex flex-col">
                  <h3 className="font-bold text-slate-900 flex items-center gap-3 text-lg">
                    <Users className="w-5 h-5 text-indigo-600" />
                    All Students
                  </h3>
                  <p className="text-sm text-slate-600 font-medium mt-1">View all students in your college and their approval status</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 items-end md:items-center">
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <select
                    value={studentStatusFilter}
                    onChange={e => setStudentStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending_approval">Pending</option>
                    <option value="active">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {studentsLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : filteredAllStudents.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No students found"
                    description="No students match your search or filter."
                  />
                ) : (
                  filteredAllStudents.map((student) => (
                    <div key={student._id} className="rounded-xl border border-slate-200 bg-white px-4 py-4 mb-2">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.firstName?.[0] || "?"}{student.lastName?.[0] || ""}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">{student.firstName} {student.lastName}</p>
                              <button onClick={() => handleViewStudent(student)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{student.email}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                              <span>ID: {student.officialId || student.staffId || "-"}</span>
                              <span className="text-slate-300">|</span>
                              <span>Phone: {student.phone || "-"}</span>
                              <span className="text-slate-300">|</span>
                              <span>Joined {timeAgo(student.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 lg:justify-end">
                          {student.accountStatus === "pending_approval" && (
                            <span className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Pending</span>
                          )}
                          {student.accountStatus === "active" && (
                            <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Approved</span>
                          )}
                          {student.accountStatus === "rejected" && (
                            <span className="inline-flex rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">Rejected</span>
                          )}
                          {/* Only show actions for pending students */}
                          {student.accountStatus === "pending_approval" && (
                            <>
                              <button onClick={() => handlePendingStudentAction(student._id, "approve")} className="px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                                Approve
                              </button>
                              <button onClick={() => handlePendingStudentAction(student._id, "reject")} className="px-3 py-2 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {selectionDetail.show && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-scale-up">
              <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">
                    {selectionDetail.type === 'event' ? selectionDetail.data.title : `${selectionDetail.data.firstName} ${selectionDetail.data.lastName}`}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {selectionDetail.type === 'event' ? 'Event Details' : 'Student Details'}
                  </p>
                </div>
                <button onClick={() => setSelectionDetail({ show: false, type: null, data: null })} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-10 overflow-y-auto no-scrollbar space-y-8">
                {selectionDetail.type === 'event' ? (
                  <>
                    <div className="h-48 rounded-2xl overflow-hidden shadow-inner relative group">
                      <img src={selectionDetail.data.bannerImage || "/images/campus_life_professional.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                        <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{selectionDetail.data.category}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                          <p className="font-bold text-slate-800">{new Date(selectionDetail.data.startDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                          <p className="font-bold text-slate-800">{selectionDetail.data.location}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity Management</p>
                          <p className="font-bold text-indigo-600">{selectionDetail.data.registrationsCount || 0} / {selectionDetail.data.maxParticipants || 'Unlimited'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${selectionDetail.data.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {selectionDetail.data.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectionDetail.data.description}</p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl font-black shadow-inner">
                        {selectionDetail.data.firstName[0]}{selectionDetail.data.lastName[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 italic">{selectionDetail.data.firstName} {selectionDetail.data.lastName}</h4>
                        <p className="text-slate-500 font-medium">{selectionDetail.data.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full tracking-widest">Student</span>
                          <span className={`px-3 py-1 text-[8px] font-black uppercase rounded-full tracking-widest ${selectionDetail.data.isVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {selectionDetail.data.isVerified ? 'Email Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Official College ID</p>
                          <p className="font-bold text-slate-800">{selectionDetail.data.officialId || "Not Provided"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Contact</p>
                          <p className="font-bold text-slate-800">{selectionDetail.data.phone || "Not Provided"}</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Department/Year</p>
                          <p className="font-bold text-slate-800">{selectionDetail.data.department || "Academic General"} {selectionDetail.data.year ? `(${selectionDetail.data.year})` : ""}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration Date</p>
                          <p className="font-bold text-slate-800">{new Date(selectionDetail.data.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {selectionDetail.data.bio && (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Student Bio</p>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{selectionDetail.data.bio}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                <button onClick={() => setSelectionDetail({ show: false, type: null, data: null })} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 overflow-hidden relative group">
                  <span className="relative z-10 text-white">Close</span>
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4 md:items-end">
                <div className="flex flex-col">
                  <h3 className="font-black text-slate-900 text-2xl italic">Registrations</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">View event registrations and attendance progress</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest w-fit">
                  {registrationCounts.all} total | {registrationCounts.pending} pending
                </div>
              </div>

              <div className="px-8 py-4 border-b border-slate-50 flex flex-col xl:flex-row gap-4 bg-slate-50/20 xl:items-center xl:justify-between">
                <div className="flex flex-col md:flex-row gap-3 w-full xl:max-w-2xl">
                  <input
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                    placeholder="Search by student or event..."
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                  />
                  <select
                    value={regEventFilter}
                    onChange={(e) => setRegEventFilter(e.target.value)}
                    className="w-full md:w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="all">All events</option>
                    {myEvents.map((event) => (
                      <option key={event._id} value={String(event._id)}>{event.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { id: "all", label: "All" },
                    { id: "pending", label: "Pending" },
                    { id: "approved", label: "Approved" },
                    { id: "rejected", label: "Rejected" },
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setRegStatusFilter(status.id)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${regStatusFilter === status.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      {status.label}
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] ${regStatusFilter === status.id ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'}`}>
                        {registrationCounts[status.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Student</th>
                      <th className="px-8 py-5 font-bold">Event</th>
                      <th className="px-8 py-5 font-bold">Registered On</th>
                      <th className="px-8 py-5 font-bold">Style</th>
                      <th className="px-8 py-5 font-bold">Status</th>
                      <th className="px-8 py-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-16 text-center">
                          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                          <p className="text-sm font-semibold text-slate-700">{registrationEmptyLabel}</p>
                          <p className="text-xs text-slate-500 mt-1">Try changing filters or selecting another event.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map(reg => (
                          <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                                  {reg.user?.firstName?.[0]}{reg.user?.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-black text-slate-900 text-sm">{reg.user?.firstName} {reg.user?.lastName}</p>
                                  <p className="text-xs text-slate-400">{reg.user?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm text-slate-800 font-bold line-clamp-1">{reg.event?.title}</span>
                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded w-fit mt-1">{reg.event?.category}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-sm font-bold text-slate-700">{new Date(reg.createdAt || reg.registrationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{timeAgo(reg.createdAt || reg.registrationDate)}</p>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                {participationStyleLabel(reg)}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${reg.normalizedStatus === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : reg.normalizedStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : reg.normalizedStatus === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' : reg.normalizedStatus === 'attended' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : reg.normalizedStatus === 'waitlisted' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                {reg.normalizedStatus === 'pending' && 'Pending'}
                                {reg.normalizedStatus === 'approved' && 'Approved'}
                                {reg.normalizedStatus === 'rejected' && 'Rejected'}
                                {reg.normalizedStatus === 'attended' && 'Attended'}
                                {reg.normalizedStatus === 'waitlisted' && 'Waitlist'}
                                {!['pending', 'approved', 'rejected', 'attended', 'waitlisted'].includes(reg.normalizedStatus) && reg.normalizedStatus}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {reg.normalizedStatus === 'approved' ? (
                                  <button onClick={() => navigate(`/event-registrations/${reg.event?._id}`)} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-colors">
                                    Mark Attended
                                  </button>
                                ) : reg.normalizedStatus === 'waitlisted' ? (
                                  <span className="text-xs font-bold text-slate-400">Waiting</span>
                                ) : reg.normalizedStatus === 'pending' ? (
                                  <span className="text-xs font-bold text-slate-400">Auto-processing</span>
                                ) : (
                                  <span className="text-xs font-bold text-slate-400">Done</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Reviews</p>
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="mt-4 text-3xl font-black text-slate-900">{feedbackRows.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Average Rating</p>
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <p className="mt-4 text-3xl font-black text-slate-900">{averageRating ? `${averageRating.toFixed(1)} / 5` : '-'}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Feedback Response Rate</p>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="mt-4 text-3xl font-black text-slate-900">{feedbackMeta.responseRate || 0}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Rating Distribution</h4>
                {[5, 4, 3, 2, 1].map((score) => {
                  const count = Number(feedbackMeta.ratingDistribution?.[score] || 0);
                  const total = Number(feedbackRows.length || 0);
                  const width = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={score} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <p className="font-bold text-slate-700">{score} Star</p>
                        <p className="text-slate-500">{count}</p>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Top Issues</h4>
                {(feedbackMeta.topIssues || []).length === 0 && (
                  <p className="text-sm text-slate-500">No recurring issue terms detected yet.</p>
                )}
                {(feedbackMeta.topIssues || []).slice(0, 8).map((issue) => (
                  <div key={issue.term} className="rounded-xl border border-slate-200 px-3 py-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{issue.term}</p>
                    <p className="text-xs font-bold text-slate-500">{issue.count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {feedbackSummaries.map((item) => (
                <div key={item.eventId} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 truncate mb-4">{item.eventTitle}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      <StarIcon filled className="w-4 h-4" />
                      <span className="text-xl font-black text-slate-900">{Number(item.avgRating).toFixed(1)}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{item.count} reviews | {item.responseRate || 0}%</span>
                  </div>
                </div>
              ))}
            </div>

            <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-lg italic">All Feedback</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Event</th>
                      <th className="px-8 py-5 font-bold">Student</th>
                      <th className="px-8 py-5 font-bold">Rating</th>
                      <th className="px-8 py-5 font-bold">Comment</th>
                      <th className="px-8 py-5 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {feedbackRows.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center text-slate-400">
                          <p className="text-sm font-black">No feedback yet.</p>
                          <p className="text-xs mt-2">Feedback appears after events end and students submit ratings.</p>
                        </td>
                      </tr>
                    ) : (
                      feedbackRows.map(row => {
                        const isExpanded = expandedFeedbackId === row._id;
                        const fullComment = row.comment || "";
                        const shortComment = fullComment.length > 80 ? `${fullComment.slice(0, 80)}...` : fullComment;

                        return (
                          <tr key={row._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 text-sm font-bold text-slate-800">{row.eventId?.title}</td>
                            <td className="px-8 py-5 text-sm font-bold text-slate-700">{row.userId?.firstName || "Student"}</td>
                            <td className="px-8 py-5 text-sm font-black text-slate-900">{renderStars(row.rating)} <span className="text-xs text-slate-400 ml-1">({row.rating}/5)</span></td>
                            <td className="px-8 py-5 max-w-sm text-xs text-slate-600 font-medium leading-relaxed">
                              <button
                                onClick={() => setExpandedFeedbackId(isExpanded ? null : row._id)}
                                className="text-left hover:text-slate-900"
                              >
                                {isExpanded ? fullComment : shortComment}
                              </button>
                            </td>
                            <td className="px-8 py-5 text-xs font-medium text-slate-500">{new Date(row.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectionModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
              <div className="px-8 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 italic tracking-tight">Reject Request</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for rejection.</p>
                  </div>
                </div>
                <button onClick={() => setRejectionModal({ show: false, id: null, type: null })} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for rejection</label>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${rejectionReason.length < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {rejectionReason.length}/500
                    </span>
                  </div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value.slice(0, 500))}
                    placeholder="State clearly why this application is being rejected..."
                    className="w-full h-40 bg-slate-50 border-none rounded-[1.5rem] p-6 text-sm font-medium focus:ring-2 focus:ring-rose-100 placeholder:text-slate-300 transition-all resize-none shadow-inner text-slate-900"
                  />
                  {rejectionReason.length > 0 && rejectionReason.length < 10 && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight ml-1">Reason must be at least 10 characters</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={submitRejection}
                    disabled={rejectionLoading || rejectionReason.trim().length < 10}
                    className="w-full sm:flex-1 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {rejectionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => setRejectionModal({ show: false, id: null, type: null })}
                    className="w-full sm:w-auto px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center">
    <Icon className="w-10 h-10 mx-auto text-slate-300" />
    <p className="mt-4 text-sm font-semibold text-slate-800">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const MetricCard = ({ icon: Icon, label, value, trend, accent, trendTone = "neutral" }) => {
  const trendClass = trendTone === "warning"
    ? "bg-amber-50 text-amber-700 border-amber-100"
    : trendTone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : trendTone === "info"
        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
        : "bg-slate-50 text-slate-500 border-slate-100";

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden relative group">
      <div className="flex justify-between items-center relative z-10">
        <div className={`p-3 rounded-2xl border transition-transform group-hover:scale-110 ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${trendClass}`}>
          {trend}
        </div>
      </div>
      <div className="mt-8 relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{value}</p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />
    </div>
  );
};

const StarIcon = ({ filled, className }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-none shadow-2xl rounded-2xl p-4 animate-fade-in translate-y-[-10px]">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-xl font-black text-white">{payload[0].value} <span className="text-[10px] font-bold text-indigo-400 uppercase ml-1">Volume</span></p>
      </div>
    );
  }
  return null;
};

const timeAgo = (dateInput) => {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

export default CollegeAdminDashboard;
