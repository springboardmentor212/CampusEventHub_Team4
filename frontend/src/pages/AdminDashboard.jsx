import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approvals"); // "approvals", "colleges", "users"

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      const [pendingUsers, pendingEvents, colleges, users] = await Promise.all([
        API.get("/auth/admin/pending-users"),
        API.get("/events/admin/pending-events"),
        API.get("/auth/admin/all-colleges"),
        API.get("/auth/admin/all-users"),
      ]);
      setUsers(pendingUsers.data.data.users);
      setEvents(pendingEvents.data.data.events);
      setAllColleges(colleges.data.data.colleges);
      setAllUsers(users.data.data.users);
    } catch (err) {
      toast.error("Failed to fetch administrative data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchData();
  }, []);

  const handleApproveUser = async (id) => {
    try {
      await API.patch(`/auth/admin/approve-user/${id}`);
      toast.success("User approved successfully!");
      setUsers(users.filter((u) => u._id !== id));
      // Refresh all users to show updated status
      const res = await API.get("/auth/admin/all-users");
      setAllUsers(res.data.data.users);
    } catch (err) {
      toast.error("Failed to approve user");
    }
  };

  const handleRejectUser = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request? The account will be deleted.")) return;
    try {
      await API.delete(`/auth/admin/reject-user/${id}`);
      toast.success("Registration rejected and account removed.");
      setUsers(users.filter((u) => u._id !== id));
      setAllUsers(allUsers.filter((u) => u._id !== id));
    } catch (err) {
      toast.error("Failed to reject user");
    }
  };

  const handleApproveEvent = async (id) => {
    try {
      await API.patch(`/events/${id}/approve`);
      toast.success("Event approved successfully!");
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      toast.error("Failed to approve event");
    }
  };

  const handleRejectEvent = async (id) => {
    if (!window.confirm("Are you sure you want to reject this event? It will be deactivated.")) return;
    try {
      await API.delete(`/events/${id}`);
      toast.success("Event rejected and deactivated.");
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      toast.error("Failed to reject event");
    }
  };

  return (
    <DashboardLayout>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">System Control Panel</h1>
          <p className="text-gray-500 font-medium">Global platform management and oversight</p>
        </div>
        <div className="bg-gray-800 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg">
          SuperAdmin
        </div>
      </header>

      <div className="mb-8 flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "approvals" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Pending Approvals ({users.length + events.length})
        </button>
        <button
          onClick={() => setActiveTab("colleges")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "colleges" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Colleges ({allColleges.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "users" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-400 hover:text-gray-600"
            }`}
        >
          All Users ({allUsers.length})
        </button>
      </div>

      <div className="space-y-10">
        {activeTab === "approvals" && (
          <div className="space-y-10">
            {/* Pending College Admins */}
            <section className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <i className="fas fa-user-shield text-gray-700"></i>
                College Admin Requests
              </h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-500 text-center py-10 animate-pulse font-bold">Loading...</div>
                ) : users.length === 0 ? (
                  <div className="text-gray-400 text-center py-10 italic">No pending admin requests.</div>
                ) : (
                  users.map((u) => (
                    <div key={u._id} className="grid grid-cols-1 md:grid-cols-4 items-center p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-200 transition-all">
                      <div>
                        <span className="text-gray-900 font-bold block">{u.firstName} {u.lastName}</span>
                        <span className="text-gray-500 text-xs">{u.email}</span>
                        <span className="text-indigo-600 text-[10px] font-bold block mt-1">ID: {u.officialId}</span>
                      </div>
                      <div className="text-gray-700 font-medium text-center">{u.college?.name}</div>
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending</span>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleApproveUser(u._id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Approve</button>
                        <button onClick={() => handleRejectUser(u._id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Pending Events */}
            <section className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <i className="fas fa-calendar-check text-gray-700"></i>
                Event Approvals
              </h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-500 text-center py-10 animate-pulse font-bold">Loading...</div>
                ) : events.length === 0 ? (
                  <div className="text-gray-400 text-center py-10 italic">No pending events.</div>
                ) : (
                  events.map((e) => (
                    <div key={e._id} className="grid grid-cols-1 md:grid-cols-4 items-center p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-200 transition-all">
                      <div>
                        <span className="text-gray-900 font-bold block">{e.title}</span>
                        <span className="text-gray-500 text-xs">by {e.createdBy?.firstName}</span>
                      </div>
                      <div className="text-gray-700 font-medium text-center">{e.college?.name}</div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400">{new Date(e.startDate).toLocaleDateString()}</span>
                        <span className="px-3 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold uppercase mt-1">{e.category}</span>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleApproveEvent(e._id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Approve</button>
                        <button onClick={() => handleRejectEvent(e._id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "colleges" && (
          <section className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <i className="fas fa-university text-gray-700"></i>
              Partner Institutions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allColleges.map((c) => (
                <div key={c._id} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">{c.code}</div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{c.email}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.type}</span>
                    <button className="text-indigo-600 text-xs font-bold hover:underline">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <i className="fas fa-users text-gray-700"></i>
              Platform User Directory
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Role</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">College</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Identifier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allUsers.map((u) => (
                    <tr key={u._id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">{u.firstName} {u.lastName}</span>
                          <span className="text-gray-400 text-[10px]">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-gray-800 text-white' : (u.role === 'college_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-50 text-blue-600')
                          }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-center text-sm text-gray-600 font-medium">{u.college?.code || 'N/A'}</td>
                      <td className="py-4 text-center">
                        <span className={`w-2 h-2 rounded-full inline-block ${u.isApproved ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></span>
                        <span className="text-xs font-bold text-gray-700">{u.isApproved ? 'Approved' : 'Pending'}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">{u.officialId || 'N/A'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
