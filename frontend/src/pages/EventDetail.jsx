import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [myRegistrations, setMyRegistrations] = useState([]);
  const [eventFeedback, setEventFeedback] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [comments, setComments] = useState([]);

  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [commentText, setCommentText] = useState("");

  const isStudent = user?.role === "student";
  const isCollegeAdmin = user?.role === "college_admin";

  const loadEvent = async () => {
    const eventRes = await API.get(`/events/${id}`);
    setEvent(eventRes.data?.data?.event || null);
  };

  const loadRegistrationAndFeedback = async () => {
    const calls = [
      API.get(`/feedback/event/${id}`),
      API.get(`/comments/event/${id}`),
    ];

    if (isStudent) {
      calls.push(API.get("/registrations/my"));
      calls.push(API.get("/feedback/my"));
    }

    const results = await Promise.allSettled(calls);

    const eventFeedbackRes = results[0];
    const commentsRes = results[1];

    if (eventFeedbackRes.status === "fulfilled") {
      setEventFeedback(eventFeedbackRes.value.data?.data?.feedback || []);
    }
    if (commentsRes.status === "fulfilled") {
      setComments(commentsRes.value.data?.data?.comments || []);
    }

    if (isStudent) {
      const myRegRes = results[2];
      const myFeedbackRes = results[3];
      if (myRegRes?.status === "fulfilled") {
        setMyRegistrations(myRegRes.value.data?.data?.registrations || []);
      }
      if (myFeedbackRes?.status === "fulfilled") {
        setMyFeedback(myFeedbackRes.value.data?.data?.feedback || []);
      }
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      await loadEvent();
      await loadRegistrationAndFeedback();
    } catch (err) {
      toast.error("Unable to load event details.");
      navigate("/campus-feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [id, isStudent]);

  const myRegistration = useMemo(() => {
    if (!isStudent) return null;
    return myRegistrations.find((registration) => String(registration.event?._id) === String(id)) || null;
  }, [myRegistrations, id, isStudent]);

  const hasSubmittedFeedback = useMemo(() => {
    if (!isStudent) return false;
    return myFeedback.some((feedback) => String(feedback.eventId?._id || feedback.eventId) === String(id));
  }, [myFeedback, id, isStudent]);

  const canSubmitFeedback = useMemo(() => {
    if (!isStudent) return false;
    const now = new Date();
    const eventEnded = event?.endDate ? new Date(event.endDate) < now : false;
    return eventEnded && myRegistration?.status === "attended" && !hasSubmittedFeedback;
  }, [isStudent, event, myRegistration, hasSubmittedFeedback]);

  const eventFull = event?.maxParticipants && event.currentParticipants >= event.maxParticipants;

  const canRegister = useMemo(() => {
    if (!isStudent || !event) return false;
    const eventStarted = new Date(event.startDate) <= new Date();
    const eventCancelled = event.status === "cancelled" || event.isActive === false;
    const eventNotApproved = !event.isApproved;
    const alreadyRegistered = ["pending", "approved", "attended", "no-show", "waitlisted"].includes(myRegistration?.status);
    return !eventStarted && !eventCancelled && !eventNotApproved && !alreadyRegistered;
  }, [isStudent, event, myRegistration]);

  const canCancelRegistration = useMemo(() => {
    if (!isStudent || !myRegistration) return false;
    if (["rejected", "attended", "no-show"].includes(myRegistration.status)) return false;
    if (myRegistration.status === "approved" && new Date(event?.startDate) <= new Date()) return false;
    return true;
  }, [isStudent, myRegistration, event]);

  const canPostComment = isStudent && user?.isApproved;

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      await API.post(`/registrations/register/${id}`);
      toast.success("Registration submitted.");
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmWaitlist = async () => {
    if (!myRegistration?._id) return;
    try {
      setSubmitting(true);
      await API.patch(`/registrations/${myRegistration._id}/confirm-waitlist`);
      toast.success("Spot confirmed! You are now registered.");
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm spot.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!myRegistration?._id) return;
    const isWaitlist = myRegistration.status === "waitlisted";
    const confirmed = window.confirm(
      isWaitlist 
        ? "Are you sure you want to withdraw from the waitlist?" 
        : "Are you sure you want to cancel your registration? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await API.delete(`/registrations/${myRegistration._id}`);
      toast.success(isWaitlist ? "Withdrawn from waitlist." : "Registration cancelled.");
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await API.post("/feedback", {
        eventId: id,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
      });
      toast.success("Feedback submitted.");
      setFeedbackForm({ rating: 5, comment: "" });
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmitting(true);
      await API.post("/comments", { eventId: id, message: commentText.trim() });
      setCommentText("");
      await refresh();
      toast.success("Comment posted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
     }
   };

   const handleDeleteComment = async (commentId) => {
     try {
      setSubmitting(true);
       await API.delete(`/comments/${commentId}`);
       await refresh();
       toast.success("Comment deleted.");
     } catch (err) {
       toast.error(err.response?.data?.message || "Failed to delete comment.");
    } finally {
      setSubmitting(false);
     }
   };

   const canDeleteComment = (comment) => {
     if (!user) return false;
     if (String(comment.userId?._id || comment.userId) === String(user._id)) return true;
     if (isCollegeAdmin && String(event?.createdBy?._id || event?.createdBy) === String(user._id)) return true;
     return false;
   };

   if (loading) {
     return (
       <DashboardLayout>
         <div className="h-64 flex items-center justify-center text-slate-500 font-semibold">Loading event details...</div>
       </DashboardLayout>
     );
   }

   if (!event) return null;

   const spotsRemaining = event.maxParticipants
     ? Math.max(event.maxParticipants - (event.currentParticipants || 0), 0)
     : "Open";

   return (
     <DashboardLayout>
       <div className="max-w-6xl mx-auto space-y-8">
         <div className="flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">Back</button>
           <Link to="/campus-feed" className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors">Campus Feed</Link>
         </div>

         {/* Event Status Banners */}
         {event.status === "cancelled" && (
           <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-fade-in">
             <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
             </div>
             <div>
               <p className="text-sm font-black text-rose-900 uppercase tracking-tight">Event Cancelled</p>
               <p className="text-xs text-rose-700 font-medium">This event has been cancelled by the organizer and is no longer active.</p>
             </div>
           </div>
         )}

         {event.status === "paused" && (
           <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 animate-fade-in">
             <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
             <div>
               <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Updates Pending</p>
               <p className="text-xs text-amber-700 font-medium">{event.pauseReason || "This event is temporarily paused while administrative changes are being reviewed."}</p>
             </div>
           </div>
         )}

         {new Date(event.endDate) < new Date() && event.status !== "cancelled" && (
           <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 animate-fade-in">
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
             </div>
             <div>
               <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">Event Completed</p>
               <p className="text-xs text-indigo-700 font-medium">This event has concluded. Thank you to everyone who participated!</p>
             </div>
           </div>
         )}

         <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
             <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
               <img src={event.bannerImage || "/images/campus_life_professional.png"} alt={event.title} className="w-full h-80 object-cover" />
             </div>

             <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
               <div className="flex justify-between items-start">
                 <h1 className="text-3xl font-black text-slate-900 leading-tight">{event.title}</h1>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   event.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                   event.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                 }`}>
                   {event.status.replace('_', ' ')}
                 </span>
               </div>
               <p className="text-slate-600 leading-relaxed">{event.description}</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                 <div className="space-y-3">
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Category:</span> {event.category === "other" ? (event.customCategory || "other") : event.category}</p>
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">College:</span> {event.college?.name}</p>
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Location:</span> {event.location}</p>
                 </div>
                 <div className="space-y-3">
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Spots:</span> {spotsRemaining} / {event.maxParticipants || '∞'}</p>
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Start:</span> {new Date(event.startDate).toLocaleString()}</p>
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">End:</span> {new Date(event.endDate).toLocaleString()}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
               <h2 className="text-xl font-black text-slate-900">Discussion</h2>
               {canPostComment && (
                 <div className="flex gap-2">
                   <input
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     placeholder="Write a comment..."
                     className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                   />
                   <button onClick={handlePostComment} disabled={submitting} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50">Post</button>
                 </div>
               )}
               {!canPostComment && <p className="text-sm text-slate-500 italic">Only approved students can participate in discussions.</p>}

               <div className="space-y-4 mt-6">
                 {comments.length === 0 && (
                   <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                     <p className="text-sm text-slate-400">No conversations yet. Be the first to speak!</p>
                   </div>
                 )}
                 {comments.map((comment) => (
                   <div key={comment._id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all shadow-sm">
                     <div className="flex justify-between items-start gap-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                           {comment.userId?.firstName?.charAt(0)}{comment.userId?.lastName?.charAt(0)}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900">{comment.userId?.firstName} {comment.userId?.lastName}</p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{comment.userId?.college?.name || ""} • {new Date(comment.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                       {canDeleteComment(comment) && (
                         <button onClick={() => handleDeleteComment(comment._id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                         </button>
                       )}
                     </div>
                     <p className="mt-3 text-sm text-slate-600 leading-relaxed pl-11">{comment.message}</p>
                   </div>
                 ))}
               </div>
             </div>
           </div>

           <div className="space-y-6">
             <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
               <h2 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-2">Registration</h2>
               {isStudent && myRegistration && (
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Status</p>
                   <span className={`text-xs font-black uppercase tracking-widest ${
                     myRegistration.status === 'approved' ? 'text-emerald-600' : 
                     myRegistration.status === 'waitlisted' ? 'text-amber-600' : 'text-indigo-600'
                   }`}>{myRegistration.status}</span>
                 </div>
               )}
               
               {isStudent && canRegister && (
                 <button onClick={handleRegister} disabled={submitting} className={`w-full px-4 py-4 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:translate-y-[-2px] active:translate-y-0 transition-all ${
                   eventFull ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                 }`}>
                   {eventFull ? "Join Waitlist" : "Register Now"}
                 </button>
               )}

               {isStudent && canCancelRegistration && (
                 <button 
                   onClick={handleCancelRegistration} 
                   disabled={submitting} 
                   className={`w-full px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                     myRegistration?.status === "waitlisted" 
                       ? "border-slate-200 text-slate-500 hover:bg-slate-50" 
                       : "border-rose-200 text-rose-500 hover:bg-rose-50"
                   }`}
                 >
                   {myRegistration?.status === "waitlisted" ? "Withdraw from Waitlist" : "Cancel Registration"}
                 </button>
               )}

               {isStudent && myRegistration?.status === "waitlisted" && myRegistration?.confirmationDeadline && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 animate-pulse-subtle">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        A Spot is Available! 🎊
                      </p>
                      <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                        You've been promoted! Confirm your spot before: <br/>
                        <span className="font-bold text-emerald-900">{new Date(myRegistration.confirmationDeadline).toLocaleString()}</span>
                      </p>
                    </div>
                    {new Date(myRegistration.confirmationDeadline) > new Date() ? (
                      <button onClick={handleConfirmWaitlist} disabled={submitting} className="w-full px-4 py-4 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                        Confirm My Spot Now
                      </button>
                    ) : (
                      <p className="text-[10px] text-center font-black uppercase tracking-widest text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100">Waitlist offer expired.</p>
                    )}
                  </div>
                )}
               {!isStudent && <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">Registration is open for students. Please login to register.</p>}
             </div>

             <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
               <h2 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-2">Feedback</h2>
               {canSubmitFeedback ? (
                 <form onSubmit={handleSubmitFeedback} className="space-y-4">
                   <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Your Rating</label>
                     <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map((value) => (
                         <button
                           key={value}
                           type="button"
                           onClick={() => setFeedbackForm(f => ({ ...f, rating: value }))}
                           className={`w-10 h-10 rounded-xl border font-black transition-all ${
                             feedbackForm.rating === value 
                               ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                               : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400'
                           }`}
                         >
                           {value}
                         </button>
                       ))}
                     </div>
                   </div>
                   <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Comments</label>
                     <textarea
                       value={feedbackForm.comment}
                       onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                       rows={4}
                       className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                       placeholder="How was the event?"
                       required
                     />
                   </div>
                   <button type="submit" disabled={submitting} className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Submit Feedback</button>
                 </form>
               ) : (
                 <div className="text-center py-4">
                   <p className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-wide">
                     Feedback opens after the event ends for participants.
                   </p>
                 </div>
               )}

               <div className="space-y-3 mt-4">
                 {eventFeedback.length === 0 && eventFeedback.length > 0 && <p className="text-sm text-slate-500">No testimonials yet.</p>}
                 {eventFeedback.map((feedback) => (
                   <div key={feedback._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                     <div className="flex justify-between items-center mb-2">
                       <p className="text-xs font-bold text-slate-900">{feedback.userId?.firstName} {feedback.userId?.lastName}</p>
                       <div className="flex gap-0.5">
                         {[...Array(feedback.rating)].map((_, i) => (
                           <span key={i} className="text-amber-400 text-xs">★</span>
                         ))}
                       </div>
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed italic">"{feedback.comment}"</p>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </section>
       </div>
     </DashboardLayout>
   );
 };

 export default EventDetail;
