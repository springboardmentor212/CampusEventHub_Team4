/**
 * Core Pipeline Integration Tests (unit-style with mocks — no MongoDB binary dependency)
 *
 * Pipeline covered:
 *   1. Event creation → pending_approval status
 *   2. Event approval → approved status
 *   3. Registration → approved status (capacity available)
 *   4. Registration → waitlisted when event is full
 *   5. Waitlist promotion when a registration is cancelled
 *   6. Attendance marking (attended / no_show)
 *   7. Feedback submission gate (requires attended registration)
 *   8. Feedback uniqueness (one per student per event)
 */

import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { promoteNextWaitlistedRegistration, markAttendance, registerForEvent } from "../../controllers/registrationController.js";
import { submitFeedback } from "../../controllers/feedbackController.js";
import { approveEvent, createEvent } from "../../controllers/eventController.js";
import { Registration } from "../../models/Registration.js";
import { Event } from "../../models/Event.js";
import { Feedback } from "../../models/Feedback.js";
import { User } from "../../models/User.js";

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSave(target) {
  return jest.fn().mockImplementation(async () => { return target; });
}

function makeReqRes(body = {}, params = {}, userId = "user1", userRole = "college_admin") {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const req = { body, params, userId, userRole, user: { _id: userId, college: "college1" }, ip: "127.0.0.1" };
  return { req, res, next };
}

// ─── 1. Event Creation + Lifecycle ───────────────────────────────────────────

