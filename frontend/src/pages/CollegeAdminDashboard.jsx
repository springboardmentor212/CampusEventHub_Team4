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
  PieChart as PieIcon
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";

const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, regRes] = await Promise.all([
        API.get("/college-admin/stats"),
        API.get("/college-admin/registrations")
      ]);
      setStats(statsRes.data.data);
      setRegistrations(regRes.data.data.registrations);
    } catch (err) {
      toast.error("Capture failed. Initialize your first event to sync data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (regId, status) => {
    try {
      await API.patch(`/college-admin/registrations/${regId}`, { status });
      toast.success(`Registration ${status}`);
      fetchDashboardData();
    } catch (err) {
      toast.error("Process failed");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Terminal...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 700 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Campus Life</h1>
            <p className="text-slate-500 mt-2 font-medium">Overview of registrations, events, and student engagement.</p>
          </div>
          <button
            onClick={() => navigate("/create-event")}
            className="hero-btn"
          >
            <Plus className="w-5 h-5" />
            Launch Program
          </button>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Programs', value: stats?.activeEvents || 0, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Total Enrollees', value: stats?.totalRegistrations || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Clearances', value: stats?.pendingRegistrations || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Engagement Rate', value: '84%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+12% this week</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none">{item.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{item.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bento-item bg-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Growth Analytics
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-item bg-indigo-600 text-white border-none shadow-indigo-200 shadow-xl flex flex-col justify-center p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black leading-tight mb-4">Discover Advanced Insights</h3>
              <p className="text-indigo-100 mb-8 leading-relaxed opacity-80">Generate comprehensive reports on student participation and event success rates.</p>
              <button className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all">
                View Reports
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Pending Clearances
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Program</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registrations.filter(r => r.status === 'pending').map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                          {reg.studentId?.firstName[0]}{reg.studentId?.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{reg.studentId?.firstName} {reg.studentId?.lastName}</p>
                          <p className="text-[10px] text-slate-500 font-medium lowercase tracking-wide">{reg.studentId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{reg.eventId?.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{reg.eventId?.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-500">{new Date(reg.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproval(reg._id, 'confirmed')}
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApproval(reg._id, 'rejected')}
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {registrations.filter(r => r.status === 'pending').length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center animate-fade-in grayscale-[0.5] opacity-60">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-300 mb-4 border border-indigo-100 shadow-sm transition-transform hover:scale-110">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Protocols: Secure</p>
                        <p className="text-xs text-slate-400 mt-1">Institutional registrations are currently fully processed.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CollegeAdminDashboard;
