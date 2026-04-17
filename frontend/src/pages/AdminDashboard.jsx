import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  approveEvent,
  fetchEventById,
  fetchEvents as fetchEventsRequest,
  rejectEvent,
  updateEvent,
} from "../services/eventService";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  PieChart as PieChartIcon,
  Building2,
  Clock,
  UserCheck,
  Activity,
  Globe,
  ArrowRight,
  Plus,
  Phone,
  Mail,
  Info,
  X,
  Loader2,
  Shield,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'overview';

  const emptyStats = {
    totalColleges: 0,
    totalEvents: 0,
    totalStudents: 0,
    totalCollegeAdmins: 0,
    pendingAdmins: 0,
    pendingEvents: 0,
    totalRegistrations: 0,
    approvedRegistrations: 0,
    pendingRegistrations: 0,
    ongoingEvents: 0,
    deadlineAlerts: [],
    capacityAlerts: [],
    recentActivity: [],
  };
  const emptyAnalytics = {
    registrationTrend: [],
    categoryDistribution: [],
    collegeParticipation: [],
  };

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState({ summary: {}, perCollege: [], lowestRatedEvents: [] });
  const [platformSignals, setPlatformSignals] = useState({ lowRatingAlerts: [], highNoShowEvents: [], frequentEditEvents: [], capacityAnomalies: [] });
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [moderationComments, setModerationComments] = useState([]);
  const [selectedPendingEvent, setSelectedPendingEvent] = useState(null);
  const [selectionDetail, setSelectionDetail] = useState({ show: false, type: null, data: null });
  const [creatingCollege, setCreatingCollege] = useState(false);
  const [collegeForm, setCollegeForm] = useState({ name: '', code: '', email: '', phone: '' });

  // Rejection Modal State
  const [rejectionModal, setRejectionModal] = useState({ show: false, id: null, type: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionLoading, setRejectionLoading] = useState(false);

  // Colleges tab state
  const [allColleges, setAllColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');

  // Users tab state
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Events tab state
  const [allEvents, setAllEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [eventSort, setEventSort] = useState('newest');

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
  const ROLE_LABEL = { admin: 'Superadmin', college_admin: 'Admin', student: 'Student' };

  useEffect(() => {
    if (activeTab === 'colleges') fetchColleges();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'events') fetchEvents();
    if (activeTab === 'alerts') fetchSignals();
  }, [activeTab, eventSort, eventSearch]);

  const fetchData = async (signal) => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, adminsRes, eventsRes, feedbackAnalyticsRes, notificationsRes, commentsRes] = await Promise.allSettled([
        API.get("/dashboards/super-admin", { signal }),
        API.get("/dashboards/analytics", { signal }),
        API.get("/auth/admin/pending-users", { signal }),
        fetchEventsRequest({ isApproved: false }, { signal }),
        API.get("/feedback/admin/analytics", { signal }),
        API.get("/notifications?role=admin&limit=10", { signal }),
        API.get("/comments/admin/moderation?limit=20", { signal }),
      ]);

      if (statsRes.status === "fulfilled") {
        const data = statsRes.value?.data?.data || {};
        setStats({
          ...emptyStats,
          ...data,
          deadlineAlerts: Array.isArray(data.deadlineAlerts) ? data.deadlineAlerts : [],
          capacityAlerts: Array.isArray(data.capacityAlerts) ? data.capacityAlerts : [],
          recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
        });
      } else {
        setStats(emptyStats);
      }

      if (analyticsRes.status === "fulfilled") {
        const data = analyticsRes.value?.data?.data || {};
        setAnalytics({
          ...emptyAnalytics,
          ...data,
          registrationTrend: Array.isArray(data.registrationTrend) ? data.registrationTrend : [],
          categoryDistribution: Array.isArray(data.categoryDistribution) ? data.categoryDistribution : [],
          collegeParticipation: Array.isArray(data.collegeParticipation) ? data.collegeParticipation : [],
        });
      } else {
        setAnalytics(emptyAnalytics);
      }

      if (adminsRes.status === "fulfilled") {
        setPendingAdmins(adminsRes.value.data.data.users);
      }
      if (eventsRes.status === "fulfilled") setPendingEvents(eventsRes.value.data.data.events);
      if (feedbackAnalyticsRes.status === "fulfilled") {
        const data = feedbackAnalyticsRes.value.data?.data || {};
        setFeedbackAnalytics({
          summary: data.summary || {},
          perCollege: Array.isArray(data.perCollege) ? data.perCollege : [],
          lowestRatedEvents: Array.isArray(data.lowestRatedEvents) ? data.lowestRatedEvents : [],
        });
      }

      if (notificationsRes.status === "fulfilled") {
        const notifs = notificationsRes.value.data?.data?.notifications || [];
        setNotifications(notifs);
      }

      if (commentsRes.status === "fulfilled") {
        setModerationComments(commentsRes.value.data?.data?.comments || []);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error("Failed to refresh dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [user]);


  const fetchColleges = async () => {
    setCollegesLoading(true);
    try {
      const res = await API.get('/auth/admin/all-colleges');
      setAllColleges(res.data.data.colleges || []);
    } catch { toast.error('Failed to load colleges'); }
    finally { setCollegesLoading(false); }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await API.get('/auth/admin/all-users');
      setAllUsers(res.data.data.users || []);
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await fetchEventsRequest({
        limit: 1000,
        search: eventSearch || undefined,
        sort: eventSort,
      });
      setAllEvents(res.data.data.events || []);
    } catch { toast.error('Failed to load global events'); }
    finally { setEventsLoading(false); }
  };

  const fetchSignals = async () => {
    setSignalsLoading(true);
    try {
      const res = await API.get('/dashboards/signals');
      const data = res.data?.data || {};
      setPlatformSignals({
        lowRatingAlerts: Array.isArray(data.lowRatingAlerts) ? data.lowRatingAlerts : [],
        highNoShowEvents: Array.isArray(data.highNoShowEvents) ? data.highNoShowEvents : [],
        frequentEditEvents: Array.isArray(data.frequentEditEvents) ? data.frequentEditEvents : [],
        capacityAnomalies: Array.isArray(data.capacityAnomalies) ? data.capacityAnomalies : [],
      });
    } catch { /* signals are non-blocking */ }
    finally { setSignalsLoading(false); }
  };

  const handleApproveAdmin = async (id) => {
    try {
      await API.patch(`/auth/admin/approve-user/${id}`);
      toast.success("College Admin approved");
      setPendingAdmins(prev => prev.filter(a => a._id !== id));
      fetchData();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleRejectAdmin = async (id) => {
    setRejectionModal({ show: true, id, type: 'admin' });
    setRejectionReason("");
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setRejectionLoading(true);
    try {
      if (rejectionModal.type === 'admin') {
        await API.delete(`/auth/admin/reject-user/${rejectionModal.id}`, { data: { reason: rejectionReason.trim() } });
        toast.success("College Admin application rejected");
        setPendingAdmins(prev => prev.filter(a => a._id !== rejectionModal.id));
      } else {
        await rejectEvent(rejectionModal.id, { reason: rejectionReason.trim() });
        toast.success("Event proposal rejected");
        setPendingEvents(prev => prev.filter(e => e._id !== rejectionModal.id));
      }
      setRejectionModal({ show: false, id: null, type: null });
      setRejectionReason("");
      fetchData();
    } catch (err) {
      toast.error("Rejection failed");
    } finally {
      setRejectionLoading(false);
    }
  };

  const handleRejectEvent = async (id) => {
    setRejectionModal({ show: true, id, type: 'event' });
    setRejectionReason("");
  };

  const handleApproveEvent = async (id) => {
    try {
      await approveEvent(id);
      toast.success("Event approved and live");
      setPendingEvents(prev => prev.filter(e => e._id !== id));
      if (selectionDetail?.data?._id === id) setSelectionDetail({ show: false, type: null, data: null });
      fetchData();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleToggleVisibility = async (eventId, currentVisibility) => {
    try {
      await updateEvent(eventId, { isVisible: !currentVisibility });
      toast.success(`Event ${!currentVisibility ? 'visible' : 'hidden'} on feed`);
      fetchEvents();
    } catch (err) {
      toast.error("Visibility toggle failed");
    }
  };

  const handleViewPendingEvent = async (eventId) => {
    try {
      const res = await fetchEventById(eventId);
      setSelectionDetail({ show: true, type: 'event', data: res.data.data.event });
    } catch (error) {
      toast.error("Failed to fetch full event details");
    }
  };

  const handleViewPendingAdmin = (admin) => {
    setSelectionDetail({ show: true, type: 'admin', data: admin });
  };

  const handleViewUser = (user) => {
    setSelectionDetail({ show: true, type: 'user', data: user });
  };

  const handleCreateCollege = async (event) => {
    event.preventDefault();
    try {
      setCreatingCollege(true);
      await API.post('/colleges', {
        name: collegeForm.name,
        code: collegeForm.code,
        email: collegeForm.email,
        phone: collegeForm.phone,
      });
      toast.success('College created');
      setCollegeForm({ name: '', code: '', email: '', phone: '' });
      fetchColleges();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create college');
    } finally {
      setCreatingCollege(false);
    }
  };

  const handleRemoveComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      setModerationComments((prev) => prev.filter((item) => item._id !== commentId));
      toast.success("Comment removed");
    } catch (error) {
      toast.error("Failed to remove comment");
    }
  };

  const totalApprovalQueue = (stats?.pendingAdmins || 0) + (stats?.pendingEvents || 0);
  const approvalRate = stats?.totalRegistrations
    ? Math.round(((stats.approvedRegistrations || 0) / stats.totalRegistrations) * 100)
    : 0;
  const activeEventsRatio = stats?.totalEvents
    ? Math.round(((stats.ongoingEvents || 0) / stats.totalEvents) * 100)
    : 0;
  const avgRegistrationsPerEvent = stats?.totalEvents
    ? Math.round((stats.totalRegistrations || 0) / stats.totalEvents)
    : 0;

  const adminApprovalRate = (stats?.totalCollegeAdmins + stats?.pendingAdmins) > 0
    ? Math.round(((stats?.totalCollegeAdmins || 0) / ((stats?.totalCollegeAdmins || 0) + (stats?.pendingAdmins || 0))) * 100)
    : 0;

  const eventAcceptanceRate = stats?.totalEvents > 0
    ? Math.round((((stats?.totalEvents || 0) - (stats?.pendingEvents || 0)) / (stats?.totalEvents || 1)) * 100)
    : 0;

  const formatActivity = (type = '') => {
    const map = {
      EVENT_CREATE: `New event submitted for review`,
      EVENT_APPROVE: `An event was approved and is now live`,
      EVENT_UPDATE: `An event update is pending review`,
      EVENT_REJECT: `An event was rejected`,
      REGISTRATION_APPROVE: `A student registration was approved`,
      REGISTRATION_REJECT: `A student registration was rejected`,
      ADMIN_APPROVE: `A college admin was approved`,
      ADMIN_REJECT: `A college admin was rejected`,
      STUDENT_APPROVE: `A student account was approved`,
      COLLEGE_CREATE: `A new college was added`,
    };
    return map[type] || (type ? type.replace(/_/g, ' ').toLowerCase() : 'System update');
  };

  const activityIcon = (type = '') => {
    if (!type) return '*';
    if (type.includes('APPROVE')) return 'OK';
    if (type.includes('REJECT')) return 'X';
    if (type.includes('CREATE')) return '+';
    if (type.includes('UPDATE')) return '~';
    return '*';
  };

  const timeAgo = (date) => {
    if (!date) return "just now";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " minutes ago";
    if (hours < 24) return hours + " hours ago";
    return days + " days ago";
  };

  const activitySource = notifications.length > 0 ? notifications : (stats?.recentActivity || []);
  const majorActivities = activitySource
    .filter((activity) => {
      const type = String(activity.type || "").toUpperCase();
      if (!type) return false;

      // Drop noisy approval-only entries to keep this feed high-signal.
      if (type === "STUDENT_APPROVE" || type === "ADMIN_APPROVE" || type === "REGISTRATION_APPROVE") {
        return false;
      }

      return (
        type.includes("EVENT") ||
        type.includes("COLLEGE") ||
        type.includes("REJECT") ||
        type.includes("UPDATE") ||
        type.includes("DELETE") ||
        type.includes("CANCEL") ||
        type.includes("PAUSE") ||
        type.includes("ALERT")
      );
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const platformAlerts = [
    ...(stats?.deadlineAlerts || []).map((event) => ({
      kind: "deadline",
      title: "Registration closing soon",
      detail: `${event.title} closes within 48 hours.`,
      target: `/event/${event._id}`,
    })),
    ...(stats?.capacityAlerts || []).map((event) => ({
      kind: "capacity",
      title: "High capacity usage",
      detail: `${event.title} is above 80% capacity.`,
      target: `/event/${event._id}`,
    })),
  ].slice(0, 8);

  const lowRatedColleges = [...(feedbackAnalytics?.perCollege || [])]
    .filter((row) => Number(row.avgRating || 0) > 0 && Number(row.avgRating || 0) < 2.5)
    .sort((a, b) => Number(a.avgRating || 0) - Number(b.avgRating || 0));

  const overviewStats = [
    {
      label: "Colleges",
      value: stats?.totalColleges || 0,
      meta: `${stats?.totalColleges || 0} active`,
      icon: Building2,
      tone: "indigo",
      action: () => navigate("/superadmin?tab=colleges"),
    },
    {
      label: "Admins",
      value: stats?.totalCollegeAdmins || 0,
      meta: `${stats?.pendingAdmins || 0} pending approval`,
      icon: ShieldCheck,
      tone: (stats?.pendingAdmins || 0) > 0 ? "amber" : "indigo",
      action: () => navigate("/superadmin?tab=approvals"),
    },
    {
      label: "Students",
      value: stats?.totalStudents || 0,
      meta: `${stats?.pendingStudents || 0} pending review`,
      icon: Users,
      tone: "slate",
      action: () => navigate("/superadmin?tab=users"),
    },
    {
      label: "Live Events",
      value: stats?.totalEvents || 0,
      meta: `${stats?.pendingEvents || 0} in queue`,
      icon: Calendar,
      tone: (stats?.pendingEvents || 0) > 0 ? "amber" : "indigo",
      action: () => navigate("/superadmin?tab=events"),
    },
    {
      label: "Registrations",
      value: stats?.totalRegistrations || 0,
      meta: `${stats?.registrationsThisMonth || 0} this month`,
      icon: Activity,
      tone: "indigo",
      action: () => navigate("/superadmin?tab=analytics"),
    },
    {
      label: "Pending Actions",
      value: totalApprovalQueue,
      meta: totalApprovalQueue > 0 ? "Needs attention" : "Queue is clear",
      icon: AlertTriangle,
      tone: totalApprovalQueue > 0 ? "rose" : "slate",
      action: () => navigate("/superadmin?tab=approvals"),
    },
  ];

  const overviewHealth = [
    { label: "Approval Rate", value: `${approvalRate}%`, detail: "approved registrations / total", icon: CheckCircle },
    { label: "Event Acceptance", value: `${eventAcceptanceRate}%`, detail: "approved events / total", icon: Calendar },
    { label: "Avg Registrations", value: `${avgRegistrationsPerEvent}`, detail: "average per live event", icon: UserCheck },
  ];

  const topCollegeRows = [...(feedbackAnalytics?.perCollege || [])]
    .sort((a, b) => (b.registrationsCount || 0) - (a.registrationsCount || 0))
    .slice(0, 5);

  if (loading || !stats || !analytics) return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-72" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-100 rounded-3xl" />
          <div className="h-72 bg-slate-100 rounded-3xl" />
        </div>
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
        {/* Header Section */}
        <header className="flex flex-col gap-2 pb-3 border-b border-slate-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === 'overview' && 'Superadmin Dashboard'}
            {activeTab === 'alerts' && 'Platform Alerts'}
            {activeTab === 'monitoring' && 'Admin Monitoring'}
            {activeTab === 'moderation' && 'Event Moderation'}
            {activeTab === 'feedback-insights' && 'Feedback Insights'}
            {activeTab === 'governance-logs' && 'Governance Logs'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'colleges' && 'Colleges'}
            {activeTab === 'events' && 'Event Registry'}
            {activeTab === 'users' && 'Users'}
            {activeTab === 'approvals' && 'Approvals'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {activeTab === 'overview' && 'Overview of all colleges, events, and users.'}
            {activeTab === 'alerts' && 'System-wide risk and anomaly alerts requiring intervention.'}
            {activeTab === 'monitoring' && 'Operational view of college admin workload and approval queues.'}
            {activeTab === 'moderation' && 'Pending event decisions and quality signals for enforcement.'}
            {activeTab === 'feedback-insights' && 'Cross-college rating trends, response volume, and quality indicators.'}
            {activeTab === 'governance-logs' && 'Recent high-signal platform actions and governance-relevant events.'}
            {activeTab === 'analytics' && 'Registration trends, category distribution and college participation.'}
            {activeTab === 'colleges' && 'Manage all registered institutions on the platform.'}
            {activeTab === 'events' && 'Global registry of all campus events and their visibility.'}
            {activeTab === 'users' && 'Platform-wide user directory across all colleges.'}
            {activeTab === 'approvals' && 'Review and action pending college admin and event approval requests.'}
          </p>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <section className="admin-panel px-6 py-6 md:px-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl space-y-3">
                  <p className="admin-kicker">Platform oversight</p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-[2.5rem]">
                    One place to review platform health, approval pressure, and institutional performance.
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">
                    This view prioritizes approval load, operational signals, and adoption momentum so the next action is obvious without digging through tabs.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => navigate("/superadmin?tab=approvals")}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <p className="text-xs font-semibold text-slate-500">Approval queue</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Review admins and event proposals</p>
                  </button>
                  <button
                    onClick={() => navigate("/superadmin?tab=alerts")}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <p className="text-xs font-semibold text-slate-500">Risk watch</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Open live alerts and anomalies</p>
                  </button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {overviewStats.map((item) => {
                const Icon = item.icon;
                const toneClass = item.tone === "rose"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : item.tone === "amber"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : item.tone === "slate"
                      ? "border-slate-200 bg-slate-100 text-slate-700"
                      : "border-indigo-200 bg-indigo-50 text-indigo-700";

                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="admin-panel group px-5 py-5 text-left transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                        <p className="admin-metric-value mt-3">{item.value}</p>
                      </div>
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600">{item.meta}</p>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-600" />
                    </div>
                  </button>
                );
              })}
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {overviewHealth.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="admin-panel px-5 py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{item.value}</p>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">{item.detail}</p>
                  </div>
                );
              })}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
              <div className="space-y-6">
                <div className="admin-panel overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                      <p className="admin-kicker">Growth</p>
                      <h3 className="admin-section-title mt-1">Registration momentum</h3>
                    </div>
                    <button
                      onClick={() => navigate("/superadmin?tab=analytics")}
                      className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      Open analytics
                    </button>
                  </div>
                  <div className="px-4 py-5 md:px-6">
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics?.registrationTrend || []}>
                          <defs>
                            <linearGradient id="adminOverviewRegistrations" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.18} />
                              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="2 4" />
                          <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dx={-10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="count"
                            name="Registrations"
                            stroke="#4f46e5"
                            strokeWidth={2.5}
                            fill="url(#adminOverviewRegistrations)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="admin-panel overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                      <p className="admin-kicker">Institutions</p>
                      <h3 className="admin-section-title mt-1">Top college performance</h3>
                    </div>
                    <button
                      onClick={() => navigate("/superadmin?tab=feedback-insights")}
                      className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      View insights
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="border-b border-slate-200 bg-slate-50/80">
                        <tr className="text-left">
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500">College</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500">Events</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500">Registrations</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {topCollegeRows.map((college) => (
                          <tr key={college.collegeId} className="bg-white">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{college.collegeName}</p>
                                <p className="mt-1 text-xs text-slate-500">Operational footprint across approved activity</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">{college.eventsCount || 0}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                {college.registrationsCount || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">{Number(college.avgRating || 0).toFixed(1)}</td>
                          </tr>
                        ))}
                        {topCollegeRows.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-500">
                              No college performance data is available yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="admin-panel overflow-hidden">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <p className="admin-kicker">Attention</p>
                    <h3 className="admin-section-title mt-1">Queue and alerts</h3>
                  </div>
                  <div className="space-y-4 px-6 py-5">
                    <div className="admin-panel-muted px-4 py-4">
                      <p className="text-xs font-semibold text-slate-500">Open approvals</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{totalApprovalQueue}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {stats.pendingAdmins || 0} admin requests and {stats.pendingEvents || 0} event proposals waiting.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {platformAlerts.slice(0, 4).map((alert, index) => (
                        <button
                          key={`${alert.kind}-${index}`}
                          onClick={() => navigate(alert.target)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/30"
                        >
                          <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{alert.detail}</p>
                        </button>
                      ))}
                      {platformAlerts.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                          No active platform alerts right now.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-panel overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                      <p className="admin-kicker">Activity</p>
                      <h3 className="admin-section-title mt-1">Recent changes</h3>
                    </div>
                    <button
                      onClick={() => navigate("/superadmin?tab=governance-logs")}
                      className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      Governance logs
                    </button>
                  </div>
                  <div className="space-y-4 px-6 py-5">
                    {majorActivities.map((activity, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-6 text-slate-900">
                            {activity.displayMessage || formatActivity(activity.type)}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-500">{timeAgo(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                    {majorActivities.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                        No major platform activity has been recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-panel overflow-hidden">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <p className="admin-kicker">Quality</p>
                    <h3 className="admin-section-title mt-1">Colleges to review</h3>
                  </div>
                  <div className="space-y-3 px-6 py-5">
                    {lowRatedColleges.slice(0, 4).map((college) => (
                      <div key={college.collegeId} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{college.collegeName}</p>
                          <p className="mt-1 text-sm text-slate-600">{college.feedbackCount || 0} responses contributing to current score</p>
                        </div>
                        <span className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          {Number(college.avgRating || 0).toFixed(1)}
                        </span>
                      </div>
                    ))}
                    {lowRatedColleges.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                        No low-rated colleges require review at the moment.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Actions</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{totalApprovalQueue}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deadline Alerts</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{stats?.deadlineAlerts?.length || 0}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Capacity Alerts</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{stats?.capacityAlerts?.length || 0}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-slate-900">Live Alerts</h3>
              {platformAlerts.length === 0 && <p className="text-sm text-slate-500">No live alerts currently.</p>}
              {platformAlerts.map((alert, index) => (
                <div key={`${alert.kind}-${index}`} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{alert.detail}</p>
                  </div>
                  <button onClick={() => navigate(alert.target)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Open</button>
                </div>
              ))}
            </div>

            {/* Governance Signals Panel */}
            {signalsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Low Rating Alerts */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900">Low Rating Alerts</h4>
                    <span className="ml-auto text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{platformSignals.lowRatingAlerts.length}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {platformSignals.lowRatingAlerts.length === 0 ? (
                      <p className="text-xs text-slate-400">No low-rated events detected.</p>
                    ) : platformSignals.lowRatingAlerts.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="font-semibold text-slate-800">{item.eventTitle}</p>
                          <p className="text-slate-400">{item.collegeName} · {item.reviewCount} reviews</p>
                        </div>
                        <span className="font-black text-rose-600">{item.avgRating}/5</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High No-Show Events */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900">High No-Show Events</h4>
                    <span className="ml-auto text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{platformSignals.highNoShowEvents.length}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {platformSignals.highNoShowEvents.length === 0 ? (
                      <p className="text-xs text-slate-400">No high no-show events detected.</p>
                    ) : platformSignals.highNoShowEvents.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="font-semibold text-slate-800">{item.eventTitle}</p>
                          <p className="text-slate-400">{item.collegeName} · {item.total} checked</p>
                        </div>
                        <span className="font-black text-amber-600">{item.noShowRate}% no-show</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequent Event Edits */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900">Frequent Event Edits</h4>
                    <span className="ml-auto text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{platformSignals.frequentEditEvents.length}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {platformSignals.frequentEditEvents.length === 0 ? (
                      <p className="text-xs text-slate-400">No frequently edited events detected.</p>
                    ) : platformSignals.frequentEditEvents.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="font-semibold text-slate-800">{item.eventTitle}</p>
                          <p className="text-slate-400">{item.collegeName}</p>
                        </div>
                        <span className="font-black text-indigo-600">{item.editCount} edits</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capacity Anomalies */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900">Capacity Anomalies</h4>
                    <span className="ml-auto text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{platformSignals.capacityAnomalies.length}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {platformSignals.capacityAnomalies.length === 0 ? (
                      <p className="text-xs text-slate-400">No capacity anomalies detected.</p>
                    ) : platformSignals.capacityAnomalies.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="font-semibold text-slate-800">{item.eventTitle}</p>
                          <p className="text-slate-400">{item.collegeName} · cap: {item.maxParticipants}</p>
                        </div>
                        <span className={`font-black px-1.5 py-0.5 rounded ${item.anomalyType === 'very_low_cap' ? 'text-violet-600 bg-violet-50' : 'text-slate-600 bg-slate-100'}`}>
                          {item.anomalyType === 'very_low_cap' ? 'Very small' : 'Very large'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "monitoring" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Approved Admins</p><p className="text-3xl font-black text-slate-900 mt-2">{stats?.totalCollegeAdmins || 0}</p></div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Admins</p><p className="text-3xl font-black text-slate-900 mt-2">{stats?.pendingAdmins || 0}</p></div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Approval Rate</p><p className="text-3xl font-black text-slate-900 mt-2">{adminApprovalRate}%</p></div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Events Ratio</p><p className="text-3xl font-black text-slate-900 mt-2">{activeEventsRatio}%</p></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-3">Pending Admin Approvals</h3>
              {pendingAdmins.length === 0 ? <p className="text-sm text-slate-500">No pending admin approvals.</p> : (
                <div className="space-y-2">
                  {pendingAdmins.slice(0, 10).map((admin) => (
                    <div key={admin._id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{admin.firstName} {admin.lastName}</p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </div>
                      <button onClick={() => handleViewPendingAdmin(admin)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "moderation" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Events</p><p className="text-3xl font-black text-slate-900 mt-2">{pendingEvents.length}</p></div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Event Acceptance Rate</p><p className="text-3xl font-black text-slate-900 mt-2">{eventAcceptanceRate}%</p></div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Comments in Queue</p><p className="text-3xl font-black text-slate-900 mt-2">{moderationComments.length}</p></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-3">Pending Event Queue</h3>
              {pendingEvents.length === 0 ? <p className="text-sm text-slate-500">No events pending moderation.</p> : (
                <div className="space-y-2">
                  {pendingEvents.slice(0, 10).map((event) => (
                    <div key={event._id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500">{event.college?.name || "Unknown college"}</p>
                      </div>
                      <button onClick={() => handleViewPendingEvent(event._id)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Review</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-3">Comment Moderation Queue</h3>
              {moderationComments.length === 0 ? <p className="text-sm text-slate-500">No comments in moderation queue.</p> : (
                <div className="space-y-2">
                  {moderationComments.slice(0, 12).map((comment) => (
                    <div key={comment._id} className="rounded-xl border border-slate-200 p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{comment.eventId?.title || "Unknown event"} | {comment.userId?.firstName || "Student"}</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1 line-clamp-2">{comment.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/event/${comment.eventId?._id}`)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Open</button>
                        <button onClick={() => handleRemoveComment(comment._id)} className="text-xs font-semibold text-rose-600 hover:text-rose-800">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "feedback-insights" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Feedback</p><p className="text-3xl font-black text-slate-900 mt-2">{feedbackAnalytics.summary?.totalFeedback || 0}</p></div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Platform Avg Rating</p><p className="text-3xl font-black text-slate-900 mt-2">{feedbackAnalytics.summary?.platformAverageRating || 0}</p></div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Feedback Response Rate</p><p className="text-3xl font-black text-slate-900 mt-2">{feedbackAnalytics.summary?.responseRate || 0}%</p></div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-slate-900">Lowest Rated Events</h3>
              {(feedbackAnalytics.lowestRatedEvents || []).length === 0 && <p className="text-sm text-slate-500">No rated events found yet.</p>}
              {(feedbackAnalytics.lowestRatedEvents || []).map((event, index) => (
                <div key={`${event.eventId || index}`} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{event.eventTitle}</p>
                    <p className="text-xs text-slate-500 mt-1">{event.collegeName} | {event.feedbackCount || 0} reviews</p>
                  </div>
                  <p className="text-sm font-black text-rose-600">{event.avgRating || 0} / 5</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">College Feedback Overview</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50"><tr><th className="px-6 py-4 font-bold">College</th><th className="px-6 py-4 font-bold">Avg Rating</th><th className="px-6 py-4 font-bold">Feedback</th><th className="px-6 py-4 font-bold">Registrations</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {(feedbackAnalytics.perCollege || []).length === 0 ? <tr><td colSpan="4" className="px-6 py-12 text-sm text-slate-500 text-center">No feedback analytics data yet.</td></tr> : (feedbackAnalytics.perCollege || []).map((row) => (
                      <tr key={row.collegeId}><td className="px-6 py-4 text-sm font-semibold text-slate-800">{row.collegeName}</td><td className="px-6 py-4 text-sm text-slate-600">{row.avgRating || 0}</td><td className="px-6 py-4 text-sm text-slate-600">{row.feedbackCount || 0}</td><td className="px-6 py-4 text-sm text-slate-600">{row.registrationsCount || 0}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "governance-logs" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-slate-900">Recent Governance Activity</h3>
              {majorActivities.length === 0 && <p className="text-sm text-slate-500">No governance logs in the selected window.</p>}
              {majorActivities.map((activity, idx) => (
                <div key={`${activity._id || idx}`} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{activity.displayMessage || formatActivity(activity.type)}</p>
                  <p className="text-xs text-slate-500 mt-1">{timeAgo(activity.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "colleges" && (
          <div className="space-y-8 animate-fade-in">
            {/* Add College Form */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3"><Building2 className="w-5 h-5 text-indigo-600" />Colleges</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage all registered institutions</p>
                </div>
                <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full">{allColleges.length} Total</span>
              </div>
              <div className="p-8 border-b border-slate-50">
                <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-600" />Add New College</p>
                <form onSubmit={async (e) => { e.preventDefault(); await handleCreateCollege(e); fetchColleges(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="College Name" value={collegeForm.name} onChange={(e) => setCollegeForm(p => ({ ...p, name: e.target.value }))} required />
                  <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Code (e.g. IOT)" value={collegeForm.code} onChange={(e) => setCollegeForm(p => ({ ...p, code: e.target.value }))} required />
                  <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Official Email" value={collegeForm.email} onChange={(e) => setCollegeForm(p => ({ ...p, email: e.target.value }))} required />
                  <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Phone" value={collegeForm.phone} onChange={(e) => setCollegeForm(p => ({ ...p, phone: e.target.value }))} />
                  <button type="submit" disabled={creatingCollege} className="rounded-2xl bg-slate-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60 flex items-center gap-2 justify-center">
                    <Plus className="w-4 h-4" />{creatingCollege ? 'Creating...' : 'Add College'}
                  </button>
                </form>
              </div>
              {/* Search */}
              <div className="px-8 py-4 border-b border-slate-50">
                <div className="max-w-sm">
                  <input className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm border-none outline-none" placeholder="Search colleges..." value={collegeSearch} onChange={(e) => setCollegeSearch(e.target.value)} />
                </div>
              </div>
              {collegesLoading ? (
                <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                      <tr>
                        <th className="px-8 py-5 font-bold">Institution</th>
                        <th className="px-8 py-5 font-bold">Code</th>
                        <th className="px-8 py-5 font-bold">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allColleges.filter(c => !collegeSearch || c.name.toLowerCase().includes(collegeSearch.toLowerCase()) || c.code.toLowerCase().includes(collegeSearch.toLowerCase())).map(college => (
                        <tr key={college._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-indigo-600" /></div>
                              <span className="font-bold text-slate-900">{college.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5"><span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase">{college.code}</span></td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{college.email || '-'}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{college.phone || '-'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {allColleges.length === 0 && !collegesLoading && (
                        <tr><td colSpan="4" className="px-8 py-20 text-center"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No colleges yet. Add one above.</p></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3"><Calendar className="w-5 h-5 text-indigo-600" />Global Event Registry</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status and visibility control for all platform events</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <input
                      type="text"
                      placeholder="Search global events..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                    />
                  </div>
                  <select
                    value={eventSort}
                    onChange={(e) => setEventSort(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popularity">By Popularity</option>
                    <option value="startDate">Upcoming</option>
                  </select>
                  <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-full">{allEvents.length} Events</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Event</th>
                      <th className="px-8 py-5 font-bold">Organizer</th>
                      <th className="px-8 py-5 font-bold">Status</th>
                      <th className="px-8 py-5 font-bold">Audience</th>
                      <th className="px-8 py-5 font-bold">Visibility</th>
                      <th className="px-8 py-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allEvents.map(event => (
                      <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">{event.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{event.category}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs text-slate-500 font-medium">{event.college?.name || 'External'}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${event.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                            event.status === 'paused' ? 'bg-amber-50 text-amber-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>{event.status}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${event.audience === 'all_colleges' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                            {event.audience === 'all_colleges' ? 'Global' : 'Local'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${event.isVisible ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                            {event.isVisible ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => handleToggleVisibility(event._id, event.isVisible)}
                            className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-all ${event.isVisible ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                              }`}
                          >
                            {event.isVisible ? 'Hide' : 'Show'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3"><Users className="w-5 h-5 text-indigo-600" />All Users</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform-wide user directory</p>
                </div>
                <button onClick={fetchUsers} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><Activity className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="px-8 py-4 border-b border-slate-50 flex items-center gap-4 flex-wrap">
                <div className="max-w-sm flex-1">
                  <input className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm border-none outline-none" placeholder="Search by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  {['all', 'student', 'college_admin'].map(r => (
                    <button key={r} onClick={() => setUserRoleFilter(r)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRoleFilter === r ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      {r === 'all' ? 'All' : r === 'student' ? 'Students' : 'Admins'}
                    </button>
                  ))}
                </div>
              </div>
              {usersLoading ? (
                <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                      <tr>
                        <th className="px-8 py-5 font-bold">User</th>
                        <th className="px-8 py-5 font-bold">Role</th>
                        <th className="px-8 py-5 font-bold">College</th>
                        <th className="px-8 py-5 font-bold">Status</th>
                        <th className="px-8 py-5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allUsers
                        .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
                        .filter(u => !userSearch || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase()))
                        .map(u => (
                          <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{u.firstName} {u.lastName}</p>
                                  <p className="text-xs text-slate-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${u.role === 'college_admin' ? 'bg-indigo-50 text-indigo-600' : u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                                {ROLE_LABEL[u.role] || u.role}
                              </span>
                            </td>
                            <td className="px-8 py-5"><span className="text-xs text-slate-500 font-medium">{u.college?.name || '-'}</span></td>
                            <td className="px-8 py-5">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${u.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {u.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => handleViewUser(u)} className="p-2 border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                                <Info className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {allUsers.length === 0 && !usersLoading && (
                        <tr><td colSpan="4" className="px-8 py-20 text-center"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No users found.</p></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Events</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{feedbackAnalytics.summary?.totalEvents || 0}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Registrations</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{feedbackAnalytics.summary?.totalRegistrations || 0}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Feedback</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{feedbackAnalytics.summary?.totalFeedback || 0}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Per-College Analytics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-6 py-4 font-bold">College</th>
                      <th className="px-6 py-4 font-bold">Events</th>
                      <th className="px-6 py-4 font-bold">Avg Rating</th>
                      <th className="px-6 py-4 font-bold">Registrations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(feedbackAnalytics.perCollege || []).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-sm text-slate-500 text-center">No analytics data yet.</td>
                      </tr>
                    ) : (
                      (feedbackAnalytics.perCollege || []).map((row) => (
                        <tr key={row.collegeId}>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{row.collegeName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{row.eventsCount}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{row.avgRating || 0}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{row.registrationsCount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="greta-card greta-card-hover">
                <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-500" />
                  Event Categories
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.categoryDistribution}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={75}
                        paddingAngle={8}
                      >
                        {analytics?.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="greta-card greta-card-hover">
                <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  Top Colleges
                </h3>
                {analytics?.collegeParticipation?.length ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.collegeParticipation} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10, fontBold: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center text-center px-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No participation data yet. College ranking will appear after registrations start.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="space-y-12 animate-fade-in">
            {/* Identity Requests */}
            <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-200/50">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-500" />
                    College Admin Requests
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review and approve new admin applications.</p>
                </div>
                <span className="text-xs font-black bg-indigo-600 text-white px-3 py-1 rounded-full">{pendingAdmins.length} Requests</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] items-center text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Applicant</th>
                      <th className="px-8 py-5 font-bold">College</th>
                      <th className="px-8 py-5 font-bold">Identification</th>
                      <th className="px-8 py-5 font-bold">Status</th>
                      <th className="px-8 py-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingAdmins.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center opacity-40 grayscale">
                            <UserCheck className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No pending admins</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pendingAdmins.map(admin => (
                        <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                {admin.firstName[0]}{admin.lastName[0]}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-slate-900">{admin.firstName} {admin.lastName}</span>
                                  <button onClick={() => handleViewPendingAdmin(admin)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                    <Info className="w-3.5 h-3.5" title="View full details" />
                                  </button>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">{admin.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-700 font-bold">
                                {admin.college?.name || (admin.pendingCollegeName ? `New: ${admin.pendingCollegeName}` : "N/A")}
                              </span>
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{admin.college?.code || "PENDING"}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-700 font-bold flex items-center gap-1">ID: {admin.officialId || "-"}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {admin.phone || "No phone"}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg uppercase">Pending Review</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => handleApproveAdmin(admin._id)} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-slate-800 transition-all">Approve</button>
                              <button onClick={() => handleRejectAdmin(admin._id)} className="p-2 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Event Protocols */}
            <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-200/50">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Pending Event Approvals
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review event requests from college admins.</p>
                </div>
                <span className="text-xs font-black bg-indigo-600 text-white px-3 py-1 rounded-full">{pendingEvents.length} Actions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] items-center text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Event</th>
                      <th className="px-8 py-5 font-bold">Organizer</th>
                      <th className="px-8 py-5 font-bold">Category</th>
                      <th className="px-8 py-5 font-bold">Schedule</th>
                      <th className="px-8 py-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingEvents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center opacity-40 grayscale">
                            <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No pending events</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pendingEvents.map(event => (
                        <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                                <img src={event.bannerImage || "/images/campus_life_professional.png"} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 truncate max-w-[200px]">{event.title}</span>
                                <span className="text-xs text-slate-400 font-medium">{event.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-700 font-bold">{event.college?.name}</span>
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{event.college?.code}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg uppercase">{event.category}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-700 font-bold">{new Date(event.startDate).toLocaleDateString()}</span>
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => handleViewPendingEvent(event._id)} className="p-2.5 border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                                <Info className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleApproveEvent(event._id)} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-slate-800 transition-all">Approve</button>
                              <button onClick={() => handleRejectEvent(event._id)} className="p-2.5 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all">
                                <XCircle className="w-4 h-4" />
                              </button>
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

        {selectionDetail.show && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-up">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">
                    {selectionDetail.type === 'admin' ? 'Applicant Details' : selectionDetail.type === 'user' ? 'User Dossier' : 'Event Details'}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Full authentication record</p>
                </div>
                <button onClick={() => setSelectionDetail({ show: false, type: null, data: null })} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto no-scrollbar space-y-8">
                {selectionDetail.type === 'admin' || selectionDetail.type === 'user' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                        <p className="text-lg font-bold text-slate-900">{selectionDetail.data.firstName} {selectionDetail.data.lastName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                        <p className="text-sm font-medium text-slate-600">{selectionDetail.data.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                        <p className="text-sm font-medium text-slate-600">{selectionDetail.data.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Role</p>
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">{ROLE_LABEL[selectionDetail.data.role] || selectionDetail.data.role}</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">College / Institution</p>
                        <p className="text-lg font-bold text-indigo-600">{selectionDetail.data.college?.name || selectionDetail.data.pendingCollegeName || 'UNASSIGNED'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectionDetail.data.role === 'student' ? 'Student ID Number' : 'Official ID Number'}</p>
                        <p className="text-sm font-black bg-slate-100 px-3 py-1 rounded-lg inline-block">{selectionDetail.data.officialId || selectionDetail.data.studentId || 'NOT PROVIDED'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verification Status</p>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${selectionDetail.data.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {selectionDetail.data.isApproved ? 'Fully Verified' : 'Pending Approval'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration Date</p>
                        <p className="text-sm font-medium text-slate-600">{new Date(selectionDetail.data.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="relative h-48 rounded-2xl overflow-hidden group">
                      <img src={selectionDetail.data.bannerImage || "/images/campus_life_professional.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <h4 className="text-2xl font-black text-white italic">{selectionDetail.data.title}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                      <div className="space-y-4">
                        <p><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Category</span> <span className="font-bold text-slate-900">{selectionDetail.data.category === 'other' ? (selectionDetail.data.customCategory || 'other') : selectionDetail.data.category}</span></p>
                        <p><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Location</span> <span className="font-bold text-slate-900">{selectionDetail.data.location}</span></p>
                        <p><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Organizer College</span> <span className="font-bold text-indigo-600">{selectionDetail.data.college?.name || 'N/A'}</span></p>
                      </div>
                      <div className="space-y-4">
                        <p><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Start Date</span> <span className="font-bold text-slate-900">{new Date(selectionDetail.data.startDate).toLocaleString()}</span></p>
                        <p><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">End Date</span> <span className="font-bold text-slate-900">{new Date(selectionDetail.data.endDate).toLocaleString()}</span></p>
                        <p><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Capacity</span> <span className="font-bold text-slate-900">{selectionDetail.data.maxParticipants || 'Unlimited'} Students</span></p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-6 rounded-2xl">{selectionDetail.data.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Important Rules</p>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {(selectionDetail.data.dosAndDonts || []).length ? selectionDetail.data.dosAndDonts.map((rule, idx) => <li key={`rule-${idx}`} className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-indigo-500" /> {rule}</li>) : <li>No rules provided</li>}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Requirements</p>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {(selectionDetail.data.requirements || []).length ? selectionDetail.data.requirements.map((req, idx) => <li key={`req-${idx}`} className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-amber-500" /> {req}</li>) : <li>No requirements provided</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-8 border-t border-slate-100 bg-slate-50/30">
                <button onClick={() => setSelectionDetail({ show: false, type: null, data: null })} className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors">Close</button>
                {selectionDetail.type !== 'user' && (
                  <>
                    <button
                      onClick={() => {
                        if (selectionDetail.type === 'admin') handleRejectAdmin(selectionDetail.data._id);
                        else handleRejectEvent(selectionDetail.data._id);
                        setSelectionDetail({ show: false, type: null, data: null });
                      }}
                      className="px-6 py-3 rounded-xl border border-rose-200 bg-white text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        if (selectionDetail.type === 'admin') handleApproveAdmin(selectionDetail.data._id);
                        else handleApproveEvent(selectionDetail.data._id);
                        setSelectionDetail({ show: false, type: null, data: null });
                      }}
                      className="px-6 py-3 rounded-xl bg-slate-900 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 shadow-xl shadow-slate-200/50 transition-all active:scale-95"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {rejectionModal.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
              <div className="px-8 py-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 italic tracking-tight">Reject Application</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Please provide a reason for rejection.</p>
                  </div>
                </div>
                <button onClick={() => setRejectionModal({ show: false, id: null, type: null })} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejection Reason</label>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${rejectionReason.length < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {rejectionReason.length}/500
                    </span>
                  </div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value.slice(0, 500))}
                    placeholder="Provide a specific reason for the user..."
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
                    className="w-full sm:flex-1 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-none shadow-2xl rounded-2xl p-4 min-w-[130px]">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label || 'Date'}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <p className="text-xs font-bold text-white">{entry.name}: <span className="text-indigo-300">{entry.value ?? 0}</span></p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default AdminDashboard;
