import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import API from "../api/axios";
import toast from "react-hot-toast";

const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    upcomingEvents: 0,
    activeEvents: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get("/events/my/events");
      const events = res.data.data.events;

      const upcoming = events.filter(e => new Date(e.startDate) > new Date()).length;
      const participants = events.reduce((sum, e) => sum + (e.currentParticipants || 0), 0);

      setStats({
        totalEvents: events.length,
        totalParticipants: participants,
        upcomingEvents: upcoming,
        activeEvents: events.slice(0, 3) // Show top 3
      });
    } catch (err) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isApproved) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user?.isApproved && user?.role === 'college_admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[30px] shadow-xl border border-gray-100 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6">
            <i className="fas fa-clock text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Account Pending Approval</h1>
          <p className="text-gray-500 text-center px-10 leading-relaxed">
            Welcome to CampusEventHub! Your college administrator account has been created and is currently awaiting verification by the SuperAdmin.
            You will gain access to event management tools once approved.
          </p>
          <div className="mt-8 px-6 py-2 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-200">
            Current Status: Pending Verification
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">College Overview</h1>
        <p className="text-gray-500 font-medium">Administrative Insights & Performance</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Metric Card 1: Total Events */}
        <article className="card-gradient p-10 flex flex-col justify-between min-h-[348px]">
          <div className="flex justify-between items-start">
            <i className="fas fa-calendar-alt text-4xl text-gray-700"></i>
            <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">Total Hosting</span>
          </div>
          <div>
            <div className="text-8xl font-bold text-gray-900 tracking-tighter mb-2">{stats.totalEvents}</div>
            <div className="text-gray-800 font-bold text-xl uppercase tracking-tighter">Events Managed</div>
          </div>
        </article>

        {/* Metric Card 2: Total Participants */}
        <article className="card-gradient p-10 flex flex-col justify-between min-h-[348px]">
          <div className="flex justify-between items-start">
            <i className="fas fa-users text-4xl text-gray-700"></i>
            <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">Engagement</span>
          </div>
          <div>
            <div className="text-8xl font-bold text-gray-900 tracking-tighter mb-2">{stats.totalParticipants}</div>
            <div className="text-gray-800 font-bold text-xl uppercase tracking-tighter">Participants Enrolled</div>
          </div>
        </article>

        {/* Metric Card 3: Upcoming */}
        <article className="card-gradient p-10 flex flex-col justify-between min-h-[348px]">
          <div className="flex justify-between items-start">
            <i className="fas fa-chart-line text-4xl text-gray-700"></i>
            <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">Pipeline</span>
          </div>
          <div>
            <div className="text-8xl font-bold text-gray-900 tracking-tighter mb-2">{stats.upcomingEvents}</div>
            <div className="text-gray-800 font-bold text-xl uppercase tracking-tighter">Upcoming Activities</div>
          </div>
        </article>
      </div>

      {/* Recent Activity Mini-Section */}
      <section className="mt-12 bg-white rounded-[30px] p-8 border border-gray-100 shadow-lg">
        <h2 className="text-gray-900 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
          <i className="fas fa-bolt text-amber-500"></i>
          Recent Deployments
        </h2>
        <div className="space-y-4">
          {stats.activeEvents.length === 0 ? (
            <p className="text-gray-400 italic">No events found.</p>
          ) : stats.activeEvents.map(event => (
            <div key={event._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <span className="text-gray-900 font-bold">{event.title}</span>
              <span className="text-gray-500 text-sm">{new Date(event.startDate).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default CollegeAdminDashboard;
