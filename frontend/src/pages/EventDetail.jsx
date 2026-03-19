import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { fetchEventById } from "../services/eventService";
import {
  cancelRegistration as cancelRegistrationRequest,
  fetchMyRegistrations,
  registerForEvent,
} from "../services/registrationService";

const EventDetailSkeleton = () => (
  <DashboardLayout>
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-64 md:h-80 rounded-3xl bg-slate-200 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
          <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-48 bg-slate-100 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  </DashboardLayout>
);

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
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [officialReplyText, setOfficialReplyText] = useState("");

   const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [commentText, setCommentText] = useState("");
  const [collapsedReplies, setCollapsedReplies] = useState({});

  const toggleReplies = (commentId) => {
    setCollapsedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const isStudent = user?.role === "student";
  const isCollegeAdmin = user?.role === "college_admin";

  const loadEvent = async () => {
    const eventRes = await fetchEventById(id);
    setEvent(eventRes.data?.data?.event || null);
  };

  const loadRegistrationAndFeedback = async () => {
    const calls = [API.get(`/feedback/event/${id}`), API.get(`/comments/event/${id}`)];

    if (isStudent) {
      calls.push(fetchMyRegistrations());
      calls.push(API.get("/feedback/my"));
    }

    const results = await Promise.allSettled(calls);

    const eventFeedbackRes = results[0];
    const commentsRes = results[1];

    if (eventFeedbackRes.status === "fulfilled") {
      setEventFeedback(eventFeedbackRes.value.data?.data?.feedback || []);
    }
    if (commentsRes.status === "fulfilled") {
      const threaded = commentsRes.value.data?.data?.threadedComments;
      const flat = commentsRes.value.data?.data?.comments || [];
      setComments(Array.isArray(threaded) ? threaded : flat);
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
      toast.error("We couldn't open this event right now.");
      navigate("/campus-feed");
    } finally {
      setLoading(false);
    }
  };

  const refreshCommentsOnly = async () => {
    try {
      setCommentsLoading(true);
      const commentsRes = await API.get(`/comments/event/${id}`);
      const threaded = commentsRes.data?.data?.threadedComments;
      const flat = commentsRes.data?.data?.comments || [];
      setComments(Array.isArray(threaded) ? threaded : flat);
    } catch (err) {
      toast.error("We couldn't refresh the conversation just yet.");
    } finally {
      setCommentsLoading(false);
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
    const alreadyRegistered = ["approved", "attended", "no_show", "waitlisted"].includes(myRegistration?.status);
    return !eventStarted && !eventCancelled && !eventNotApproved && !alreadyRegistered;
  }, [isStudent, event, myRegistration]);

  const canCancelRegistration = useMemo(() => {
    if (!isStudent || !myRegistration) return false;
    if (["rejected", "attended", "no_show"].includes(myRegistration.status)) return false;
    if (myRegistration.status === "approved") {
      const cutoff = new Date(new Date(event?.startDate).getTime() - 24 * 60 * 60 * 1000);
      if (new Date() > cutoff) return false;
    }
    return true;
  }, [isStudent, myRegistration, event]);

  const canPostComment = isStudent && user?.isApproved;
  const canManagePinnedComments = (isCollegeAdmin && String(event?.createdBy?._id || event?.createdBy) === String(user?._id)) || user?.role === "admin";
  const canOfficialReply = canManagePinnedComments;

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      await registerForEvent(id);
      toast.success(eventFull ? "You're on the waitlist now." : "Your spot is confirmed.");
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't save your registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!myRegistration?._id) return;
    const isWaitlist = myRegistration.status === "waitlisted";
    const confirmed = window.confirm(
      isWaitlist
        ? "Leave the waitlist for this event?"
        : "Cancel your registration for this event?"
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await cancelRegistrationRequest(myRegistration._id);
      toast.success(isWaitlist ? "You've left the waitlist." : "Your registration has been cancelled.");
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't update your registration.");
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
      toast.success("Thanks for sharing your feedback.");
      setFeedbackForm({ rating: 5, comment: "" });
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't send your feedback.");
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
      await refreshCommentsOnly();
      toast.success("Your comment is live.");
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't post your comment.");
    } finally {
      setSubmitting(false);
     }
   };

    const handleReply = async (parentCommentId) => {
      if (!replyText.trim()) return;
      try {
        setSubmitting(true);
        await API.post("/comments", {
          eventId: id,
          message: replyText.trim(),
          parentCommentId,
        });
        setReplyText("");
        setReplyingTo(null);
        await refreshCommentsOnly();
        toast.success("Your reply is live.");
      } catch (err) {
        toast.error(err.response?.data?.message || "We couldn't post your reply.");
      } finally {
        setSubmitting(false);
      }
    };

    const handleOfficialReply = async (parentCommentId) => {
      if (!officialReplyText.trim()) return;
      try {
        setSubmitting(true);
        await API.post(`/comments/${parentCommentId}/official-reply`, {
          message: officialReplyText.trim(),
        });
        setOfficialReplyText("");
        setReplyingTo(null);
        await refreshCommentsOnly();
        toast.success("The official reply is live.");
      } catch (err) {
        toast.error(err.response?.data?.message || "We couldn't post the official reply.");
      } finally {
        setSubmitting(false);
      }
    };

    const handleToggleLike = async (commentId) => {
      try {
        await API.patch(`/comments/${commentId}/like`);
        await refreshCommentsOnly();
      } catch (err) {
        toast.error(err.response?.data?.message || "We couldn't update your reaction.");
      }
    };

    const handleTogglePin = async (commentId) => {
      try {
        await API.patch(`/comments/${commentId}/pin`);
        await refreshCommentsOnly();
      } catch (err) {
        toast.error(err.response?.data?.message || "We couldn't update that comment.");
      }
    };

   const handleDeleteComment = async (commentId) => {
     try {
      setSubmitting(true);
       await API.delete(`/comments/${commentId}`);
       await refresh();
       toast.success("The comment has been removed.");
     } catch (err) {
       toast.error(err.response?.data?.message || "We couldn't remove that comment.");
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

   const isLikedByMe = (comment) => {
     const likedBy = comment?.likedBy || [];
     return likedBy.some((likedUserId) => String(likedUserId?._id || likedUserId) === String(user?._id));
   };

   if (loading) {
     return <EventDetailSkeleton />;
   }

   if (!event) return null;

   const spotsRemaining = event.maxParticipants
     ? Math.max(event.maxParticipants - (event.currentParticipants || 0), 0)
     : "Open";

   return (
     <DashboardLayout>
       <div className="max-w-6xl mx-auto space-y-7">
         <div className="flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="text-xs font-semibold tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">Go back</button>
           <Link to="/campus-feed" className="text-xs font-semibold tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors">Browse events</Link>
         </div>

         {/* Event Status Banners */}
         {event.status === "cancelled" && (
           <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-fade-in">
             <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
             </div>
             <div>
                <p className="text-sm font-black text-rose-900 uppercase tracking-tight">Event cancelled</p>
                <p className="text-xs text-rose-700 font-medium">The organizer has cancelled this event, so registrations and updates are closed.</p>
             </div>
           </div>
         )}

         {event.status === "paused" && (
           <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 animate-fade-in">
             <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
             <div>
                <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Updates under review</p>
                <p className="text-xs text-amber-700 font-medium">{event.pauseReason || "This event is temporarily paused while updates are being reviewed."}</p>
             </div>
           </div>
         )}

         {new Date(event.endDate) < new Date() && event.status !== "cancelled" && (
           <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 animate-fade-in">
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
             </div>
             <div>
                <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">Event complete</p>
                <p className="text-xs text-indigo-700 font-medium">This event has wrapped up. Thanks for being part of it.</p>
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
                 <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{event.title}</h1>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest ${
                   event.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                   event.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                 }`}>
                    {event.status === "pending_approval" ? "under review" : event.status.replace('_', ' ')}
                 </span>
               </div>
               <p className="text-slate-600 leading-relaxed">{event.description}</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                 <div className="space-y-3">
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Category:</span> {event.category === "other" ? (event.customCategory || "Other") : event.category}</p>
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Hosted by:</span> {event.college?.name}</p>
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Location:</span> {event.location}</p>
                 </div>
                 <div className="space-y-3">
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Seats left:</span> {spotsRemaining} / {event.maxParticipants || 'Unlimited'}</p>
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">Start:</span> {new Date(event.startDate).toLocaleString()}</p>
                   <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span><span className="font-bold text-slate-800">End:</span> {new Date(event.endDate).toLocaleString()}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
               <h2 className="text-xl font-extrabold text-slate-900">Conversation</h2>
               {canPostComment && (
                 <div className="flex gap-2">
                   <input
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     placeholder="Add a thought or question"
                     className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                   />
                   <button onClick={handlePostComment} disabled={submitting} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50">Share comment</button>
                 </div>
               )}
               {!canPostComment && <p className="text-sm text-slate-500 italic">Approved students can join the conversation once their access is confirmed.</p>}

               <div className="space-y-4 mt-6">
                 {commentsLoading && (
                   <div className="space-y-3 animate-pulse">
                     {[1,2,3].map(i => (
                       <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white">
                         <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 rounded-full bg-slate-200" />
                           <div className="space-y-1.5">
                             <div className="h-3 bg-slate-200 rounded w-28" />
                             <div className="h-2 bg-slate-100 rounded w-20" />
                           </div>
                         </div>
                         <div className="h-3 bg-slate-100 rounded w-full ml-11" />
                       </div>
                     ))}
                   </div>
                 )}

                 {!commentsLoading && comments.length === 0 && (
                   <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-sm text-slate-400">The conversation has not started yet. You can be the first to add something useful.</p>
                   </div>
                 )}

                 {!commentsLoading && comments.map((comment) => (
                   <div key={comment._id} className={`p-4 rounded-xl border bg-white hover:border-slate-200 transition-all shadow-sm ${comment.isPinned ? "border-amber-200" : "border-slate-100"}`}>
                     <div className="flex justify-between items-start gap-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                           {comment.userId?.firstName?.charAt(0)}{comment.userId?.lastName?.charAt(0)}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                             {comment.userId?.firstName} {comment.userId?.lastName}
                             {comment.isPinned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-widest">Highlighted</span>}
                             {comment.isOfficialReply && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-widest">Official</span>}
                           </p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{comment.userId?.college?.name || ""} | {new Date(comment.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         {canManagePinnedComments && (
                           <button onClick={() => handleTogglePin(comment._id)} className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700">
                              {comment.isPinned ? "Remove highlight" : "Highlight"}
                           </button>
                         )}
                         {canDeleteComment(comment) && (
                           <button onClick={() => handleDeleteComment(comment._id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                           </button>
                         )}
                       </div>
                     </div>
                     <p className="mt-3 text-sm text-slate-600 leading-relaxed pl-11">{comment.message}</p>

                     <div className="pl-11 mt-3 flex items-center gap-4">
                       <button onClick={() => handleToggleLike(comment._id)} className={`text-xs font-semibold ${isLikedByMe(comment) ? "text-indigo-700" : "text-slate-500"}`}>
                         {isLikedByMe(comment) ? "You liked this" : "Like"} ({comment.likesCount || comment.likedBy?.length || 0})
                       </button>
                       {canPostComment && (
                         <button onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
                           Write reply
                         </button>
                       )}
                       {canOfficialReply && (
                         <button onClick={() => setReplyingTo(replyingTo === `official-${comment._id}` ? null : `official-${comment._id}`)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                           Post official reply
                         </button>
                       )}
                     </div>

                     {replyingTo === comment._id && (
                       <div className="pl-11 mt-3 flex gap-2">
                         <input
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a thoughtful reply"
                           className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                         />
                         <button onClick={() => handleReply(comment._id)} disabled={submitting} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold">Share reply</button>
                       </div>
                     )}

                     {replyingTo === `official-${comment._id}` && (
                       <div className="pl-11 mt-3 flex gap-2">
                         <input
                           value={officialReplyText}
                           onChange={(e) => setOfficialReplyText(e.target.value)}
                            placeholder="Write an official response"
                           className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 text-xs"
                         />
                         <button onClick={() => handleOfficialReply(comment._id)} disabled={submitting} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold">Publish reply</button>
                       </div>
                     )}

                     {(comment.replies || []).length > 0 && (
                       <div className="pl-11 mt-4 space-y-2">
                         <button
                           onClick={() => toggleReplies(comment._id)}
                           className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 flex items-center gap-1"
                         >
                           {collapsedReplies[comment._id] ? "▶" : "▼"}{" "}
                            {collapsedReplies[comment._id] ? "Show" : "Hide"} {(comment.replies || []).length} {(comment.replies || []).length === 1 ? "reply" : "replies"}
                         </button>
                         {!collapsedReplies[comment._id] && (comment.replies || []).map((reply) => (
                           <div key={reply._id} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                             <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                               {reply.userId?.firstName} {reply.userId?.lastName}
                               {reply.isOfficialReply && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-widest">Official</span>}
                             </p>
                             <p className="text-xs text-slate-600 mt-1">{reply.message}</p>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           </div>

           <div className="space-y-6">
             <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
               <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Registration</h2>
               {isStudent && myRegistration && (
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your status</p>
                   <span className={`text-xs font-semibold tracking-widest ${
                     myRegistration.status === 'approved' ? 'text-emerald-600' : 
                     myRegistration.status === 'waitlisted' ? 'text-amber-600' : 'text-indigo-600'
                   }`}>{myRegistration.status === "approved" ? "Confirmed" : myRegistration.status === "waitlisted" ? "Waitlisted" : myRegistration.status === "no_show" ? "Missed" : myRegistration.status}</span>
                 </div>
               )}

               {isStudent && myRegistration?.status === "approved" && canCancelRegistration && (
                 <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                   You can leave this event until 24 hours before it begins.
                 </p>
               )}
               
               {isStudent && canRegister && (
                 <button onClick={handleRegister} disabled={submitting} className={`w-full px-4 py-4 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:translate-y-[-2px] active:translate-y-0 transition-all ${
                   eventFull ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                 }`}>
                    {eventFull ? "Join the waitlist" : "Reserve your spot"}
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
                    {myRegistration?.status === "waitlisted" ? "Leave the waitlist" : "Cancel registration"}
                 </button>
               )}

               {isStudent && myRegistration?.status === "waitlisted" && (
                 <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    You're on the waitlist. If a seat opens, you'll be moved in automatically and updated here.
                 </p>
               )}
               {!isStudent && <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">Students can register for this event after signing in.</p>}
             </div>

             <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
               <h2 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-2">Feedback</h2>
               {canSubmitFeedback ? (
                 <form onSubmit={handleSubmitFeedback} className="space-y-4">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Your rating</label>
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
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Your feedback</label>
                     <textarea
                       value={feedbackForm.comment}
                       onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                       rows={4}
                       className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                        placeholder="What stood out, and what could have been better?"
                       required
                     />
                   </div>
                    <button type="submit" disabled={submitting} className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Share feedback</button>
                 </form>
               ) : (
                 <div className="text-center py-4">
                   <p className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-wide">
                      Feedback opens after the event ends for students who attended.
                   </p>
                 </div>
               )}

               <div className="space-y-3 mt-4">
                  {eventFeedback.length === 0 && <p className="text-sm text-slate-500">Feedback from attendees will appear here after the event.</p>}
                 {eventFeedback.map((feedback) => (
                   <div key={feedback._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                     <div className="flex justify-between items-center mb-2">
                       <p className="text-xs font-bold text-slate-900">{feedback.userId?.firstName} {feedback.userId?.lastName}</p>
                       <div className="flex gap-0.5">
                         {[...Array(feedback.rating)].map((_, i) => (
                           <span key={i} className="text-amber-400 text-xs">*</span>
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
