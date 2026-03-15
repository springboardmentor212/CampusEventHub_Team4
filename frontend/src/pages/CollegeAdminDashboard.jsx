import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  const [pendingStudentsLoading, setPendingStudentsLoading] = useState(false);
  const [feedbackRows, setFeedbackRows] = useState([]);
  const [feedbackSummaries, setFeedbackSummaries] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectionDetail, setSelectionDetail] = useState({ show: false, type: null, data: null });
  const [regSearch, setRegSearch] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("all");

  // Rejection Modal State
  const [rejectionModal, setRejectionModal] = useState({ show: false, id: null, type: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
  const emptyStats = { totalEvents: 0, ongoingCount: 0, totalRegistrations: 0, totalParticipants: 0, pendingRegistrations: 0, averageCapacityPercent: 0, pendingApprovalCount: 0, capacityAlerts: [] };

  useEffect(() => {
    fetchDashboardData();
    fetchPendingStudents();
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await API.get("/feedback/college/mine");
      setFeedbackRows(res.data?.data?.feedback || []);
      setFeedbackSummaries(res.data?.data?.eventSummaries || []);
    } catch (err) {
      setFeedbackRows([]);
      setFeedbackSummaries([]);
    }
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
      } else {
        await API.patch(`/registrations/${rejectionModal.id}/reject`, { reason: rejectionReason });
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, eventsRes] = await Promise.allSettled([
        API.get("/dashboards/college-admin"),
        API.get("/dashboards/analytics"),
        API.get("/events/my/events")
      ]);
      setStats(statsRes.status === "fulfilled" ? { ...emptyStats, ...statsRes.value?.data?.data } : emptyStats);
      setAnalytics(analyticsRes.status === "fulfilled" ? analyticsRes.value?.data?.data : null);

      const events = eventsRes.status === "fulfilled" ? (eventsRes.value?.data?.data?.events || []) : [];
      setMyEvents(events);
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (regId, status) => {
    if (status === 'rejected') {
      setRejectionModal({ show: true, id: regId, type: 'registration' });
      return;
    }
    try {
      await API.patch(`/registrations/${regId}/approve`);
      toast.success(`Registration confirmed`);
      fetchDashboardData();
    } catch (err) {
      toast.error("Process failed");
    }
  };

  const handleViewEvent = (event) => {
    setSelectionDetail({ show: true, type: 'event', data: event });
  };

  const handleViewStudent = (student) => {
    setSelectionDetail({ show: true, type: 'user', data: student });
  };

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
            Your application is under review by the <span className="text-slate-900 font-bold">SuperAdmin</span>.
            You'll get an email notification once your account is fully authorized.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const pendingRegistrations = registrations.filter(r => r.status === 'pending');

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in relative">
        {/* Admin Header */}
        <header className="flex flex-col gap-1 pb-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight italic">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'registrations' && 'Registrations'}
                {activeTab === 'approvals' && 'Student Approvals'}
                {activeTab === 'feedback' && 'Feedback'}
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                {activeTab === 'overview' && 'Manage your college and events.'}
                {activeTab === 'registrations' && 'Manage event registrations and attendance.'}
                {activeTab === 'approvals' && 'Approve or reject student signups.'}
                {activeTab === 'feedback' && 'Analyze participant feedback and event reviews.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/create-event")}
                className="hero-btn px-6 py-3 text-sm italic shadow-xl shadow-indigo-100"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'events', label: 'Events Feed', icon: Calendar },
            { id: 'registrations', label: 'Registrations', icon: UserCheck, count: pendingRegistrations.length },
            { id: 'approvals', label: 'Approvals', icon: Shield, count: pendingStudents.length },
            { id: 'feedback', label: 'Feedback', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(`/admin?tab=${tab.id}`)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                : 'bg-white border border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-slate-600'
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Briefcase}
                label="Total Events"
                value={stats.totalEvents}
                trend={`${stats.ongoingCount || 0} Live Events`}
                trendTone="info"
                accent="text-indigo-600 bg-indigo-50 border-indigo-100"
              />
              <MetricCard
                icon={Users}
                label="Total Registrations"
                value={stats.totalRegistrations}
                trend={`${stats.totalParticipants} Check-ins`}
                trendTone="success"
                accent="text-emerald-600 bg-emerald-50 border-emerald-100"
              />
              <MetricCard
                icon={StarIcon}
                label="Avg Rating"
                value={(feedbackSummaries.reduce((acc, curr) => acc + (curr.avgRating || 0), 0) / (feedbackSummaries.length || 1)).toFixed(1)}
                trend={`${feedbackRows.length} Reviews`}
                trendTone="warning"
                accent="text-amber-600 bg-amber-50 border-amber-100"
              />
              <MetricCard
                icon={Zap}
                label="Avg Capacity"
                value={`${stats.averageCapacityPercent || 0}%`}
                trend="Capacity Use"
                accent="text-slate-700 bg-slate-100 border-slate-200"
              />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => navigate('/create-event')}
                  className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                  Create Event
                </button>
                <button onClick={() => navigate('/manage-events')}
                  className="p-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-colors">
                  Manage Events
                </button>
                <button onClick={() => navigate('/admin?tab=approvals')}
                  className="p-4 bg-amber-50 text-amber-600 rounded-2xl text-xs font-bold hover:bg-amber-100 transition-colors">
                  Student Approvals
                </button>
                <button onClick={() => navigate('/admin?tab=registrations')}
                  className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-colors">
                  Registrations
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex flex-col">
                    <h3 className="font-black text-xl text-slate-900 tracking-tight italic">Registration Activity</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">30-Day Volume Analysis</p>
                  </div>
                </div>
                <div className="flex-1 min-h-[300px]">
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
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2 italic">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Recent Activity
                </h3>
                <div className="space-y-6">
                  {(stats?.recentActivity || []).length > 0 ? (
                    stats.recentActivity.map((activity, i) => (
                      <div key={activity._id || i} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors text-lg">
                          {activity.icon || "📌"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{activity.displayMessage}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Platform Activity</p>
                        </div>
                        <div className="text-[9px] font-black text-slate-300 uppercase italic">
                          {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center opacity-40">
                      <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No recent activity</p>
                    </div>
                  )}
                </div>
                <button onClick={() => navigate('/admin?tab=registrations')} className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">View All Registrations</button>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group">
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px] italic">
                  <PieIcon className="w-4 h-4 text-indigo-500" />
                  Events by Category
                </h3>
                <div className="h-48 group-hover:scale-105 transition-transform duration-500">
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
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg italic">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Your Events
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage all events hosted by your institution.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Event</th>
                      <th className="px-8 py-5 font-bold">Timeline</th>
                      <th className="px-8 py-5 font-bold">Capacity</th>
                      <th className="px-8 py-5 font-bold">Status</th>
                      <th className="px-8 py-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myEvents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center opacity-40 grayscale">
                          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No events in portfolio</p>
                        </td>
                      </tr>
                    ) : (
                      myEvents.map(event => (
                        <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100">
                                <img src={event.bannerImage || "/images/campus_life_professional.png"} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 italic line-clamp-1">{event.title}</p>
                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{event.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700">{new Date(event.startDate).toLocaleDateString()}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700">{event.registrationsCount || 0} / {event.maxParticipants || '∞'}</span>
                              <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(((event.registrationsCount || 0) / (event.maxParticipants || 100)) * 100, 100)}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${event.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              event.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => handleViewEvent(event)} className="p-2.5 border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                              <Info className="w-4 h-4" />
                            </button>
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

        {activeTab === 'approvals' && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg italic">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Student Approvals
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Approve or reject students waiting to join your college.</p>
                </div>
                <button onClick={fetchPendingStudents} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all">
                  <Activity className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Applicant</th>
                      <th className="px-8 py-5 font-bold text-center">Reference ID</th>
                      <th className="px-8 py-5 font-bold">Submission</th>
                      <th className="px-8 py-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center opacity-40 grayscale">
                          <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No pending applications</p>
                        </td>
                      </tr>
                    ) : (
                      pendingStudents.map(student => (
                        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                                {student.firstName?.[0] || '?'}{student.lastName?.[0] || ''}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-slate-900 italic text-sm">{student.firstName} {student.lastName}</p>
                                  <button onClick={() => handleViewStudent(student)} className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-indigo-500 transition-colors">
                                    <Info className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold text-slate-700">{student.officialId || "-"}</span>
                              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">ID Card</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-300" />
                              {new Date(student.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => handlePendingStudentAction(student._id, "approve")} className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 tracking-widest transition-all active:scale-95">Approve</button>
                              <button onClick={() => handlePendingStudentAction(student._id, "reject")} className="p-2.5 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all">
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
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex flex-col">
                  <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg italic">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    Registrations
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage event registration requests.</p>
                </div>
              </div>
              <div className="px-8 py-4 border-b border-slate-50 flex items-center gap-4 flex-wrap bg-slate-50/20">
                <div className="max-w-sm flex-1">
                  <input className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium" placeholder="Search student or event..." value={regSearch} onChange={(e) => setRegSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  {['all', 'pending', 'confirmed', 'rejected'].map(s => (
                    <button key={s} onClick={() => setRegStatusFilter(s)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${regStatusFilter === s ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Student</th>
                      <th className="px-8 py-5 font-bold">Event Reference</th>
                      <th className="px-8 py-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {registrations
                      .filter(r => regStatusFilter === 'all' || r.status === regStatusFilter)
                      .filter(r => !regSearch || `${r.user?.firstName} ${r.user?.lastName} ${r.event?.title}`.toLowerCase().includes(regSearch.toLowerCase()))
                      .length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-8 py-20 text-center opacity-40">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching records</p>
                        </td>
                      </tr>
                    ) : (
                      registrations
                        .filter(r => regStatusFilter === 'all' || r.status === regStatusFilter)
                        .filter(r => !regSearch || `${r.user?.firstName} ${r.user?.lastName} ${r.event?.title}`.toLowerCase().includes(regSearch.toLowerCase()))
                        .map(reg => (
                          <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                                  {reg.user?.firstName?.[0]}{reg.user?.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-black text-slate-900 italic text-sm">{reg.user?.firstName} {reg.user?.lastName}</p>
                                    <button onClick={() => handleViewStudent(reg.user)} className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-indigo-500 transition-colors">
                                      <Info className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-medium">{reg.user?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm text-slate-800 font-bold italic line-clamp-1">{reg.event?.title}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">{reg.event?.category}</span>
                                  <span className={`text-[9px] font-black uppercase ${reg.status === 'confirmed' ? 'text-emerald-500' : reg.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>{reg.status}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {reg.status === 'pending' ? (
                                  <>
                                    <button onClick={() => handleApproval(reg._id, 'confirmed')} className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 tracking-widest transition-all active:scale-95">Approve</button>
                                    <button onClick={() => handleApproval(reg._id, 'rejected')} className="p-2.5 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all">
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Processed</span>
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
              {feedbackSummaries.map((item) => (
                <div key={item.eventId} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <h4 className="font-black text-slate-900 italic truncate mb-4">{item.eventTitle}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        <StarIcon filled className="w-4 h-4" />
                        <span className="text-lg font-black text-slate-900">{item.avgRating}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.count} Reviews</span>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              ))}
            </div>

            <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-lg italic uppercase tracking-widest text-xs">Recent Event Feedback</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Subject</th>
                      <th className="px-8 py-5 font-bold">Author</th>
                      <th className="px-8 py-5 font-bold">Quality</th>
                      <th className="px-8 py-5 font-bold">Reflection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {feedbackRows.map(row => (
                      <tr key={row._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-slate-800">{row.eventId?.title}</td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-slate-700">{row.userId?.firstName} {row.userId?.lastName}</p>
                        </td>
                        <td className="px-8 py-5 text-sm font-black text-slate-900">{row.rating}/5</td>
                        <td className="px-8 py-5 max-w-xs text-xs text-slate-500 font-medium leading-relaxed italic">"{row.comment}"</td>
                      </tr>
                    ))}
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

export default CollegeAdminDashboard;
