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
  ArrowDownRight
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
      setPendingAdmins(adminsRes.data.data.users);
      setPendingEvents(eventsRes.data.data.events);
    } catch (err) {
      toast.error("Terminal ready. Initialize your dashboard credentials.");
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
    if (!window.confirm("Reject this event proposal? It will be removed from the queue.")) return;
    try {
      await API.delete(`/events/${id}/reject`);
      toast.success("Proposal rejected");
      setPendingEvents(prev => prev.filter(e => e._id !== id));
      fetchData();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  if (loading || !stats) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Control Panel</h1>
          <p className="text-slate-500 mt-1">Global platform oversight and management</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {["overview", "analytics", "approvals"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Building2} label="Institutions" value={stats.totalColleges} trend="+2 this month" trendType="up" color="indigo" />
            <StatCard icon={Calendar} label="Active Events" value={stats.totalEvents} trend="+12% vs last week" trendType="up" color="blue" />
            <StatCard icon={Users} label="Total Users" value={stats.totalStudents} trend="+48 today" trendType="up" color="emerald" />
            <StatCard icon={Clock} label="Pending Actions" value={stats.pendingAdmins + stats.pendingEvents} trend="Action required" trendType="neutral" color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Alerts Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Critical Alerts
                </h3>
                <div className="space-y-3">
                  {stats.pendingAdmins > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                      <span className="text-sm font-medium text-amber-900">{stats.pendingAdmins} Admin Requests</span>
                      <button onClick={() => setActiveTab('approvals')} className="text-xs font-bold text-amber-700 hover:underline">Review</button>
                    </div>
                  )}
                  {stats.capacityAlerts.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                      <span className="text-sm font-medium text-rose-900">{stats.capacityAlerts.length} Sold Out Events</span>
                      <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">High Load</span>
                    </div>
                  )}
                  {stats.pendingAdmins === 0 && stats.capacityAlerts.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm italic">
                      All systems normal
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Platform Pulse
                </h3>
                <div className="space-y-4">
                  <PulseIndicator label="Event Approval Rate" value="94%" />
                  <PulseIndicator label="System Uptime" value="99.9%" />
                  <PulseIndicator label="Avg. Response Time" value="1.2s" />
                </div>
              </div>
            </div>

            {/* Registration Trend Mini Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 tracking-tight">Registration Velocity</h3>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rolling 30 Days</div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.registrationTrend}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              Event Category Distribution
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
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                  >
                    {analytics?.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Top Participating Colleges
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.collegeParticipation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "approvals" && (
        <div className="space-y-8 animate-fade-in">
          {/* Pending Admins */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                Pending College Admins
              </h3>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase tracking-widest">{pendingAdmins.length} Requests</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] items-center text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Admin</th>
                    <th className="px-6 py-4 font-bold">College</th>
                    <th className="px-6 py-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center animate-fade-in grayscale-[0.5] opacity-60">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-300 mb-4 border border-indigo-100">
                            <UserCheck className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Queue: Purged</p>
                          <p className="text-xs text-slate-400 mt-1">No pending administrative credentials found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingAdmins.map(admin => (
                      <tr key={admin._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{admin.firstName} {admin.lastName}</p>
                          <p className="text-xs text-slate-500">{admin.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700 font-medium">{admin.college?.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleApproveAdmin(admin._id)} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRejectAdmin(admin._id)} className="p-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors">
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

          {/* Pending Events */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Pending Event Approvals
              </h3>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase tracking-widest">{pendingEvents.length} Pending</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {pendingEvents.length === 0 ? (
                <div className="col-span-2 py-24 text-center">
                  <div className="flex flex-col items-center animate-fade-in grayscale-[0.5] opacity-60">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-300 mb-4 border border-indigo-100">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Protocols: Secure</p>
                    <p className="text-xs text-slate-400 mt-1">Institutional records reflect a clean terminal.</p>
                  </div>
                </div>
              ) : (
                pendingEvents.map(event => (
                  <div key={event._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between group hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden border border-slate-200 shrink-0">
                        <img
                          src={event.bannerImage || "/images/campus_life_professional.png"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          alt=""
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{event.college?.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">{event.category}</span>
                          <span className="text-[9px] text-indigo-400 font-bold">{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleApproveEvent(event._id)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-transform active:scale-95 shadow-sm">Approve</button>
                      <button onClick={() => handleRejectEvent(event._id)} className="px-4 py-2 bg-white text-rose-600 text-xs font-bold rounded-lg border border-rose-200 hover:bg-rose-50 transition-transform active:scale-95 shadow-sm">Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, trendType, color }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color] || 'bg-slate-100'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trendType === 'up' ? 'bg-emerald-100 text-emerald-700' :
          trendType === 'down' ? 'bg-rose-100 text-rose-700' :
            'bg-slate-100 text-slate-600'
          }`}>
          {trendType === 'up' && <ArrowUpRight className="w-3 h-3" />}
          {trendType === 'down' && <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="stats-label">{label}</p>
        <p className="stats-value mt-1">{value}</p>
      </div>
    </div>
  );
};

const PulseIndicator = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-600">{label}</span>
    <span className="text-sm font-bold text-slate-900">{value}</span>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-none shadow-xl rounded-xl p-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-bold text-white">{payload[0].value} <span className="text-xs font-normal opacity-70 ml-1">Regs.</span></p>
      </div>
    );
  }
  return null;
};

export default AdminDashboard;
