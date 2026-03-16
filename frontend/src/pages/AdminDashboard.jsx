import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
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
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
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
  Bookmark
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
  const [feedbackAnalytics, setFeedbackAnalytics] = useState({ summary: {}, perCollege: [] });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
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
  }, [activeTab, eventSort, eventSearch]);

  const fetchData = async (signal) => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, adminsRes, eventsRes, feedbackAnalyticsRes, notificationsRes] = await Promise.allSettled([
        API.get("/dashboards/super-admin", { signal }),
        API.get("/dashboards/analytics", { signal }),
        API.get("/auth/admin/pending-users", { signal }),
        API.get("/events?isApproved=false", { signal }),
        API.get("/feedback/analytics", { signal }),
        API.get("/notifications?role=admin&limit=10", { signal })
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
        console.log("Pending admins response:", adminsRes.value.data);
        setPendingAdmins(adminsRes.value.data.data.users);
      }
      if (eventsRes.status === "fulfilled") setPendingEvents(eventsRes.value.data.data.events);
      if (feedbackAnalyticsRes.status === "fulfilled") setFeedbackAnalytics(feedbackAnalyticsRes.value.data.data);

      if (notificationsRes.status === "fulfilled") {
        const notifs = notificationsRes.value.data?.data?.notifications || [];
        setNotifications(notifs);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Dashboard fetch error:", err);
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
      const res = await API.get('/events', {
        params: {
          limit: 1000,
          search: eventSearch || undefined,
          sort: eventSort
        }
      });
      setAllEvents(res.data.data.events || []);
    } catch { toast.error('Failed to load global events'); }
    finally { setEventsLoading(false); }
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
        await API.delete(`/events/${rejectionModal.id}/reject`, { data: { reason: rejectionReason.trim() } });
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
      await API.patch(`/events/${id}/approve`);
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
      await API.patch(`/events/${eventId}`, { isVisible: !currentVisibility });
      toast.success(`Event ${!currentVisibility ? 'visible' : 'hidden'} on feed`);
      fetchEvents();
    } catch (err) {
      toast.error("Visibility toggle failed");
    }
  };

  const handleViewPendingEvent = async (eventId) => {
    try {
      const res = await API.get(`/events/${eventId}`);
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

  if (loading || !stats || !analytics) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
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
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'colleges' && 'Colleges'}
            {activeTab === 'events' && 'Event Registry'}
            {activeTab === 'users' && 'Users'}
            {activeTab === 'approvals' && 'Approvals'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {activeTab === 'overview' && 'Overview of all colleges, events, and users.'}
            {activeTab === 'analytics' && 'Registration trends, category distribution and college participation.'}
            {activeTab === 'colleges' && 'Manage all registered institutions on the platform.'}
            {activeTab === 'events' && 'Global registry of all campus events and their visibility.'}
            {activeTab === 'users' && 'Platform-wide user directory across all colleges.'}
            {activeTab === 'approvals' && 'Review and action pending college admin and event approval requests.'}
          </p>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-12">
            {/* Executive Metrics - 6 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <ExecutiveMetric
                icon={Building2}
                label="Colleges"
                value={stats.totalColleges || 0}
                trend={`${stats.totalColleges || 0} active`}
                trendType="neutral"
                accent="bg-indigo-50 text-indigo-600 border-indigo-100"
                onClick={() => navigate('/superadmin?tab=colleges')}
              />
              <ExecutiveMetric
                icon={ShieldCheck}
                label="Admins"
                value={stats.totalCollegeAdmins || 0}
                trend={`${stats.pendingAdmins || 0} pending approval`}
                trendType={(stats.pendingAdmins || 0) > 0 ? "warning" : "up"}
                accent="bg-indigo-50 text-indigo-600 border-indigo-100"
                onClick={() => navigate('/superadmin?tab=approvals')}
              />
              <ExecutiveMetric
                icon={Users}
                label="Students"
                value={stats.totalStudents || 0}
                trend={`${stats.pendingStudents || 0} pending approval`} // Fallback to 0 if not provided
                trendType={(stats.pendingStudents || 0) > 0 ? "warning" : "up"}
                accent="bg-emerald-50 text-emerald-600 border-emerald-100"
                onClick={() => navigate('/superadmin?tab=users')}
              />
              <ExecutiveMetric
                icon={Calendar}
                label="Live Events"
                value={stats.totalEvents || 0}
                trend={`${stats.pendingEvents || 0} pending review`}
                trendType={(stats.pendingEvents || 0) > 0 ? "warning" : "up"}
                accent="bg-amber-50 text-amber-600 border-amber-100"
                onClick={() => navigate('/superadmin?tab=events')}
              />
              <ExecutiveMetric
                icon={Activity}
                label="Registrations"
                value={stats.totalRegistrations || 0}
                trend={`${stats.registrationsThisMonth || 0} this month`}
                trendType="up"
                accent="bg-indigo-50 text-indigo-600 border-indigo-100"
                onClick={() => navigate('/superadmin?tab=analytics')}
              />
              <ExecutiveMetric
                icon={AlertTriangle}
                label="Pending Actions"
                value={(stats.pendingAdmins || 0) + (stats.pendingEvents || 0)}
                trend="Needs your attention"
                trendType="down"
                highlight={(stats.pendingAdmins || 0) + (stats.pendingEvents || 0) > 0}
                accent="bg-rose-50 text-rose-600 border-rose-100"
                onClick={() => navigate('/superadmin?tab=approvals')}
              />
            </div>

            {/* Platform Health Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="greta-card p-6 border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 tracking-widest">Approval Rate</p>
                  <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{approvalRate}%</h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="greta-card p-6 border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 tracking-widest">Event Acceptance</p>
                  <h4 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {stats.totalEvents ? Math.round(((stats.totalEvents - stats.pendingEvents) / stats.totalEvents) * 100) : 0}%
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="greta-card p-6 border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 tracking-widest">Avg Regs / Event</p>
                  <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{avgRegistrationsPerEvent}</h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* College Performance Table */}
              <div className="lg:col-span-2 space-y-8">
                <div className="greta-card overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 italic tracking-tight">College Performance</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ranked by total registrations</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                        <tr>
                          <th className="px-8 py-4 font-bold">College</th>
                          <th className="px-8 py-4 font-bold text-center">Admins</th>
                          <th className="px-8 py-4 font-bold text-center">Live Events</th>
                          <th className="px-8 py-4 font-bold text-center">Registrations</th>
                          <th className="px-8 py-4 font-bold text-center">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {feedbackAnalytics.perCollege
                          ?.sort((a, b) => b.registrationsCount - a.registrationsCount)
                          .slice(0, 5)
                          .map((college, idx) => (
                            <tr key={college.collegeId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-slate-300">#{idx + 1}</span>
                                  <span className="text-sm font-bold text-slate-900">{college.collegeName}</span>
                                </div>
                              </td>
                              <td className="px-8 py-4 text-center">
                                <span className="text-xs font-semibold text-slate-600">{allUsers.filter(u => u.college?._id === college.collegeId && u.role === 'college_admin').length || '1'}</span>
                              </td>
                              <td className="px-8 py-4 text-center text-sm font-bold text-indigo-600">{college.eventsCount}</td>
                              <td className="px-8 py-4 text-center">
                                <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">{college.registrationsCount}</span>
                              </td>
                              <td className="px-8 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-xs font-bold text-slate-900">{college.avgRating || '4.5'}</span>
                                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        {(!feedbackAnalytics.perCollege || feedbackAnalytics.perCollege.length === 0) && (
                          <tr><td colSpan="5" className="px-8 py-10 text-center text-xs text-slate-400 font-bold uppercase">No performance data yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="greta-card p-8">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 tracking-tight italic">Platform Growth</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly performance trend</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Registrations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">New Students</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.registrationTrend || []}>
                        <defs>
                          <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorStu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dx={-10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" name="Registrations" />
                        {/* Mocking second line if data not available, otherwise map from analytics */}
                        <Area type="monotone" dataKey={(d) => Math.round(d.count * 0.7)} stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorStu)" name="New Students" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-1 space-y-8">
                <div className="greta-card flex flex-col h-full overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="font-bold text-lg text-slate-900 italic tracking-tight">Recent Activity</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Major platform updates (latest 5)</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 max-h-[800px] no-scrollbar">
                    {majorActivities.map((activity, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all group-hover:scale-110 text-lg ${(activity.type || '').includes('REJECT') ? 'bg-rose-50' :
                          (activity.type || '').includes('APPROVE') ? 'bg-emerald-50' :
                            'bg-slate-50'
                          }`}>
                          {activity.icon || activityIcon(activity.type || '')}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {activity.displayMessage || formatActivity(activity.type)}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {timeAgo(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {majorActivities.length === 0 && (
                      <div className="py-20 px-8 text-center opacity-40">
                        <Activity className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                          No major platform updates yet.<br />
                          Important event and college changes<br />
                          will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={() => toast.success("Activity log redirected")} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">View all activity</button>
                  </div>
                </div>

              </div>
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

const ExecutiveMetric = ({ icon: Icon, label, value, trend, trendType, accent, onClick, highlight }) => (
  <div
    onClick={onClick}
    className={`${highlight ? 'bg-rose-50/50 border-rose-100' : 'bg-white border-slate-200'} border rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden relative group cursor-pointer active:scale-[0.98] shadow-sm`}
  >
    <div className="flex items-center justify-between">
      <div className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="p-1 px-2 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-indigo-600" />
      </div>
    </div>
    <div className="mt-6 relative z-10 space-y-3">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-100 uppercase tracking-widest ${trendType === 'up' ? 'text-emerald-600 bg-emerald-50' :
        trendType === 'down' ? 'text-rose-600 bg-rose-50' :
          trendType === 'warning' ? 'text-amber-600 bg-amber-50' :
            'text-slate-500 bg-slate-50'
        }`}>
        {trendType === 'up' && <ArrowUpRight className="w-3 h-3" />}
        {trendType === 'down' && <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500" />
  </div>
);

const EfficiencyRow = ({ label, value, progress }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-bold">
      <span className="text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-slate-900 tracking-tighter">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
      <div
        className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value || 0;
    return (
      <div className="bg-slate-900 border-none shadow-2xl rounded-2xl p-4 animate-fade-in translate-y-[-10px]">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">{label || 'Metric Data'}</p>
        <p className="text-xl font-black text-white text-center">{value} <span className="text-[10px] font-bold text-indigo-400 uppercase ml-1">Volume</span></p>
      </div>
    );
  }
  return null;
};

export default AdminDashboard;
