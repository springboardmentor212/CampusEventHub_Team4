import { authApi, TOKENS } from "./setup.js";
import { College } from "../models/College.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";

const createFixture = async () => {
  const college = await College.create({
    name: `Invariant College ${Date.now()}`,
    code: `INV${Math.floor(Math.random() * 9000 + 1000)}`,
    email: `invariant-${Date.now()}@test.edu`,
    isActive: true,
    isVerified: true,
  });

  const admin = await User.create({
    username: `invadmin${Date.now()}`,
    email: `inv.admin.${Date.now()}@test.edu`,
    password: "pass123",
    role: "college_admin",
    college: college._id,
    firstName: "Invariant",
    lastName: "Admin",
    isVerified: true,
    isApproved: true,
    isActive: true,
    accountStatus: "active",
  });

  const studentA = await User.create({
    username: `invstudenta${Date.now()}`,
    email: `inv.a.${Date.now()}@test.edu`,
    password: "pass123",
    role: "student",
    college: college._id,
    firstName: "Student",
    lastName: "A",
    isVerified: true,
    isApproved: true,
    isActive: true,
    accountStatus: "active",
  });

  const studentB = await User.create({
    username: `invstudentb${Date.now()}`,
    email: `inv.b.${Date.now()}@test.edu`,
    password: "pass123",
    role: "student",
    college: college._id,
    firstName: "Student",
    lastName: "B",
    isVerified: true,
    isApproved: true,
    isActive: true,
    accountStatus: "active",
  });

  const now = Date.now();
  const event = await Event.create({
    title: `Invariant Event ${Date.now()}`,
    description: "Invariant chain test event",
    category: "technical",
    location: "Invariant Hall",
    startDate: new Date(now + 48 * 60 * 60 * 1000),
    endDate: new Date(now + 72 * 60 * 60 * 1000),
    college: college._id,
    createdBy: admin._id,
    status: "approved",
    isApproved: true,
    isVisible: true,
    isActive: true,
    maxParticipants: 1,
    currentParticipants: 0,
  });

  return { event, studentA, studentB, admin };
};

describe("Core invariant chain", () => {
  test("waitlist promotion -> attendance -> feedback eligibility -> one feedback", async () => {
    const { event, studentA, studentB, admin } = await createFixture();

    const loginA = await authApi(TOKENS.superadmin).post("/api/auth/login").send({
      email: studentA.email,
      password: "pass123",
    });
    const loginB = await authApi(TOKENS.superadmin).post("/api/auth/login").send({
      email: studentB.email,
      password: "pass123",
    });
    const loginAdmin = await authApi(TOKENS.superadmin).post("/api/auth/login").send({
      email: admin.email,
      password: "pass123",
    });

    const tokenA = loginA.body?.token || loginA.body?.data?.token;
    const tokenB = loginB.body?.token || loginB.body?.data?.token;
    const adminToken = loginAdmin.body?.token || loginAdmin.body?.data?.token;

    const regA = await authApi(tokenA).post(`/api/registrations/register/${event._id}`).send({});
    expect(regA.status).toBe(201);
    expect(regA.body?.data?.registration?.status).toBe("approved");

    const regB = await authApi(tokenB).post(`/api/registrations/register/${event._id}`).send({});
    expect(regB.status).toBe(201);
    expect(regB.body?.data?.registration?.status).toBe("waitlisted");

    const myRegsA = await authApi(tokenA).get("/api/registrations/my");
    const regARecord = (myRegsA.body?.data?.registrations || []).find((r) => String(r.event?._id) === String(event._id));
    expect(regARecord).toBeDefined();

    const cancelA = await authApi(tokenA).delete(`/api/registrations/${regARecord._id}`);
    expect(cancelA.status).toBe(200);

    const myRegsB = await authApi(tokenB).get("/api/registrations/my");
    const regBRecord = (myRegsB.body?.data?.registrations || []).find((r) => String(r.event?._id) === String(event._id));
    expect(regBRecord).toBeDefined();
    expect(regBRecord.status).toBe("approved");

    const attendance = await authApi(adminToken)
      .patch(`/api/registrations/${regBRecord._id}/attendance`)
      .send({ status: "attended" });
    expect(attendance.status).toBe(200);
    expect(attendance.body?.data?.registration?.status).toBe("attended");

    const feedback1 = await authApi(tokenB).post("/api/feedback").send({
      eventId: String(event._id),
      rating: 5,
      comment: "Great event",
    });
    expect(feedback1.status).toBe(201);

    const feedback2 = await authApi(tokenB).post("/api/feedback").send({
      eventId: String(event._id),
      rating: 4,
      comment: "Second feedback should fail",
    });
    expect(feedback2.status).toBe(400);
  });
});
