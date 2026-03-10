import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { College } from "../models/College.js";
import { Registration } from "../models/Registration.js";
import { AdminLog } from "../models/AdminLog.js";
import catchAsync from "../utils/catchAsync.js";

// Super Admin Dashboard — Full platform overview
export const getSuperAdminStats = catchAsync(async (req, res) => {
    const now = new Date();

    const [
        totalColleges,
        totalEvents,
        totalStudents,
        totalCollegeAdmins,
        pendingAdmins,
        pendingEvents,
        totalRegistrations,
        approvedRegistrations,
        pendingRegistrations,
        recentLogs,
        allEvents,
    ] = await Promise.all([
        College.countDocuments({}),
        Event.countDocuments({ isActive: true }),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "college_admin" }),
        User.countDocuments({ role: "college_admin", isApproved: false }),
        Event.countDocuments({ isApproved: false, isActive: true }),
        Registration.countDocuments({}),
        Registration.countDocuments({ status: "approved" }),
        Registration.countDocuments({ status: "pending" }),
        AdminLog.find({}).sort({ createdAt: -1 }).limit(15).populate("perfomedBy", "firstName lastName"),
        Event.find({ isActive: true }).select("title startDate endDate currentParticipants maxParticipants registrationDeadline isApproved college category")
            .populate("college", "name code").sort({ startDate: 1 }).limit(20),
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

    res.status(200).json({
        success: true,
        data: {
            totalColleges,
            totalEvents,
            totalStudents,
            totalCollegeAdmins,
            pendingAdmins,
            pendingEvents,
            totalRegistrations,
            approvedRegistrations,
            pendingRegistrations,
            ongoingEvents,
            deadlineAlerts,
            capacityAlerts,
            recentActivity: recentLogs,
        }
    });
});

// College Admin Dashboard — College-specific overview
export const getCollegeAdminStats = catchAsync(async (req, res) => {
    const collegeId = req.user.college;
    const now = new Date();

    const [totalEvents, events, totalRegistrations, pendingRegistrations, approvedRegistrations, pendingStudents] = await Promise.all([
        Event.countDocuments({ college: collegeId, isActive: true }),
        Event.find({ college: collegeId, isActive: true })
            .select("title startDate endDate currentParticipants maxParticipants registrationDeadline isApproved category status")
            .sort({ startDate: -1 }),
        Registration.countDocuments({ college: collegeId }),
        Registration.countDocuments({ college: collegeId, status: "pending" }),
        Registration.countDocuments({ college: collegeId, status: "approved" }),
        User.countDocuments({ role: "student", college: collegeId, isApproved: false }),
    ]);

    const upcomingEvents = events.filter(e => new Date(e.startDate) > now);
    const pastEvents = events.filter(e => new Date(e.endDate) < now);
    const pendingApproval = events.filter(e => !e.isApproved);
    const totalParticipants = events.reduce((s, e) => s + (e.currentParticipants || 0), 0);

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

    res.status(200).json({
        success: true,
        data: {
            totalEvents,
            upcomingCount: upcomingEvents.length,
            pastCount: pastEvents.length,
            pendingApprovalCount: pendingApproval.length,
            totalRegistrations,
            pendingRegistrations,
            approvedRegistrations,
            pendingStudents,
            totalParticipants,
            recentEvents: events.slice(0, 5),
            deadlineAlerts,
            capacityAlerts,
        }
    });
});

// Student Dashboard — Personal activity overview
export const getStudentStats = catchAsync(async (req, res) => {
    const userId = req.userId;
    const now = new Date();

    const [myRegistrations, upcomingEvents] = await Promise.all([
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
        }).sort({ startDate: 1 }).limit(5).populate("college", "name code")
    ]);

    const approved = myRegistrations.filter(r => r.status === "approved");
    const pending = myRegistrations.filter(r => r.status === "pending");
    const rejected = myRegistrations.filter(r => r.status === "rejected");
    const futureTickets = approved.filter(r => r.event && new Date(r.event.startDate) > now);
    const pastAttended = approved.filter(r => r.event && new Date(r.event.endDate) < now);

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
            pendingCount: pending.length,
            rejectedCount: rejected.length,
            futureTickets: futureTickets.length,
            pastAttended: pastAttended.length,
            recommendedEvents: upcomingEvents,
            deadlineAlerts,
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
