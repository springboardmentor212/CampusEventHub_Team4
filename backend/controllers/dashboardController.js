import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { College } from "../models/College.js";
import { Registration } from "../models/Registration.js";
import { AdminLog } from "../models/AdminLog.js";
import { Notification } from "../models/Notification.js";
import { Feedback } from "../models/Feedback.js";
import catchAsync from "../utils/catchAsync.js";



// Super Admin Dashboard - Full platform overview
export const getSuperAdminStats = catchAsync(async (req, res) => {
    const now = new Date();

    const [
        totalColleges,
        totalEvents,
        totalStudents,
        totalCollegeAdmins,
        pendingAdmins,
        pendingStudents,
        pendingEvents,
        totalRegistrations,
        approvedRegistrations,
        pendingRegistrations,
        recentLogs,
        allEvents,
        registrationsThisMonth,
    ] = await Promise.all([
        College.countDocuments({}),
        Event.countDocuments({ isActive: true }),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "college_admin" }),
        User.countDocuments({ role: "college_admin", accountStatus: "pending_approval", isVerified: true, isApproved: false }),
        User.countDocuments({ role: "student", accountStatus: "pending_approval", isVerified: true, isApproved: false }),
        Event.countDocuments({ isApproved: false, isActive: true }),
        Registration.countDocuments({}),
        Registration.countDocuments({ status: "approved" }),
        Registration.countDocuments({ status: "pending" }),
        null, // recentLogs removed in favor of notifications
        Event.find({ isActive: true }).select("title startDate endDate currentParticipants maxParticipants registrationDeadline isApproved college category")
            .populate("college", "name code").sort({ startDate: 1 }).limit(20),
        Registration.countDocuments({
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }),
    ]);

    // Derive deadline alerts: events with deadline in next 48 hours
    const deadlineAlerts = allEvents.filter(e =>
        e.registrationDeadline &&
        new Date(e.registrationDeadline) > now &&
        (new Date(e.registrationDeadline) - now) < 48 * 60 * 60 * 1000
    );

    // Capacity alerts: events > 80% full
    const capacityAlerts = allEvents.filter(e =>
        e.maxParticipants && e.currentParticipants >= e.maxParticipants * 0.8
    );

    // Ongoing events
    const ongoingEvents = allEvents.filter(e =>
        new Date(e.startDate) <= now && new Date(e.endDate) >= now
    ).length;

    // Map activities for frontend
    const allowedTypes = [
        "EVENT_CREATE", "EVENT_APPROVE", "EVENT_REJECT",
        "EVENT_UPDATE", "ADMIN_APPROVE", "ADMIN_REJECT",
        "STUDENT_APPROVE", "STUDENT_REJECT",
        "COLLEGE_CREATE", "REGISTRATION_APPROVE",
        "REGISTRATION_REJECT", "USER_SIGNUP"
    ];

    const notifications = await Notification.find({
        $or: [
            { type: { $in: allowedTypes } },
            { recipient: req.userId }
        ],
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
        .sort({ createdAt: -1 })
        .limit(10);

    const messageMap = {
        EVENT_CREATE: "New event submitted for review",
        EVENT_APPROVE: "An event was approved and is now live",
        EVENT_REJECT: "An event was rejected",
        EVENT_UPDATE: "An event update is pending review",
        ADMIN_APPROVE: "A college admin was approved",
        ADMIN_REJECT: "A college admin application was rejected",
        STUDENT_APPROVE: "A student account was approved",
        STUDENT_REJECT: "A student application was rejected",
        COLLEGE_CREATE: "A new college was added",
        REGISTRATION_APPROVE: "A student registration was approved",
        REGISTRATION_REJECT: "A student registration was rejected",
        USER_SIGNUP: "A new user is awaiting approval",
    };

    const mappedActivity = notifications.map(n => {
        const type = n.type;
        let displayMessage = messageMap[type] || n.message || "Platform activity";

        let icon = "*";
        if (type.includes("APPROVE")) icon = "OK";
        else if (type.includes("REJECT")) icon = "X";
        else if (type.includes("CREATE")) icon = "+";
        else if (type.includes("UPDATE")) icon = "~";
        else if (type.includes("COLLEGE")) icon = "C";
        else if (type.includes("SIGNUP")) icon = "U";

        return {
            _id: n._id,
            type: n.type,
            displayMessage,
            icon,
            createdAt: n.createdAt
        };
    });

    res.status(200).json({
        success: true,
        data: {
            totalColleges,
            totalEvents,
            totalStudents,
            totalCollegeAdmins,
            pendingAdmins,
            pendingStudents,
            pendingEvents,
            totalRegistrations,
            approvedRegistrations,
            pendingRegistrations,
            ongoingEvents,
            deadlineAlerts,
            capacityAlerts,
            recentActivity: mappedActivity,
            registrationsThisMonth,
        }
    });
});

