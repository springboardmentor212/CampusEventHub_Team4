import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  CheckCircle2,
  XCircle,
  User,
  GraduationCap,
  School,
  Mail,
  ChevronRight,
  Star
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [activeTab, setActiveTab] = useState("browse");

  const categories = ["All Categories", "Workshop", "Sports", "Cultural", "Hackathon", "Seminar", "Technical"];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, collegesRes, regsRes] = await Promise.all([
        API.get("/events", {
          params: {
            category: category === "All Categories" ? "" : category.toLowerCase(),
            college: selectedCollege === "All Colleges" ? "" : selectedCollege,
            search,
          }
        }),
        API.get("/colleges"),
        API.get("/registrations/my"),
      ]);
      setEvents(eventsRes.data.data.events);
      setColleges(collegesRes.data.data.colleges);
      setMyRegs(regsRes.data.data.registrations);
    } catch (err) {
      toast.error("Failed to sync campus data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isApproved) {
      const delayDebounceFn = setTimeout(() => {
        fetchData();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setLoading(false);
    }
  }, [category, search, selectedCollege, user]);

  const handleRegister = async (eventId) => {
    try {
      const res = await API.post(`/events/${eventId}/register`);
      toast.success(res.data.message || "Registered successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register");
    }
  };

  const handleCancelReg = async (regId) => {
    if (!window.confirm("Cancel this registration? This action cannot be undone.")) return;
    try {
      await API.delete(`/registrations/${regId}/cancel`);
      toast.success("Registration cancelled.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    }
  };

  if (!user?.isApproved && user?.role === "student") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto mt-10">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 border border-indigo-100">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Account Restricted</h1>
          <p className="text-slate-500 text-center px-12 leading-relaxed">
            Welcome! Your student account for <strong>{user?.college?.name}</strong> is awaiting verification by your College Administrator.
            Once verified, you'll be able to unlock the full event catalog.
          </p>
          <div className="mt-8 px-5 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-200">
            Status: Pending Campus Verification
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const registeredEventIds = myRegs.map(r => r.event?._id);
  const approvedRegs = myRegs.filter(r => r.status === "approved" || r.status === "attended");
  const pendingRegs = myRegs.filter(r => r.status === "pending");
  const now = new Date();

  return (
    <DashboardLayout>
      <div className="flex border-b border-slate-200 mb-10 overflow-x-auto no-scrollbar">
        {["browse", "profile"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-sm font-bold capitalize transition-all whitespace-nowrap border-b-2 ${activeTab === tab
                ? "border-indigo-600 text-indigo-600 shadow-[inset_0_-2px_0_rgba(79,70,229,1)]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            {tab === 'browse' ? 'Event Marketplace' : 'My Activity'}
          </button>
        ))}
      </div>

      {activeTab === "browse" ? (
        <div className="animate-fade-in space-y-10">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="relative group max-w-lg w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search events, workshops, hackathons..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-600 uppercase tracking-widest"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
                <School className="w-3.5 h-3.5 text-slate-500" />
                <select
                  className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-600 uppercase tracking-widest max-w-[150px]"
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                >
                  <option value="All Colleges">All Institutions</option>
                  {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-2xl border border-slate-100">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No events found matching your current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {events.map((event) => {
                const isDeadlinePassed = event.registrationDeadline && new Date() > new Date(event.registrationDeadline);
                const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
                const hasStarted = new Date() > new Date(event.startDate);
                const alreadyRegistered = registeredEventIds.includes(event._id);
                const canRegister = !isDeadlinePassed && !isFull && !hasStarted && !alreadyRegistered;
                const spotsLeft = event.maxParticipants ? event.maxParticipants - event.currentParticipants : null;

                return (
                  <div key={event._id} className="premium-card flex flex-col h-full bg-white group border border-slate-200 overflow-hidden">
                    <div className="p-1">
                      <div className="h-2 w-full bg-slate-100 rounded-t-xl group-hover:bg-indigo-600 transition-colors"></div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-[0.2em]">
                          {event.category}
                        </span>
                        {spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0 && (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 animate-pulse">
                            Only {spotsLeft} left
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight mb-3 transition-colors group-hover:text-indigo-600">
                        {event.title}
                      </h3>

                      <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">
                        {event.description}
                      </p>

                      <div className="space-y-3 pt-4 border-t border-slate-50 mt-auto">
                        <div className="flex items-center gap-3 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <School className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold truncate">{event.college?.name}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-2">
                        {alreadyRegistered ? (
                          <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center gap-2 border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" />
                            Registered
                          </div>
                        ) : (isDeadlinePassed || hasStarted || isFull) ? (
                          <div className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 border border-slate-100 grayscale cursor-not-allowed">
                            <XCircle className="w-4 h-4" />
                            {isFull ? 'Sold Out' : 'Registration Closed'}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(event._id)}
                            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100 hover:shadow-indigo-200"
                          >
                            Register Now
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in space-y-10 pb-20">
          {/* Compact Profile Header */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{user?.firstName} {user?.lastName}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500 justify-center md:justify-start">
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{user?.officialId}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <School className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{user?.college?.name}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{user?.email}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="px-6 py-4 bg-indigo-600 rounded-2xl text-center shadow-lg shadow-indigo-100">
                <p className="text-2xl font-bold text-white leading-none">{approvedRegs.length}</p>
                <p className="text-[9px] font-extrabold text-indigo-100 uppercase tracking-widest mt-2 px-1">Approved</p>
              </div>
              <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-center">
                <p className="text-2xl font-bold text-slate-900 leading-none">{pendingRegs.length}</p>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Pending</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* active Status: Approved / Upcoming */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-500" />
                  Confirmed Tickets
                </h3>
                <span className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-500">{approvedRegs.length} Active</span>
              </div>
              <div className="p-6 space-y-4">
                {approvedRegs.length === 0 ? (
                  <div className="py-20 text-center text-slate-400">
                    <p className="text-sm italic">You don't have any approved registrations yet.</p>
                  </div>
                ) : (
                  approvedRegs.map(reg => (
                    <div key={reg._id} className="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between group hover:border-emerald-200 transition-all hover:bg-emerald-50/10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${reg.status === 'attended' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {reg.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {reg.event?.category}</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{reg.event?.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(reg.event?.startDate).toLocaleDateString()}
                          <span className="opacity-20">|</span>
                          <MapPin className="w-3 h-3" />
                          {reg.event?.location}
                        </p>
                      </div>
                      {new Date(reg.event?.startDate) > now && reg.status === 'approved' && (
                        <button
                          onClick={() => handleCancelReg(reg._id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          title="Cancel Ticket"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Pending Status Table */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Awaiting Approval
                </h3>
              </div>
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[350px]">
                {pendingRegs.length === 0 ? (
                  <div className="py-24 text-center text-slate-400">
                    <p className="text-sm italic">No pending requests at the moment.</p>
                  </div>
                ) : (
                  pendingRegs.map(reg => (
                    <div key={reg._id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{reg.event?.title}</p>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1 italic opacity-80">Pending Verification</p>
                      </div>
                      <button
                        onClick={() => handleCancelReg(reg._id)}
                        className="px-4 py-1.5 bg-white border border-slate-200 text-slate-400 text-[10px] font-bold rounded-lg hover:text-rose-600 hover:border-rose-100 transition-all uppercase tracking-widest"
                      >
                        Withraw
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Past/History Section */}
          {myRegs.some(r => r.status === 'attended') && (
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                Event Journey
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {myRegs.filter(r => r.status === 'attended').map(reg => (
                  <div key={reg._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{reg.event?.title}</h4>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1">Completed</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </DashboardLayout>
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

export default StudentDashboard;
