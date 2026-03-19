import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { 
    Users, 
    CheckCircle, 
    XCircle, 
    Search, 
    Clock, 
    Mail, 
    Hash,
    Filter,
    AlertTriangle,
    X,
    Loader2
} from "lucide-react";

const StudentApprovals = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Rejection Modal State
    const [rejectionModal, setRejectionModal] = useState({ show: false, id: null });
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionLoading, setRejectionLoading] = useState(false);

    useEffect(() => {
        fetchPendingStudents();
    }, []);

    const fetchPendingStudents = async () => {
        try {
            setLoading(true);
            const res = await API.get("/auth/college/pending-students");
            setStudents(res.data.data.users);
        } catch (err) {
            toast.error("Failed to load pending applications.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await API.patch(`/auth/admin/approve-user/${id}`);
            toast.success("Student application approved.");
            setStudents(students.filter(s => s._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || "Approval failed.");
        }
    };

    const submitRejection = async () => {
        if (rejectionReason.length < 10) {
            toast.error("Please provide a reason (min 10 characters)");
            return;
        }

        setRejectionLoading(true);
        try {
            await API.delete(`/auth/admin/reject-user/${rejectionModal.id}`, { 
                data: { reason: rejectionReason } 
            });
            toast.success("Student application rejected.");
            setStudents(students.filter(s => s._id !== rejectionModal.id));
            setRejectionModal({ show: false, id: null });
            setRejectionReason("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Rejection failed.");
        } finally {
            setRejectionLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        (s.firstName + " " + s.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.officialId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-[2px] w-8 bg-indigo-600 rounded-full"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Administrative Gate</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Student Approvals</h1>
                        <p className="text-slate-500 font-medium lowercase">Verify and authorize student accounts for your institution.</p>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find by name, email or student ID..."
                            className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest lowercase">Screening database...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900 italic">No pending applications</h3>
                        <p className="text-slate-500 mt-2 font-medium">All student requests for your institution have been processed.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredStudents.map((student) => (
                            <div key={student._id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white">
                                        <span className="text-xl font-black">{student.firstName?.[0]}{student.lastName?.[0]}</span>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h3 className="text-lg font-black text-slate-900 truncate">
                                                {student.firstName} {student.lastName}
                                            </h3>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                {student.academicClass || 'Student'}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 truncate">{student.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                    <Hash className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{student.officialId || 'No ID'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto pt-6 lg:pt-0 lg:pl-6 lg:border-l lg:border-slate-50">
                                        <button
                                            onClick={() => handleApprove(student._id)}
                                            className="flex-1 lg:w-32 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setRejectionModal({ show: true, id: student._id })}
                                            className="flex-1 lg:w-32 py-3 bg-white border border-rose-100 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Rejection Modal */}
                {rejectionModal.show && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
                            <div className="px-8 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-slate-900 italic tracking-tight">Reject Student</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provide rejection reason.</p>
                                    </div>
                                </div>
                                <button onClick={() => setRejectionModal({ show: false, id: null })} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comments</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Min 10 characters explaining why..."
                                        className="w-full h-40 bg-slate-50 border-none rounded-[1.5rem] p-6 text-sm font-medium focus:ring-2 focus:ring-rose-100 placeholder:text-slate-300 transition-all resize-none"
                                    />
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                   <button
                                        onClick={submitRejection}
                                        disabled={rejectionLoading}
                                        className="w-full sm:flex-1 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-100 flex items-center justify-center gap-2"
                                   >
                                        {rejectionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                        Confirm Rejection
                                   </button>
                                   <button
                                        onClick={() => setRejectionModal({ show: false, id: null })}
                                        className="w-full sm:w-auto px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest"
                                   >
                                        Cancel
                                   </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentApprovals;
