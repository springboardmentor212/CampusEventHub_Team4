import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
  Briefcase
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";

const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        API.get("/dashboards/college-admin"),
        API.get("/dashboards/analytics")
      ]);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);

      // Fetch registrations for events created by this admin
      const regRes = await API.get("/registrations/event/all");
      setRegistrations(regRes.data.data.registrations || []);
    } catch (err) {
      toast.error("Error syncing institutional data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (regId, status) => {
    try {
      await API.patch(`/registrations/${regId}/${status === 'confirmed' ? 'approve' : 'reject'}`);
      toast.success(`Registration ${status}`);
      fetchDashboardData();
    } catch (err) {
      toast.error("Process failed");
    }
  };

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hydrating Institutional Terminal...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Program Command</h1>
              <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">Institutional</span>
            </div>
            <p className="text-slate-500 font-medium">Growth and engagement metrics for the campus programs</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/create-event")}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Initialize Program
            </button>
          </div>
        </header>

        {/* Marketing/Financial Metrics */}
        <div className="stats-grid">
          <MetricCard
            icon={Briefcase}
            label="Live Portfolio"
            value={stats.totalEvents}
            trend={`${stats.upcomingCount} Upcoming`}
            accent="accent-marketing"
          />
          <MetricCard
            icon={Users}
            label="Engagement Volume"
            value={stats.totalRegistrations}
            trend={`${stats.totalParticipants} Total`}
            accent="accent-sales"
          />
          <MetricCard
            icon={Clock}
            label="Pending Pipeline"
            value={stats.pendingRegistrations}
            trend="Action Needed"
            accent="accent-financial"
          />
          <MetricCard
            icon={Zap}
            label="Capacity Peak"
            value={`${Math.round((stats.totalParticipants / (stats.totalEvents * 50 || 1)) * 100)}%`}
            trend="Rolling Average"
            accent="accent-operations"
          />
        </div>

        {/* Intelligence Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 greta-card greta-card-hover flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <h3 className="font-bold text-xl text-slate-900 tracking-tight">Engagement Intelligence</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Registration Flow (30D)</p>
              </div>
              <div className="flex items-center gap-4">
                <select className="bg-slate-50 border-none text-[10px] font-black uppercase rounded-lg px-2 py-1 outline-none cursor-pointer">
                  <option>Rolling 30 Days</option>
                  <option>Q1 Performance</option>
                </select>
              </div>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.registrationTrend}>
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

          <div className="lg:col-span-1 space-y-8">
            <div className="greta-card greta-card-hover border-amber-100 bg-amber-50/30">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Operational Alerts
              </h3>
              <div className="space-y-4">
                {stats.pendingRegistrations > 0 && (
                  <div className="p-4 bg-white rounded-2xl border border-amber-100 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-amber-900">{stats.pendingRegistrations} Registrations</span>
                      <span className="text-[10px] text-amber-600 font-bold uppercase">Pending Clearance</span>
                    </div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  </div>
                )}
                {stats.pendingApprovalCount > 0 && (
                  <div className="p-4 bg-white rounded-2xl border border-indigo-100 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-indigo-900">{stats.pendingApprovalCount} Proposals</span>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase">Awaiting SuperAdmin</span>
                    </div>
                    <button onClick={() => navigate('/manage-events')} className="p-2 bg-indigo-500 text-white rounded-lg">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {stats.capacityAlerts.length > 0 && (
                  <div className="p-4 bg-white rounded-2xl border border-rose-100 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-rose-900">{stats.capacityAlerts.length} Events</span>
                      <span className="text-[10px] text-rose-600 font-bold uppercase">Near Maximum Capacity</span>
                    </div>
                    <Activity className="w-4 h-4 text-rose-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="greta-card greta-card-hover">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-500" />
                Category Mix
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.categoryDistribution}
                      dataKey="count"
                      nameKey="_id"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                    >
                      {analytics?.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Flow: Approvals */}
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-200/50">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="font-bold text-slate-900 flex items-center gap-3 text-xl">
                <UserCheck className="w-6 h-6 text-indigo-600" />
                Student Clearance Queue
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Process pending program registrations</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">{registrations.filter(r => r.status === 'pending').length} Pending</span>
              <button onClick={fetchDashboardData} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Activity className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-50">
                <tr>
                  <th className="px-8 py-5 font-bold">Candidate</th>
                  <th className="px-8 py-5 font-bold">Target Program</th>
                  <th className="px-8 py-5 font-bold">Status</th>
                  <th className="px-8 py-5 font-bold text-right">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registrations.filter(r => r.status === 'pending').length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center opacity-40 grayscale">
                        <Shield className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Clearance queue: purged</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  registrations.filter(r => r.status === 'pending').map(reg => (
                    <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-black text-xs border border-slate-100">
                            {reg.user?.firstName?.[0]}{reg.user?.lastName?.[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{reg.user?.firstName} {reg.user?.lastName}</span>
                            <span className="text-xs text-slate-400 font-medium">{reg.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-700 font-bold">{reg.event?.title}</span>
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{reg.event?.category}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Protocol Check</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleApproval(reg._id, 'confirmed')} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95">Grant Access</button>
                          <button onClick={() => handleApproval(reg._id, 'rejected')} className="p-2 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all active:scale-95">
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
    </DashboardLayout>
  );
};

const MetricCard = ({ icon: Icon, label, value, trend, accent }) => (
  <div className="metric-card greta-card-hover group overflow-hidden">
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-2.5 rounded-xl border ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-widest">
        {trend}
      </div>
    </div>
    <div className="mt-4 relative z-10">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-0.5">{value}</p>
    </div>
    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform opacity-30" />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-none shadow-2xl rounded-2xl p-4 animate-fade-in translate-y-[-10px]">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-xl font-black text-white">{payload[0].value} <span className="text-[10px] font-bold text-indigo-400 uppercase ml-1">Enrollees</span></p>
      </div>
    );
  }
  return null;
};

export default CollegeAdminDashboard;