describe("Event lifecycle pipeline", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = "test";
  });

  test("approveEvent sets status to approved and isApproved true", async () => {
    const event = {
      _id: "event1",
      status: "pending_approval",
      isApproved: false,
      isVisible: false,
      hasPendingUpdate: false,
      title: "Test Event",
      college: { name: "Test College" },
      createdBy: { _id: "adminUser1", email: "admin@test.edu", firstName: "Admin" },
      toObject: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue(undefined),
    };

    jest.spyOn(Event, "findById").mockReturnValue({
      populate: () => Promise.resolve(event),
    });

    // Stub admin action log and notifications
    jest.spyOn(User, "find").mockResolvedValue([]);

    const { req, res, next } = makeReqRes({}, { id: "event1" }, "superadmin1", "admin");

    await approveEvent(req, res, next);

    expect(event.status).toBe("approved");
    expect(event.isApproved).toBe(true);
    expect(event.save).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  test("approveEvent returns 404 for nonexistent event", async () => {
    jest.spyOn(Event, "findById").mockReturnValue({
      populate: () => Promise.resolve(null),
    });

    const { req, res, next } = makeReqRes({}, { id: "nonexistent" }, "superadmin1", "admin");
    await approveEvent(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  test("createEvent for unapproved college_admin creates pending_approval event", async () => {
    const now = Date.now();
    const startDate = new Date(now + 48 * 60 * 60 * 1000).toISOString();
    const endDate = new Date(now + 72 * 60 * 60 * 1000).toISOString();

    jest.spyOn(Event, "findOne").mockResolvedValue(null);

    const createdEvent = {
      _id: "event-created-1",
      title: "New Campus Event",
      isApproved: false,
      status: "pending_approval",
      populate: jest.fn().mockResolvedValue(undefined),
    };
    const createSpy = jest.spyOn(Event, "create").mockResolvedValue(createdEvent);

    jest.spyOn(User, "find").mockReturnValue({
      select: () => Promise.resolve([]),
    });

    const { req, res, next } = makeReqRes(
      {
        title: "New Campus Event",
        description: "desc",
        category: "technical",
        location: "Main Hall",
        startDate,
        endDate,
      },
      {},
      "college-admin-1",
      "college_admin"
    );
    req.user = {
      _id: "college-admin-1",
      college: { _id: "college1", name: "College One" },
      isApproved: false,
      firstName: "CA",
    };

    createEvent(req, res, next);
    await flushAsync();

    expect(next).not.toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledTimes(1);
    const payload = createSpy.mock.calls[0][0];
    expect(payload.status).toBe("pending_approval");
    expect(payload.isApproved).toBe(false);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── 2. Registration Pipeline ─────────────────────────────────────────────────

describe("Registration pipeline", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = "test";
  });

  test("waitlist promotion moves next waitlisted registration to approved and increments participants", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const promoted = {
      _id: "reg2",
      status: "waitlisted",
      waitlistPosition: 1,
      confirmationDeadline: new Date(),
      approvalDate: null,
      user: { _id: "u2", firstName: "Student", email: "student@test.edu" },
      event: { title: "Pipeline Event" },
      save: saveMock,
    };

    jest.spyOn(Registration, "findOne").mockReturnValue({
      sort: () => ({
        populate: () => ({
          populate: () => Promise.resolve(promoted),
        }),
      }),
    });

    jest.spyOn(Registration, "find").mockReturnValue({
      sort: () => Promise.resolve([{ waitlistPosition: 1, save: jest.fn().mockResolvedValue(undefined) }]),
    });

    const eventUpdateSpy = jest.spyOn(Event, "findByIdAndUpdate").mockResolvedValue({ _id: "event1" });

    const result = await promoteNextWaitlistedRegistration("event1");

    expect(result).toBe(promoted);
    expect(promoted.status).toBe("approved");
    expect(promoted.waitlistPosition).toBeNull();
    expect(promoted.confirmationDeadline).toBeNull();
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(eventUpdateSpy).toHaveBeenCalledWith("event1", { $inc: { currentParticipants: 1 } });
  });

  test("waitlist promotion returns null when no waitlisted registrations exist", async () => {
    jest.spyOn(Registration, "findOne").mockReturnValue({
      sort: () => ({
        populate: () => ({
          populate: () => Promise.resolve(null),
        }),
      }),
    });

    const result = await promoteNextWaitlistedRegistration("event1");
    expect(result).toBeNull();
  });

  test("registerForEvent creates approved registration when capacity is available", async () => {
    const now = Date.now();
    const event = {
      _id: "event-open-1",
      title: "Open Event",
      college: "college1",
      audience: "all_colleges",
      status: "approved",
      isActive: true,
      registrationDeadline: new Date(now + 24 * 60 * 60 * 1000),
      maxParticipants: 10,
      currentParticipants: 2,
      startDate: new Date(now + 48 * 60 * 60 * 1000),
    };

    jest.spyOn(Event, "findById").mockReturnValue({
      select: () => Promise.resolve(event),
    });
    jest.spyOn(Registration, "findOne").mockResolvedValue(null);
    jest.spyOn(Event, "findOneAndUpdate").mockResolvedValue({ _id: "event-open-1" });

    const registrationDoc = {
      _id: "reg-approved-1",
      status: "approved",
      event: { _id: "event-open-1", title: "Open Event", startDate: event.startDate },
      user: { firstName: "Stu", email: "stu@test.edu" },
      populate: jest.fn().mockResolvedValue(undefined),
    };
    const createSpy = jest.spyOn(Registration, "create").mockResolvedValue(registrationDoc);
    const userUpdateSpy = jest.spyOn(User, "findByIdAndUpdate").mockResolvedValue({ _id: "student1" });

    const { req, res, next } = makeReqRes({}, { eventId: "event-open-1" }, "student1", "student");
    req.user = {
      _id: "student1",
      college: "college1",
      firstName: "Stu",
      email: "stu@test.edu",
    };

    registerForEvent(req, res, next);
    await flushAsync();

    expect(next).not.toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy.mock.calls[0][0]).toEqual(expect.objectContaining({ status: "approved" }));
    expect(userUpdateSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("registerForEvent creates waitlisted registration when event is full", async () => {
    const now = Date.now();
    const event = {
      _id: "event-full-1",
      title: "Full Event",
      college: "college1",
      audience: "all_colleges",
      status: "approved",
      isActive: true,
      registrationDeadline: new Date(now + 24 * 60 * 60 * 1000),
      maxParticipants: 2,
      currentParticipants: 2,
      startDate: new Date(now + 48 * 60 * 60 * 1000),
    };

    jest.spyOn(Event, "findById").mockReturnValue({
      select: () => Promise.resolve(event),
    });
    jest.spyOn(Registration, "findOne").mockResolvedValue(null);
    jest.spyOn(Registration, "countDocuments").mockResolvedValue(0);

    const waitlistedDoc = {
      _id: "reg-wait-1",
      status: "waitlisted",
      waitlistPosition: 1,
      event: { _id: "event-full-1", title: "Full Event" },
      user: { firstName: "Stu", email: "stu@test.edu" },
      createdAt: new Date(),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    const createSpy = jest.spyOn(Registration, "create").mockResolvedValue(waitlistedDoc);

    const { req, res, next } = makeReqRes({}, { eventId: "event-full-1" }, "student1", "student");
    req.user = {
      _id: "student1",
      college: "college1",
      firstName: "Stu",
      email: "stu@test.edu",
    };

    registerForEvent(req, res, next);
    await flushAsync();

    expect(next).not.toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy.mock.calls[0][0]).toEqual(expect.objectContaining({ status: "waitlisted" }));
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── 3. Attendance Marking ────────────────────────────────────────────────────

describe("Attendance marking pipeline", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = "test";
  });

  test("markAttendance changes approved registration to attended", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const reg = {
      _id: "reg1",
      status: "approved",
      event: { createdBy: "admin1", title: "Event" },
      save: saveMock,
    };

    jest.spyOn(Registration, "findById").mockReturnValue({
      populate: () => Promise.resolve(reg),
    });

    const { req, res, next } = makeReqRes({ status: "attended" }, { id: "reg1" }, "admin1", "college_admin");
    await markAttendance(req, res, next);

    expect(reg.status).toBe("attended");
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  test("markAttendance rejects invalid status values", async () => {
    const { req, res, next } = makeReqRes({ status: "checked_in" }, { id: "reg1" }, "admin1", "college_admin");
    await markAttendance(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  test("markAttendance rejects if registration is in a non-approvable state (waitlisted)", async () => {
    const reg = {
      _id: "reg1",
      status: "waitlisted",
      event: { createdBy: "admin1", title: "Event" },
      save: jest.fn(),
    };

    jest.spyOn(Registration, "findById").mockReturnValue({
      populate: () => Promise.resolve(reg),
    });

    const { req, res, next } = makeReqRes({ status: "attended" }, { id: "reg1" }, "admin1", "college_admin");
    await markAttendance(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  test("markAttendance enforces admin-only write for other admins' registrations", async () => {
    const reg = {
      _id: "reg1",
      status: "approved",
      event: { createdBy: "other_admin", title: "Event" },
      save: jest.fn(),
    };

    jest.spyOn(Registration, "findById").mockReturnValue({
      populate: () => Promise.resolve(reg),
    });

    const { req, res, next } = makeReqRes({ status: "attended" }, { id: "reg1" }, "admin1", "college_admin");
    await markAttendance(req, res, next);

    // Should be blocked because admin1 !== other_admin and role is college_admin (not superadmin)
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});

// ─── 4. Feedback Pipeline ─────────────────────────────────────────────────────

describe("Feedback pipeline", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = "test";
  });

  test("feedback submission succeeds when student attended the event", async () => {
    jest.spyOn(Event, "findById").mockReturnValue({
      select: () => Promise.resolve({ _id: "event1", endDate: new Date(Date.now() - 1000) }),
    });

    jest.spyOn(Registration, "findOne").mockReturnValue({
      select: () => Promise.resolve({ _id: "reg1" }),
    });

    jest.spyOn(Feedback, "findOne").mockResolvedValue(null);

    const feedbackDoc = {
      _id: "fb1",
      rating: 5,
      comment: "Excellent",
      populate: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(Feedback, "create").mockResolvedValue(feedbackDoc);

    const { req, res, next } = makeReqRes(
      { eventId: "event1", rating: 5, comment: "Excellent" },
      {},
      "student1",
      "student"
    );

    await submitFeedback(req, res, next);
    await flushAsync();

    expect(next).not.toHaveBeenCalled();
    expect(Feedback.create).toHaveBeenCalledTimes(1);
  });

  test("feedback gate: rejected when no attended registration found", async () => {
    jest.spyOn(Event, "findById").mockReturnValue({
      select: () => Promise.resolve({ _id: "event1" }),
    });

    jest.spyOn(Registration, "findOne").mockReturnValue({
      select: () => Promise.resolve(null),
    });

    const createSpy = jest.spyOn(Feedback, "create").mockResolvedValue({});

    const { req, res, next } = makeReqRes(
      { eventId: "event1", rating: 5, comment: "Great" },
      {},
      "student1",
      "student"
    );

    submitFeedback(req, res, next);
    await flushAsync();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("feedback uniqueness: second submission rejected with 400", async () => {
    jest.spyOn(Event, "findById").mockReturnValue({
      select: () => Promise.resolve({ _id: "event1" }),
    });

    jest.spyOn(Registration, "findOne").mockReturnValue({
      select: () => Promise.resolve({ _id: "reg1" }),
    });

    jest.spyOn(Feedback, "findOne").mockResolvedValue({ _id: "existing-fb" });
    const createSpy = jest.spyOn(Feedback, "create").mockResolvedValue({});

    const { req, res, next } = makeReqRes(
      { eventId: "event1", rating: 4, comment: "Good again" },
      {},
      "student1",
      "student"
    );

    submitFeedback(req, res, next);
    await flushAsync();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("feedback rating validation rejects out-of-range values", async () => {
    jest.spyOn(Event, "findById").mockReturnValue({
      select: () => Promise.resolve({ _id: "event1" }),
    });

    const createSpy = jest.spyOn(Feedback, "create").mockResolvedValue({});

    const { req, res, next } = makeReqRes(
      { eventId: "event1", rating: 10, comment: "Too high" },
      {},
      "student1",
      "student"
    );

    submitFeedback(req, res, next);
    await flushAsync();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });
});

// ─── 5. Lifecycle Mapping ─────────────────────────────────────────────────────

describe("Lifecycle state mapping", () => {
  test("deriveLifecycleState maps current enum correctly", async () => {
    const { deriveLifecycleState } = await import("../../utils/lifecycleMapper.js");
    const now = new Date();
    const past = new Date(now.getTime() - 2 * 3600 * 1000);
    const future = new Date(now.getTime() + 2 * 3600 * 1000);
    const farFuture = new Date(now.getTime() + 4 * 3600 * 1000);

    expect(deriveLifecycleState({ status: "pending_approval", startDate: future, endDate: farFuture }).uiStatus).toBe("pending");
    expect(deriveLifecycleState({ status: "approved", startDate: future, endDate: farFuture }).uiStatus).toBe("approved");
    expect(deriveLifecycleState({ status: "approved", startDate: past, endDate: farFuture }).uiStatus).toBe("active");
    expect(deriveLifecycleState({ status: "approved", startDate: past, endDate: new Date(past.getTime() + 1000) }).uiStatus).toBe("completed");
    expect(deriveLifecycleState({ status: "cancelled" }).uiStatus).toBe("cancelled");
    expect(deriveLifecycleState({ status: "paused" }).uiStatus).toBe("archived");
    expect(deriveLifecycleState({ status: "rejected" }).uiStatus).toBe("rejected");
  });

  test("update_pending surfaces as approved with hasPendingUpdate flag", async () => {
    const { deriveLifecycleState } = await import("../../utils/lifecycleMapper.js");
    const future = new Date(Date.now() + 3600 * 1000);
    const farFuture = new Date(Date.now() + 7200 * 1000);

    const result = deriveLifecycleState({ status: "update_pending", startDate: future, endDate: farFuture });
    expect(result.uiStatus).toBe("approved");
    expect(result.hasPendingUpdate).toBe(true);
  });
});
