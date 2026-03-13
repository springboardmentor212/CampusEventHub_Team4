import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
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
  Settings,
  Shield,
  ArrowRight,
  Plus,
  Phone,
  Mail
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [selectedPendingEvent, setSelectedPendingEvent] = useState(null);
  const [detailPanel, setDetailPanel] = useState(null); // { type, data, title }
  const [panelLoading, setPanelLoading] = useState(false);
  const [creatingCollege, setCreatingCollege] = useState(false);
  const [collegeForm, setCollegeForm] = useState({ name: '', code: '', email: '', phone: '', departments: '' });

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, adminsRes, eventsRes] = await Promise.all([
        API.get("/dashboards/super-admin"),
        API.get("/dashboards/analytics"),
        API.get("/auth/admin/pending-users"),
        API.get("/events/admin/pending-events")
      ]);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setPendingAdmins(adminsRes.data.data.users || []);
      setPendingEvents(eventsRes.data.data.events || []);
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
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
    if (!window.confirm("Permanently reject and delete this admin applicant?")) return;
    try {
      await API.delete(`/auth/admin/reject-user/${id}`);
      toast.success("Applicant rejected");
      setPendingAdmins(prev => prev.filter(a => a._id !== id));
      fetchData();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleApproveEvent = async (id) => {
    try {
      await API.patch(`/events/${id}/approve`);
      toast.success("Event approved and live");
      setPendingEvents(prev => prev.filter(e => e._id !== id));
      fetchData();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleRejectEvent = async (id) => {
    const reason = window.prompt("Enter rejection reason (will be sent in rejection email):", "Missing required details");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    try {
      await API.delete(`/events/${id}/reject`, { data: { reason: reason.trim() } });
      toast.success("Proposal rejected");
      setPendingEvents(prev => prev.filter(e => e._id !== id));
      if (selectedPendingEvent?._id === id) setSelectedPendingEvent(null);
      fetchData();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleViewPendingEvent = async (eventId) => {
    try {
      const res = await API.get(`/events/${eventId}`);
      setSelectedPendingEvent(res.data.data.event);
    } catch (error) {
      toast.error("Failed to fetch full event details");
    }
  };

  const openDetailPanel = async (type) => {
    setPanelLoading(true);
    setDetailPanel({ type, data: [], title: '' });
    try {
      if (type === 'colleges') {
        const res = await API.get('/auth/admin/all-colleges');
        setDetailPanel({ type, title: 'All Colleges', data: res.data.data.colleges || [] });
      } else if (type === 'events') {
        const res = await API.get('/events?status=all&limit=50');
        setDetailPanel({ type, title: 'All Events', data: res.data.data.events || [] });
      } else if (type === 'students') {
        const res = await API.get('/auth/admin/all-users');
        const students = (res.data.data.users || []).filter(u => u.role === 'student');
        setDetailPanel({ type, title: 'All Students', data: students });
      } else if (type === 'approvals') {
        setDetailPanel({ type, title: 'Pending Approvals', data: { admins: pendingAdmins, events: pendingEvents } });
      }
    } catch (e) {
      toast.error('Failed to load details.');
      setDetailPanel(null);
    } finally {
      setPanelLoading(false);
    }
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
        departments: collegeForm.departments,
      });
      toast.success('College created');
      setCollegeForm({ name: '', code: '', email: '', phone: '', departments: '' });
      await openDetailPanel('colleges');
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
  const detailRecordCount = detailPanel
    ? detailPanel.type === 'approvals'
      ? (detailPanel.data?.admins?.length || 0) + (detailPanel.data?.events?.length || 0)
      : (detailPanel.data?.length || 0)
    : 0;

  if (loading || !stats || !analytics) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initializing Dashboards...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Superadmin Dashboard</h1>
            <p className="text-slate-500 font-medium">Overview of all colleges, events, and users.</p>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: PieChartIcon },
              { id: 'approvals', label: 'Approvals', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* Executive Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ExecutiveMetric
                icon={Building2} label="Total Colleges" value={stats.totalColleges}
                trend={`${stats.totalCollegeAdmins} Admins`} trendType="up"
                accent="text-indigo-600 bg-indigo-50 border-indigo-100"
                onClick={() => openDetailPanel('colleges')}
              />
              <ExecutiveMetric
                icon={Zap} label="Total Events" value={stats.totalEvents}
                trend={`${stats.ongoingEvents} Ongoing`} trendType="up"
                accent="text-amber-600 bg-amber-50 border-amber-100"
                onClick={() => openDetailPanel('events')}
              />
              <ExecutiveMetric
                icon={Users} label="Total Students" value={stats.totalStudents}
                trend={`${stats.totalRegistrations} Registrations`} trendType="up"
                accent="text-emerald-600 bg-emerald-50 border-emerald-100"
                onClick={() => openDetailPanel('students')}
              />
              <ExecutiveMetric
                icon={Clock} label="Pending Approvals" value={stats.pendingAdmins + stats.pendingEvents}
                trend={stats.pendingAdmins + stats.pendingEvents > 0 ? 'Needs Action' : 'All Clear'}
                trendType={stats.pendingAdmins + stats.pendingEvents > 0 ? 'down' : 'up'}
                accent={stats.pendingAdmins + stats.pendingEvents > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}
                onClick={() => openDetailPanel('approvals')}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Monitoring Feed */}
              <div className="lg:col-span-1 space-y-8">
                <div className="greta-card greta-card-hover border-amber-100 bg-amber-50/30">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    System Alerts
                  </h3>
                  <div className="space-y-4">
                    {stats.pendingAdmins > 0 && (
                      <div className="p-4 bg-white rounded-xl border border-amber-100 flex items-center justify-between shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-amber-900">{stats.pendingAdmins} Pending Admins</span>
                          <span className="text-[10px] text-amber-600 font-bold uppercase">Awaiting Verification</span>
                        </div>
                        <button onClick={() => setActiveTab('approvals')} className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {stats.capacityAlerts.length > 0 && (
                      <div className="p-4 bg-white rounded-xl border border-rose-100 flex items-center justify-between shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-rose-900">{stats.capacityAlerts.length} Events Full</span>
                          <span className="text-[10px] text-rose-600 font-bold uppercase">Max Capacity Reached</span>
                        </div>
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                      </div>
                    )}
                    {stats.pendingAdmins === 0 && stats.capacityAlerts.length === 0 && (
                      <div className="py-10 text-center">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Urgent Alerts</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="greta-card greta-card-hover">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    System Performance
                  </h3>
                  <div className="space-y-6">
                    <EfficiencyRow label="Approval Rate" value={`${approvalRate}%`} progress={approvalRate} />
                    <EfficiencyRow label="Active Events Ratio" value={`${activeEventsRatio}%`} progress={activeEventsRatio} />
                    <EfficiencyRow label="Avg Regs / Event" value={`${avgRegistrationsPerEvent}`} progress={Math.min(100, avgRegistrationsPerEvent)} />
                  </div>
                </div>
              </div>

              {/* Main Growth Chart */}
              <div className="lg:col-span-2 greta-card greta-card-hover flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-xl text-slate-900 tracking-tight">Growth Overview</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registrations over 30 days</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Registrations</span>
                  </div>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.registrationTrend}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBold: 'bold', fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBold: 'bold', fill: '#94a3b8' }} dx={-10} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending College Admin Verification</p>
                </div>
                <span className="text-xs font-black bg-indigo-600 text-white px-3 py-1 rounded-full">{pendingAdmins.length} Requests</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] items-center text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-5 font-bold">Candidate</th>
                      <th className="px-8 py-5 font-bold">Institution</th>
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
                                <span className="font-bold text-slate-900">{admin.firstName} {admin.lastName}</span>
                                <span className="text-xs text-slate-400 font-medium">{admin.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-700 font-bold">{admin.college?.name}</span>
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{admin.college?.code}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg uppercase">Pending</span>
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
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <h3 className="font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    Event Approvals
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Pending events awaiting approval</p>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">
                  {pendingEvents.length} Pending Actions
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pendingEvents.length === 0 ? (
                  <div className="col-span-2 greta-card flex flex-col items-center justify-center py-20 bg-slate-50/50 border-dashed border-2">
                    <Globe className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pending events</p>
                  </div>
                ) : (
                  pendingEvents.map(event => (
                    <div key={event._id} className="greta-card greta-card-hover group border-l-4 border-l-indigo-500">
                      <div className="flex gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0 shadow-lg shadow-slate-200/50">
                          <img
                            src={event.bannerImage || "/images/campus_life_professional.png"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt=""
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{event.category}</span>
                              <h4 className="font-bold text-lg text-slate-900 leading-tight pr-4">{event.title}</h4>
                            </div>
                            <div className="shrink-0 p-1.5 bg-slate-50 rounded-lg text-slate-400">
                              {event.category === 'technical' ? <Zap className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3 h-3" />
                              {event.college?.name}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {new Date(event.startDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="pt-2 flex gap-3">
                            <button onClick={() => handleViewPendingEvent(event._id)} className="px-4 py-2.5 bg-slate-50 text-slate-700 text-[10px] font-black uppercase rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all">View</button>
                            <button onClick={() => handleApproveEvent(event._id)} className="flex-1 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-200/50 active:scale-95 transition-all">Approve</button>
                            <button onClick={() => handleRejectEvent(event._id)} className="px-5 py-2.5 bg-white text-rose-600 text-[10px] font-black uppercase rounded-xl border border-rose-100 hover:bg-rose-50 active:scale-95 transition-all">Reject</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {selectedPendingEvent && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/30">
            <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedPendingEvent.title}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Pending Event Full Details</p>
                </div>
                <button onClick={() => setSelectedPendingEvent(null)} className="p-2 rounded-xl hover:bg-slate-100">
                  <XCircle className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p><span className="font-bold text-slate-700">Category:</span> {selectedPendingEvent.category === 'other' ? (selectedPendingEvent.customCategory || 'other') : selectedPendingEvent.category}</p>
                  <p><span className="font-bold text-slate-700">Location:</span> {selectedPendingEvent.location}</p>
                  <p><span className="font-bold text-slate-700">Start:</span> {new Date(selectedPendingEvent.startDate).toLocaleString()}</p>
                  <p><span className="font-bold text-slate-700">End:</span> {new Date(selectedPendingEvent.endDate).toLocaleString()}</p>
                  <p><span className="font-bold text-slate-700">Registration Deadline:</span> {selectedPendingEvent.registrationDeadline ? new Date(selectedPendingEvent.registrationDeadline).toLocaleString() : 'Not set'}</p>
                  <p><span className="font-bold text-slate-700">Audience:</span> {selectedPendingEvent.visibilityScope === 'all_colleges' ? 'All Colleges' : 'Only Organizer College'}</p>
                  <p><span className="font-bold text-slate-700">Organizer College:</span> {selectedPendingEvent.college?.name || 'N/A'}</p>
                  <p><span className="font-bold text-slate-700">Created By:</span> {selectedPendingEvent.createdBy ? `${selectedPendingEvent.createdBy.firstName || ''} ${selectedPendingEvent.createdBy.lastName || ''}`.trim() : 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedPendingEvent.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Important Rules</p>
                    <ul className="space-y-1 text-sm text-slate-700 list-disc pl-5">
                      {(selectedPendingEvent.dosAndDonts || []).length ? selectedPendingEvent.dosAndDonts.map((rule, idx) => <li key={`rule-${idx}`}>{rule}</li>) : <li>No rules provided</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Requirements</p>
                    <ul className="space-y-1 text-sm text-slate-700 list-disc pl-5">
                      {(selectedPendingEvent.requirements || []).length ? selectedPendingEvent.requirements.map((req, idx) => <li key={`req-${idx}`}>{req}</li>) : <li>No requirements provided</li>}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setSelectedPendingEvent(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">Close</button>
                  <button onClick={() => handleRejectEvent(selectedPendingEvent._id)} className="px-4 py-2.5 rounded-xl border border-rose-200 bg-white text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Reject</button>
                  <button onClick={() => handleApproveEvent(selectedPendingEvent._id)} className="px-4 py-2.5 rounded-xl bg-slate-900 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800">Approve</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide-over Detail Panel */}
        {detailPanel && (
          <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{detailPanel.title}</h2>
                  <p className="text-xs font-medium text-slate-400 mt-1">{detailRecordCount} Records found</p>
                </div>
                <button onClick={() => setDetailPanel(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {panelLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching data...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {detailPanel.type === 'colleges' && (
                      <>
                        <form onSubmit={handleCreateCollege} className="p-5 border border-slate-100 rounded-3xl bg-slate-50/60 space-y-4">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-indigo-600" />
                            <p className="text-sm font-bold text-slate-900">Add College</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="College name" value={collegeForm.name} onChange={(e) => setCollegeForm((prev) => ({ ...prev, name: e.target.value }))} required />
                            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Code" value={collegeForm.code} onChange={(e) => setCollegeForm((prev) => ({ ...prev, code: e.target.value }))} required />
                            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="College email" value={collegeForm.email} onChange={(e) => setCollegeForm((prev) => ({ ...prev, email: e.target.value }))} required />
                            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Phone number" value={collegeForm.phone} onChange={(e) => setCollegeForm((prev) => ({ ...prev, phone: e.target.value }))} />
                          </div>
                          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Departments, comma separated" value={collegeForm.departments} onChange={(e) => setCollegeForm((prev) => ({ ...prev, departments: e.target.value }))} />
                          <button type="submit" disabled={creatingCollege} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60">
                            <Plus className="w-4 h-4" />
                            {creatingCollege ? 'Creating...' : 'Add College'}
                          </button>
                        </form>
                        {detailPanel.data.map(college => (
                          <div key={college._id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{college.name}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                  <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{college.email || 'Email not set'}</span>
                                  <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{college.phone || 'Phone not set'}</span>
                                </div>
                                {college.departments?.length > 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Departments: {college.departments.join(', ')}</p>}
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase">{college.code}</span>
                          </div>
                        ))}
                        {detailPanel.data.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No colleges found yet.</p>
                          </div>
                        )}
                      </>
                    )}

                    {detailPanel.type === 'events' && detailPanel.data.map(event => (
                      <div key={event._id} className="p-4 border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-indigo-100 transition-colors">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <img src={event.bannerImage || '/images/campus_life_professional.png'} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 line-clamp-1">{event.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-black text-indigo-500 uppercase">{event.category === 'other' ? (event.customCategory || 'other') : event.category}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${event.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {event.isApproved ? 'Live' : 'Pending'}
                        </span>
                      </div>
                    ))}
                    {detailPanel.type === 'events' && detailPanel.data.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No events found.</p>
                      </div>
                    )}

                    {detailPanel.type === 'students' && detailPanel.data.map(student => (
                      <div key={student._id} className="p-4 border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-indigo-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase">{student.college?.code || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                    {detailPanel.type === 'students' && detailPanel.data.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No students found.</p>
                      </div>
                    )}

                    {detailPanel.type === 'approvals' && (
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pending Admins</h4>
                          {detailPanel.data.admins?.length === 0 ? <p className="text-sm text-slate-300 italic">No pending admins</p> :
                            detailPanel.data.admins?.map(admin => (
                              <div key={admin._id} className="p-3 border-b border-slate-50 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">{admin.firstName}</span>
                                <button onClick={() => { setActiveTab('approvals'); setDetailPanel(null); }} className="text-[10px] font-black text-indigo-600 uppercase">View</button>
                              </div>
                            ))
                          }
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pending Events</h4>
                          {detailPanel.data.events?.length === 0 ? <p className="text-sm text-slate-300 italic">No pending events</p> :
                            detailPanel.data.events?.map(event => (
                              <div key={event._id} className="p-3 border-b border-slate-50 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">{event.title}</span>
                                <button onClick={() => { setActiveTab('approvals'); setDetailPanel(null); }} className="text-[10px] font-black text-indigo-600 uppercase">View</button>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const ExecutiveMetric = ({ icon: Icon, label, value, trend, trendType, accent, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden relative group cursor-pointer active:scale-[0.98]"
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
