import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { promoteNextWaitlistedRegistration } from "../../controllers/registrationController.js";
import { submitFeedback } from "../../controllers/feedbackController.js";
import { Registration } from "../../models/Registration.js";
import { Event } from "../../models/Event.js";
import { Feedback } from "../../models/Feedback.js";

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

describe("Core invariants (unit)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = "test";
  });

  test("waitlist promotion moves next waitlisted registration to approved", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);

    const promoted = {
      _id: "reg2",
      status: "waitlisted",
      waitlistPosition: 1,
      confirmationDeadline: new Date(),
      approvalDate: null,
      user: { _id: "u2", firstName: "Student", email: "student@test.edu" },
      event: { title: "Invariant Event" },
      save: saveMock,
    };

    jest.spyOn(Registration, "findOne").mockReturnValue({
      sort: () => ({
        populate: () => ({
          populate: () => Promise.resolve(promoted),
        }),
      }),
    });

    const waitlistedRows = [
      { waitlistPosition: 1, save: jest.fn().mockResolvedValue(undefined) },
    ];

    jest.spyOn(Registration, "find").mockReturnValue({
      sort: () => Promise.resolve(waitlistedRows),
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

  test("feedback eligibility requires attended registration", async () => {
    jest.spyOn(Event, "findById").mockReturnValue({
      select: () => Promise.resolve({ _id: "event1" }),
    });

    jest.spyOn(Registration, "findOne").mockReturnValue({
      select: () => Promise.resolve(null),
    });

    const createSpy = jest.spyOn(Feedback, "create").mockResolvedValue({});

    const req = {
      body: { eventId: "event1", rating: 5, comment: "Great" },
      userId: "student1",
    };

    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    submitFeedback(req, res, next);
    await flushAsync();

    expect(next).toHaveBeenCalledTimes(1);
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("one feedback per student per event is enforced", async () => {
    jest.spyOn(Event, "findById").mockReturnValue({
      select: () => Promise.resolve({ _id: "event1" }),
    });

    jest.spyOn(Registration, "findOne").mockReturnValue({
      select: () => Promise.resolve({ _id: "reg1" }),
    });

    jest.spyOn(Feedback, "findOne").mockResolvedValue({ _id: "existing-feedback" });
    const createSpy = jest.spyOn(Feedback, "create").mockResolvedValue({});

    const req = {
      body: { eventId: "event1", rating: 4, comment: "Good" },
      userId: "student1",
    };

    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    submitFeedback(req, res, next);
    await flushAsync();

    expect(next).toHaveBeenCalledTimes(1);
    expect(createSpy).not.toHaveBeenCalled();
  });
});