// College Admin Dashboard - College-specific overview
export const getCollegeAdminStats = catchAsync(async (req, res) => {
    const collegeId = req.user.college;
    const now = new Date();

    const [totalEvents, events, totalRegistrations, pendingRegistrations, approvedRegistrations, pendingStudents, notifications] = await Promise.all([
        Event.countDocuments({ college: collegeId, isActive: true }),
        Event.find({ college: collegeId, isActive: true })
            .select("title startDate endDate currentParticipants maxParticipants registrationDeadline isApproved category status")
            .sort({ startDate: -1 }),
        Registration.countDocuments({ college: collegeId }),
        Registration.countDocuments({ college: collegeId, status: "pending" }),
        Registration.countDocuments({ college: collegeId, status: "approved" }),
        User.countDocuments({ role: "student", college: collegeId, accountStatus: "pending_approval", isVerified: true }),
        Notification.find({ recipient: req.userId, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).sort({ createdAt: -1 }).limit(10)
    ]);

    const upcomingEvents = events.filter(e => new Date(e.startDate) > now);
    const ongoingEvents = events.filter(e => new Date(e.startDate) <= now && new Date(e.endDate) >= now);
    const pastEvents = events.filter(e => new Date(e.endDate) < now);
    const pendingApproval = events.filter(e => !e.isApproved);
    const totalParticipants = events.reduce((s, e) => s + (e.currentParticipants || 0), 0);
    const eventsWithCapacity = events.filter(e => typeof e.maxParticipants === "number" && e.maxParticipants > 0);
    const totalConfiguredCapacity = eventsWithCapacity.reduce((s, e) => s + (e.maxParticipants || 0), 0);
    const averageCapacityPercent = totalConfiguredCapacity > 0
        ? Math.round((totalParticipants / totalConfiguredCapacity) * 100)
        : 0;

    // Deadline alerts for their own events
    const deadlineAlerts = events.filter(e =>
        e.registrationDeadline &&
        new Date(e.registrationDeadline) > now &&
        (new Date(e.registrationDeadline) - now) < 48 * 60 * 60 * 1000
    );

    // Capacity alerts
    const capacityAlerts = events.filter(e =>
        e.maxParticipants && e.currentParticipants >= e.maxParticipants * 0.8
    );

    // Activity Mapper
    const messageMap = {
        EVENT_APPROVE: "Your event was approved and is now live",
        EVENT_REJECT: "Your event application was rejected",
        EVENT_UPDATE: "Your event update is pending review",
        USER_SIGNUP: "A new student registered for your college",
        REGISTRATION_APPROVE: "A registration was approved",
        REGISTRATION_REJECT: "A registration was rejected",
        STUDENT_APPROVE: "You approved a student account",
        STUDENT_REJECT: "You rejected a student account"
    };

    const mappedActivity = notifications.map(n => {
        const type = n.type;
        let displayMessage = messageMap[type] || n.message || "Activity recorded";

        let icon = "*";
        if (type.includes("APPROVE")) icon = "OK";
        else if (type.includes("REJECT")) icon = "X";
        else if (type.includes("CREATE")) icon = "+";
        else if (type.includes("UPDATE")) icon = "~";
        else if (type.includes("SIGNUP")) icon = "U";

        return {
            _id: n._id,
            type: n.type,
            displayMessage,
            icon,
            createdAt: n.createdAt
        };
    });

    res.status(200).json({
        success: true,
        data: {
            totalEvents,
            upcomingCount: upcomingEvents.length,
            ongoingCount: ongoingEvents.length,
            pastCount: pastEvents.length,
            pendingApprovalCount: pendingApproval.length,
            totalRegistrations,
            pendingRegistrations,
            approvedRegistrations,
            pendingStudents,
            totalParticipants,
            totalConfiguredCapacity,
            averageCapacityPercent,
            recentEvents: events.slice(0, 5),
            deadlineAlerts,
            capacityAlerts,
            recentActivity: mappedActivity
        }
    });
});

// Student Dashboard - Personal activity overview
export const getStudentStats = catchAsync(async (req, res) => {
    const userId = req.userId;
    const now = new Date();

    const [
        myRegistrations,
        upcomingEvents,
        totalPeers,
        totalSocieties,
        avgPulseResult,
        totalMoments
    ] = await Promise.all([
        Registration.find({ user: userId })
            .populate({
                path: "event",
                select: "title startDate endDate status category location registrationDeadline maxParticipants currentParticipants",
                populate: { path: "college", select: "name code" }
            }),
        Event.find({
            isActive: true,
            isApproved: true,
            startDate: { $gt: now }
        }).sort({ startDate: 1 }).limit(5).populate("college", "name code"),
        User.countDocuments({ role: "student", isActive: true }),
        College.countDocuments({ isActive: true }),
        Feedback.aggregate([
            { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]),
        Registration.countDocuments({ status: "attended" })
    ]);

    const approved = myRegistrations.filter(r => r.status === "approved");
    const waitlisted = myRegistrations.filter(r => r.status === "waitlisted");
    const rejected = myRegistrations.filter(r => r.status === "rejected");
    const futureTickets = approved.filter(r => r.event && new Date(r.event.startDate) > now);
    const pastAttended = myRegistrations.filter(r => r.status === "attended");
    const feedbackPending = pastAttended.filter(r => r.event && new Date(r.event.endDate) < now).length;

    const avgPulse = avgPulseResult.length > 0 ? (avgPulseResult[0].avgRating * 2).toFixed(1) : "8.5"; // Scale to 10 for "Pulse"

    // Achievement logic
    const attendedCount = pastAttended.length;
    let tier = "Campus Novice";
    let nextTierThreshold = 5;
    if (attendedCount >= 20) {
        tier = "Campus Legend";
        nextTierThreshold = 50;
    } else if (attendedCount >= 10) {
        tier = "Campus Pro";
        nextTierThreshold = 20;
    } else if (attendedCount >= 5) {
        tier = "Campus Regular";
        nextTierThreshold = 10;
    }

    const progress = Math.min(100, Math.round((attendedCount / nextTierThreshold) * 100));
    const remaining = Math.max(0, nextTierThreshold - attendedCount);

    // Deadline alerts: upcoming events closing within 24 hours
    const deadlineAlerts = upcomingEvents.filter(e =>
        e.registrationDeadline &&
        new Date(e.registrationDeadline) > now &&
        (new Date(e.registrationDeadline) - now) < 24 * 60 * 60 * 1000
    );

    res.status(200).json({
        success: true,
        data: {
            totalRegistrations: myRegistrations.length,
            approvedCount: approved.length,
            waitlistedCount: waitlisted.length,
            rejectedCount: rejected.length,
            futureTickets: futureTickets.length,
            pastAttended: attendedCount,
            feedbackPending,
            recommendedEvents: upcomingEvents,
            deadlineAlerts,
            platformStats: {
                totalPeers: totalPeers > 1000 ? `${(totalPeers / 1000).toFixed(1)}k+` : totalPeers,
                totalSocieties,
                avgPulse,
                totalMoments: totalMoments > 1000 ? `${(totalMoments / 1000).toFixed(1)}m` : totalMoments
            },
            achievement: {
                tier,
                progress,
                remaining,
                nextTierThreshold
            }
        }
    });
});

// Analytics Stats (Charts)
export const getAnalytics = catchAsync(async (req, res) => {
    const role = req.userRole;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    let registrationTrend = [];
    let categoryDistribution = [];
    let collegeParticipation = [];

    if (role === 'admin') {
        // SuperAdmin Analytics
        // 1. Registration trend (last 30 days)
        registrationTrend = await Registration.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Category distribution
        categoryDistribution = await Event.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. College participation (top 10)
        collegeParticipation = await Registration.aggregate([
            {
                $group: {
                    _id: "$college",
                    count: { $sum: 1 }
                }
            },
            { $lookup: { from: "colleges", localField: "_id", foreignField: "_id", as: "collegeDetails" } },
            { $unwind: "$collegeDetails" },
            {
                $project: {
                    name: "$collegeDetails.name",
                    count: 1
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Fallback: if no registrations yet, rank by active event count per college
        if (!collegeParticipation.length) {
            collegeParticipation = await Event.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: "$college",
                        count: { $sum: 1 }
                    }
                },
                { $lookup: { from: "colleges", localField: "_id", foreignField: "_id", as: "collegeDetails" } },
                { $unwind: "$collegeDetails" },
                {
                    $project: {
                        name: "$collegeDetails.name",
                        count: 1
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);
        }

    } else if (role === 'college_admin') {
        // College Admin Analytics
        const collegeId = req.user.college;

        // 1. Registration trend for their college
        registrationTrend = await Registration.aggregate([
            { $match: { college: collegeId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Event category distribution
        categoryDistribution = await Event.aggregate([
            { $match: { college: collegeId, isActive: true } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Top events by registration
        collegeParticipation = await Event.aggregate([
            { $match: { college: collegeId, isActive: true } },
            { $sort: { currentParticipants: -1 } },
            { $limit: 5 },
            {
                $project: {
                    name: "$title",
                    count: "$currentParticipants"
                }
            }
        ]);
    }

    res.status(200).json({
        success: true,
        data: {
            registrationTrend,
            categoryDistribution,
            collegeParticipation
        }
    });
});

/**
 * GET /api/dashboards/signals
 * SuperAdmin-only governance signals for the Control Tower.
 *
 * Computes four signal categories:
 *  1. lowRatingAlerts    – events with avg feedback rating < 2.5 (min 3 reviews)
 *  2. highNoShowEvents   – past events where no-shows > 40% of attended+no_show
 *  3. frequentEditEvents – approved events edited >= 3 times (update_pending flips)
 *  4. capacityAnomalies  – events capped at < 5 participants OR > 500 participants
 */
export const getPlatformSignals = catchAsync(async (req, res) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ── Signal 1: Low rating alerts ──────────────────────────────────────────
    const lowRatingRaw = await Feedback.aggregate([
        {
            $group: {
                _id: "$eventId",
                avgRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
            },
        },
        { $match: { avgRating: { $lt: 2.5 }, reviewCount: { $gte: 3 } } },
        {
            $lookup: {
                from: "events",
                localField: "_id",
                foreignField: "_id",
                as: "event",
            },
        },
        { $unwind: "$event" },
        {
            $lookup: {
                from: "colleges",
                localField: "event.college",
                foreignField: "_id",
                as: "college",
            },
        },
        { $unwind: { path: "$college", preserveNullAndEmpty: true } },
        {
            $project: {
                eventId: "$_id",
                eventTitle: "$event.title",
                collegeName: { $ifNull: ["$college.name", "Unknown"] },
                avgRating: { $round: ["$avgRating", 2] },
                reviewCount: 1,
            },
        },
        { $sort: { avgRating: 1 } },
        { $limit: 10 },
    ]);

    // ── Signal 2: High no-show events (past events, last 30 days) ────────────
    const noShowRaw = await Registration.aggregate([
        {
            $match: {
                status: { $in: ["attended", "no_show"] },
                createdAt: { $gte: thirtyDaysAgo },
            },
        },
        {
            $group: {
                _id: "$event",
                attended: { $sum: { $cond: [{ $eq: ["$status", "attended"] }, 1, 0] } },
                noShow: { $sum: { $cond: [{ $eq: ["$status", "no_show"] }, 1, 0] } },
            },
        },
        {
            $addFields: {
                total: { $add: ["$attended", "$noShow"] },
                noShowRate: {
                    $cond: [
                        { $gt: [{ $add: ["$attended", "$noShow"] }, 0] },
                        {
                            $divide: [
                                "$noShow",
                                { $add: ["$attended", "$noShow"] },
                            ],
                        },
                        0,
                    ],
                },
            },
        },
        { $match: { noShowRate: { $gt: 0.4 }, total: { $gte: 5 } } },
        {
            $lookup: {
                from: "events",
                localField: "_id",
                foreignField: "_id",
                as: "event",
            },
        },
        { $unwind: "$event" },
        {
            $lookup: {
                from: "colleges",
                localField: "event.college",
                foreignField: "_id",
                as: "college",
            },
        },
        { $unwind: { path: "$college", preserveNullAndEmpty: true } },
        {
            $project: {
                eventId: "$_id",
                eventTitle: "$event.title",
                collegeName: { $ifNull: ["$college.name", "Unknown"] },
                noShowRate: { $round: [{ $multiply: ["$noShowRate", 100] }, 1] },
                attended: 1,
                noShow: 1,
                total: 1,
            },
        },
        { $sort: { noShowRate: -1 } },
        { $limit: 10 },
    ]);

    // ── Signal 3: Frequent event edits (AdminLog approach) ───────────────────
    // Count EVENT_UPDATE log entries per event in the last 30 days
    let frequentEditEvents = [];
    try {
        frequentEditEvents = await AdminLog.aggregate([
            {
                $match: {
                    action: { $in: ["EVENT_UPDATE", "EVENT_EDIT"] },
                    createdAt: { $gte: thirtyDaysAgo },
                    targetType: "Event",
                },
            },
            {
                $group: {
                    _id: "$targetId",
                    editCount: { $sum: 1 },
                    lastEdit: { $max: "$createdAt" },
                },
            },
            { $match: { editCount: { $gte: 3 } } },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "_id",
                    as: "event",
                },
            },
            { $unwind: { path: "$event", preserveNullAndEmpty: true } },
            {
                $lookup: {
                    from: "colleges",
                    localField: "event.college",
                    foreignField: "_id",
                    as: "college",
                },
            },
            { $unwind: { path: "$college", preserveNullAndEmpty: true } },
            {
                $project: {
                    eventId: "$_id",
                    eventTitle: { $ifNull: ["$event.title", "Unknown"] },
                    collegeName: { $ifNull: ["$college.name", "Unknown"] },
                    editCount: 1,
                    lastEdit: 1,
                },
            },
            { $sort: { editCount: -1 } },
            { $limit: 10 },
        ]);
    } catch (_err) {
        // AdminLog may not have edit entries yet — degrade gracefully
        frequentEditEvents = [];
    }

    // ── Signal 4: Capacity anomalies ─────────────────────────────────────────
    const capacityAnomalies = await Event.find({
        isActive: true,
        isApproved: true,
        $or: [
            { maxParticipants: { $gt: 0, $lt: 5 } },      // unusually small cap
            { maxParticipants: { $gt: 500 } },              // unusually large cap
        ],
    })
        .populate("college", "name")
        .select("title maxParticipants currentParticipants startDate college status")
        .sort({ maxParticipants: 1 })
        .limit(10);

    const capacityAnomaliesFormatted = capacityAnomalies.map((e) => ({
        eventId: e._id,
        eventTitle: e.title,
        collegeName: e.college?.name || "Unknown",
        maxParticipants: e.maxParticipants,
        currentParticipants: e.currentParticipants,
        anomalyType: e.maxParticipants < 5 ? "very_low_cap" : "very_high_cap",
    }));

    res.status(200).json({
        success: true,
        data: {
            lowRatingAlerts: lowRatingRaw,
            highNoShowEvents: noShowRaw,
            frequentEditEvents,
            capacityAnomalies: capacityAnomaliesFormatted,
            generatedAt: now,
        },
    });
});
