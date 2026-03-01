import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingAdmins = async () => {
    try {
      const res = await API.get("/auth/admin/pending-users");
      setUsers(res.data.data.users);
    } catch (err) {
      toast.error("Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const handleApprove = async (id) => {
    try {
      await API.patch(`/auth/admin/approve-user/${id}`);
      toast.success("User approved successfully!");
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Failed to approve user");
    }
  };

  return (
    <DashboardLayout>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">System Control Panel</h1>
          <p className="text-gray-500 font-medium">Manage campus administrators and platform status</p>
        </div>
        <div className="bg-gray-800 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg">
          SuperAdmin
        </div>
      </header>

      <div className="space-y-10">
        <section className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <i className="fas fa-user-shield text-gray-700"></i>
            Pending College Admin Approvals
          </h2>

          <div className="space-y-4">
            {loading ? (
              <div className="text-gray-500 text-center py-10 animate-pulse font-bold">Fetching pending requests...</div>
            ) : users.length === 0 ? (
              <div className="text-gray-400 text-center py-10 italic">No pending approval requests.</div>
            ) : users.map((u) => (
              <div key={u._id} className="grid grid-cols-1 md:grid-cols-4 items-center p-6 bg-gray-50 rounded-2xl border border-gray-200 group hover:border-gray-300 transition-all">
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-lg">{u.firstName} {u.lastName}</span>
                  <span className="text-gray-500 text-sm">{u.email}</span>
                </div>
                <div className="text-gray-700 font-medium text-center">
                  {u.college?.name || "N/A"}
                </div>
                <div className="flex justify-center">
                  <span className="px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest border border-amber-200">
                    Pending
                  </span>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleApprove(u._id)}
                    className="metallic-btn px-6 py-2 text-sm shadow-md"
                  >
                    Approve
                  </button>
                  <button className="px-6 py-2 rounded-full bg-red-100 text-red-600 font-bold text-sm uppercase tracking-widest hover:bg-red-200 transition-all">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="card-gradient p-8 text-center flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">12</div>
            <div className="text-gray-700 font-bold uppercase tracking-widest text-xs">Total Colleges</div>
          </article>
          <article className="card-gradient p-8 text-center flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">145</div>
            <div className="text-gray-700 font-bold uppercase tracking-widest text-xs">Active Students</div>
          </article>
          <article className="card-gradient p-8 text-center flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">8</div>
            <div className="text-gray-700 font-bold uppercase tracking-widest text-xs">Active Events</div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
