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
    activeEvents: [],
  });
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [eventRes, studentRes] = await Promise.all([
        API.get("/events/my/events"),
        API.get("/auth/college/pending-students"),
      ]);

      const events = eventRes.data.data.events;
      const upcoming = events.filter((e) => new Date(e.startDate) > new Date()).length;
      const participants = events.reduce((sum, e) => sum + (e.currentParticipants || 0), 0);

      setStats({
        totalEvents: events.length,
        totalParticipants: participants,
        upcomingEvents: upcoming,
        activeEvents: events.slice(0, 3),
      });

      setPendingStudents(studentRes.data.data.users);
    } catch (err) {
      toast.error("Failed to load dashboard data");
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

  const handleApproveStudent = async (id) => {
    try {
      await API.patch(`/auth/admin/approve-user/${id}`);
      toast.success("Student approved successfully!");
      setPendingStudents(pendingStudents.filter((s) => s._id !== id));
    } catch (err) {
      toast.error("Failed to approve student");
    }
  };

  const handleRejectStudent = async (id) => {
    if (!window.confirm("Are you sure you want to reject this registration? The account will be deleted.")) return;
    try {
      await API.delete(`/auth/admin/reject-user/${id}`);
      toast.success("Student registration rejected.");
      setPendingStudents(pendingStudents.filter((s) => s._id !== id));
    } catch (err) {
      toast.error("Failed to reject student");
    }
  };

  if (!user?.isApproved && user?.role === "college_admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[30px] shadow-xl border border-gray-100 max-w-2xl mx-auto mt-10">
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
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">College Overview</h1>
          <p className="text-gray-500 font-medium">{user?.college?.name} Management Portal</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          College Admin
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <article className="card-gradient p-10 flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-start">
            <i className="fas fa-calendar-alt text-4xl text-gray-700"></i>
            <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">Events</span>
          </div>
          <div>
            <div className="text-7xl font-bold text-gray-900 tracking-tighter mb-2">{stats.totalEvents}</div>
            <div className="text-gray-800 font-bold text-lg uppercase tracking-tighter">Managed</div>
          </div>
        </article>

        <article className="card-gradient p-10 flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-start">
            <i className="fas fa-users text-4xl text-gray-700"></i>
            <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">Engagement</span>
          </div>
          <div>
            <div className="text-7xl font-bold text-gray-900 tracking-tighter mb-2">{stats.totalParticipants}</div>
            <div className="text-gray-800 font-bold text-lg uppercase tracking-tighter">Enrollments</div>
          </div>
        </article>

        <article className="card-gradient p-10 flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-start">
            <i className="fas fa-clock text-4xl text-gray-700"></i>
            <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">Pending</span>
          </div>
          <div>
            <div className="text-7xl font-bold text-gray-900 tracking-tighter mb-2">{pendingStudents.length}</div>
            <div className="text-gray-800 font-bold text-lg uppercase tracking-tighter">Student Approvals</div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-lg">
          <h2 className="text-gray-900 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
            <i className="fas fa-user-clock text-amber-500"></i>
            Student Verification Requests
          </h2>
          <div className="space-y-4">
            {pendingStudents.length === 0 ? (
              <p className="text-gray-400 italic text-center py-10">No pending student registrations.</p>
            ) : (
              pendingStudents.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-bold">{s.firstName} {s.lastName}</span>
                    <span className="text-gray-500 text-xs">{s.email}</span>
                    <span className="text-indigo-600 font-bold text-[9px] uppercase mt-1 tracking-widest">Student ID: {s.officialId}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveStudent(s._id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                      title="Approve"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button
                      onClick={() => handleRejectStudent(s._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Reject"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-lg">
          <h2 className="text-gray-900 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
            <i className="fas fa-bolt text-indigo-500"></i>
            Recent Events
          </h2>
          <div className="space-y-4">
            {stats.activeEvents.length === 0 ? (
              <p className="text-gray-400 italic text-center py-10">No events found.</p>
            ) : (
              stats.activeEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-bold">{event.title}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${event.isApproved ? 'text-green-600' : 'text-amber-600'
                      }`}>
                      {event.isApproved ? 'Live' : 'Pending Approval'}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs font-medium">{new Date(event.startDate).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default CollegeAdminDashboard;
