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
  Check
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, analyticsRes, studentRes] = await Promise.all([
        API.get("/dashboards/college-admin"),
        API.get("/dashboards/analytics"),
        API.get("/auth/college/pending-students"),
      ]);

      setStats(dashRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setPendingStudents(studentRes.data.data.users);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isApproved) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleApproveStudent = async (id) => {
    try {
      await API.patch(`/auth/admin/approve-user/${id}`);
      toast.success("Student approved successfully!");
      setPendingStudents(prev => prev.filter((s) => s._id !== id));
      fetchData();
    } catch (err) {
      toast.error("Failed to approve student");
    }
  };

  const handleRejectStudent = async (id) => {
    if (!window.confirm("Reject and delete this student registration?")) return;
    try {
      await API.delete(`/auth/admin/reject-user/${id}`);
      toast.success("Student profile rejected");
      setPendingStudents(prev => prev.filter((s) => s._id !== id));
      fetchData();
    } catch (err) {
      toast.error("Failed to reject student");
    }
  };

  if (!user?.isApproved && user?.role === "college_admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto mt-10">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Access Restricted</h1>
          <p className="text-slate-500 text-center px-12 leading-relaxed">
            Your college administrator account for <strong>{user?.college?.name}</strong> is currently pending verification by the SuperAdmin.
            We'll notify you via email as soon as your account is activated.
          </p>
          <div className="mt-8 px-5 py-2 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-200">
            Status: Pending SuperAdmin Verification
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading || !stats) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Institutional Portal</h1>
          <p className="text-slate-500 font-medium mt-1">{user?.college?.name} Management Dashboard</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/create-event")} className="metallic-btn flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Event
          </button>
          <button onClick={() => navigate("/manage-events")} className="secondary-btn flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Manage
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {(stats.deadlineAlerts.length > 0 || stats.capacityAlerts.length > 0 || pendingStudents.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.deadlineAlerts.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-rose-900 font-bold text-sm">Upcoming Deadlines</h4>
                <p className="text-rose-700 text-[10px] font-medium uppercase tracking-wider">{stats.deadlineAlerts.length} Events closing soon</p>
              </div>
            </div>
          )}
          {stats.capacityAlerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-amber-900 font-bold text-sm">High Occupancy</h4>
                <p className="text-amber-700 text-[10px] font-medium uppercase tracking-wider">{stats.capacityAlerts.length} Events at 80%+</p>
              </div>
            </div>
          )}
          {pendingStudents.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-indigo-100" onClick={() => navigate("/manage-users")}>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-indigo-900 font-bold text-sm">Student Requests</h4>
                <p className="text-indigo-700 text-[10px] font-medium uppercase tracking-wider">{pendingStudents.length} Awaiting Review</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={Calendar} label="All Events" value={stats.totalEvents} trend="+3.2%" color="indigo" />
        <StatCard icon={Users} label="Total Reach" value={stats.totalParticipants} trend="+12.5%" color="emerald" />
        <StatCard icon={TrendingUp} label="Total Bookings" value={stats.totalRegistrations} color="blue" />
        <StatCard icon={UserCheck} label="Approval Rate" value="98.4%" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registration Trend</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Activity (Last 30 Days)</p>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bookings</span>
            </div>
          </div>
          <div className="h-72">
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

        {/* Secondary Chart/Info */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-900 w-full mb-8">Event Categories</h3>
          <div className="flex-1 w-full h-full max-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryDistribution || []}
                  dataKey="count"
                  nameKey="_id"
                  innerRadius={50}
                  outerRadius={80}
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
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            {analytics?.categoryDistribution.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-slate-600 uppercase truncate">{cat._id}</span>
                <span className="text-[10px] font-bold text-slate-400 ml-auto">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
        {/* Student Request Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Verification Queue
            </h3>
            <span className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-full text-slate-500 border border-slate-200">{pendingStudents.length} Requests</span>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm tracking-wide">Empty queue — all caught up!</div>
            ) : (
              pendingStudents.map(student => (
                <div key={student._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">ID: {student.officialId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveStudent(student._id)}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectStudent(student._id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Top Events Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Popular Events
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentEvents.slice(0, 5).map(event => (
              <div key={event._id} className="p-5 flex items-center border-l-4" style={{ borderColor: event.isApproved ? '#10b981' : '#f59e0b' }}>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{event.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{event.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">{event.currentParticipants}<span className="text-[10px] font-medium text-slate-400 ml-1">Regs.</span></p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{Math.round((event.currentParticipants / (event.maxParticipants || 1)) * 100)}% Cap.</p>
                </div>
                <button onClick={() => navigate(`/manage-events`)} className="p-2 ml-4 text-slate-300 hover:text-indigo-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="stats-label">{label}</p>
      <p className="stats-value mt-1">{value}</p>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-none shadow-xl rounded-xl p-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-bold text-white">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default CollegeAdminDashboard;
