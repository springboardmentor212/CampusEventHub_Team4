import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import { ArrowLeft, FileDown } from "lucide-react";
import { fetchEventById } from "../services/eventService";
import {
    approveRegistration,
    exportEventRegistrations,
    fetchEventRegistrations,
    markRegistrationAttendance,
    rejectRegistration,
} from "../services/registrationService";

const EventRegistrations = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [registrations, setRegistrations] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const [regRes, eventRes] = await Promise.all([
                fetchEventRegistrations(id),
                fetchEventById(id),
            ]);
            setRegistrations(regRes.data?.data?.registrations || []);
            setEvent(eventRes.data?.data?.event || null);
        } catch (err) {
            setError("Failed to load registration data.");
            toast.error("Failed to load registration data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleUpdateStatus = async (regId, status) => {
        try {
            const endpoint = status === "approved"
                ? approveRegistration(regId)
                : rejectRegistration(regId);
            await endpoint;
            toast.success(`Registration ${status}.`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status.");
        }
    };

    const handleMarkAttendance = async (regId, status) => {
        try {
            await markRegistrationAttendance(regId, { status });
            toast.success(`Attendance set to ${status}.`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to mark attendance.");
        }
    };

    const handleExport = async () => {
        try {
            const res = await exportEventRegistrations(id);
            const rows = res.data?.data?.registrations || [];
            if (!rows.length) {
                toast.error("No registrations to export.");
                return;
            }

            const header = [
                "First Name",
                "Last Name",
                "Email",
                "Phone",
                "Official ID",
                "College",
                "Status",
                "Registration Date",
            ];
            const csvRows = [
                header.join(","),
                ...rows.map((row) => ([
                    row.firstName,
                    row.lastName,
                    row.email,
                    row.phone,
                    row.officialId,
                    row.college,
                    row.status,
                    new Date(row.registrationDate).toISOString(),
                ].map((item) => `"${String(item || "").replaceAll('"', '""')}"`).join(","))),
            ];

            const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `registrations-${(event?.title || "event").toLowerCase().replace(/\s+/g, "-")}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Export complete.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Export failed.");
        }
    };

    const filteredRegs = registrations.filter((registration) => {
        const fullName = `${registration.user?.firstName || ""} ${registration.user?.lastName || ""}`.toLowerCase();
        const email = (registration.user?.email || "").toLowerCase();
        const officialId = (registration.user?.officialId || "").toLowerCase();
        const query = searchTerm.toLowerCase();
        const matchesSearch = fullName.includes(query) || email.includes(query) || officialId.includes(query);
        const matchesFilter = filterStatus === "all" || registration.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-xs font-bold uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <header className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">{event?.title || "Event Registrations"}</h1>
                        <p className="text-slate-500 text-sm">Approve/reject registrations and track attendance for this event.</p>
                    </div>
                    <button onClick={handleExport} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
                        <FileDown className="w-4 h-4" />
                        Export
                    </button>
                </header>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, official ID"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-widest"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="attended">Attended</option>
                        <option value="no_show">No-Show</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                    </select>
                </div>

                {loading && (
                    <div className="h-60 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-500">
                        Loading registrations...
                    </div>
                )}

                {!loading && error && (
                    <div className="h-60 flex items-center justify-center bg-white border border-rose-200 rounded-2xl text-sm font-semibold text-rose-600">
                        {error}
                    </div>
                )}

                {!loading && !error && filteredRegs.length === 0 && (
                    <div className="h-60 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-500">
                        No registrations found.
                    </div>
                )}

                {!loading && !error && filteredRegs.length > 0 && (
                    <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">College</th>
                                    <th className="px-4 py-3">Registered On</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Attendance</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRegs.map((registration) => {
                                    const attendance = registration.status === "attended"
                                        ? "Attended"
                                        : registration.status === "no_show"
                                            ? "No-Show"
                                            : "Not Marked";

                                    return (
                                        <tr key={registration._id}>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">{registration.user?.firstName} {registration.user?.lastName}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{registration.user?.email || "-"}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{registration.college?.name || registration.user?.college?.name || "-"}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{registration.registrationDate ? new Date(registration.registrationDate).toLocaleString() : "-"}</td>
                                            <td className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700">{registration.status}</td>
                                            <td className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700">{attendance}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {registration.status === "pending" && (
                                                        <>
                                                            <button onClick={() => handleUpdateStatus(registration._id, "approved")} className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-emerald-600 text-white">Approve</button>
                                                            <button onClick={() => handleUpdateStatus(registration._id, "rejected")} className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-rose-600 text-white">Reject</button>
                                                        </>
                                                    )}
                                                    {(registration.status === "approved" || registration.status === "attended" || registration.status === "no_show") && (
                                                        <>
                                                            <button onClick={() => handleMarkAttendance(registration._id, "attended")} className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-indigo-600 text-white">Mark Attendance</button>
                                                            <button onClick={() => handleMarkAttendance(registration._id, "no_show")} className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-slate-700 text-white">No-Show</button>
                                                            <button onClick={() => handleMarkAttendance(registration._id, "approved")} className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border border-slate-300 text-slate-700">Undo</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EventRegistrations;
