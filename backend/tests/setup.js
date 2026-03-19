import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import app from "../app.js";
import { College } from "../models/College.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

let mongoServer;

export const api = request(app);
export const authApi = (token) => request(app).set("Authorization", `Bearer ${token}`);

export const IDS = {};
export const TOKENS = {};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const [collegeA, collegeB] = await College.create([
    {
      name: "College A",
      code: "COLA",
      email: "college-a@test.edu",
      isActive: true,
      isVerified: true,
    },
    {
      name: "College B",
      code: "COLB",
      email: "college-b@test.edu",
      isActive: true,
      isVerified: true,
    },
  ]);

  const superadmin = await User.create({
    username: "superadmin",
    email: "superadmin@test.edu",
    password: "pass123",
    role: "admin",
    firstName: "Super",
    lastName: "Admin",
  });

  const collegeAdmin = await User.create({
    username: "collegeadmin",
    email: "collegeadmin@test.edu",
    password: "pass123",
    role: "college_admin",
    college: collegeA._id,
    firstName: "College",
    lastName: "Admin",
    isVerified: true,
    isApproved: true,
    isActive: true,
    accountStatus: "active",
  });

  const student = await User.create({
    username: "studentone",
    email: "student.one@test.edu",
    password: "pass123",
    role: "student",
    college: collegeA._id,
    firstName: "Student",
    lastName: "One",
    isVerified: true,
    isApproved: true,
    isActive: true,
    accountStatus: "active",
  });

  const sameCollegePendingStudent = await User.create({
    username: "pendingstudenta",
    email: "pending.a@test.edu",
    password: "pass123",
    role: "student",
    college: collegeA._id,
    firstName: "Pending",
    lastName: "SameCollege",
    isVerified: true,
    isApproved: false,
    isActive: false,
    accountStatus: "pending_approval",
  });

  const foreignCollegePendingStudent = await User.create({
    username: "pendingstudentb",
    email: "pending.b@test.edu",
    password: "pass123",
    role: "student",
    college: collegeB._id,
    firstName: "Pending",
    lastName: "ForeignCollege",
    isVerified: true,
    isApproved: false,
    isActive: false,
    accountStatus: "pending_approval",
  });

  const pendingCollegeAdmin = await User.create({
    username: "pendingadmin",
    email: "pending.admin@test.edu",
    password: "pass123",
    role: "college_admin",
    college: collegeB._id,
    firstName: "Pending",
    lastName: "Admin",
    isVerified: true,
    isApproved: false,
    isActive: false,
    accountStatus: "pending_approval",
  });

  const now = Date.now();
  const existingEvent = await Event.create({
    title: "Existing Approved Event",
    description: "Approved event for access checks",
    category: "technical",
    location: "Campus A Hall",
    startDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(now + 3 * 24 * 60 * 60 * 1000),
    college: collegeA._id,
    createdBy: collegeAdmin._id,
    status: "approved",
    isApproved: true,
    isVisible: true,
    isActive: true,
    maxParticipants: 20,
  });

  const pendingEvent = await Event.create({
    title: "Pending Event 1",
    description: "Pending approval event",
    category: "seminar",
    location: "Campus B Hall",
    startDate: new Date(now + 4 * 24 * 60 * 60 * 1000),
    endDate: new Date(now + 5 * 24 * 60 * 60 * 1000),
    college: collegeB._id,
    createdBy: pendingCollegeAdmin._id,
    status: "pending_approval",
    isApproved: false,
    isVisible: false,
    isActive: true,
    maxParticipants: 25,
  });

  const pendingEventForReject = await Event.create({
    title: "Pending Event 2",
    description: "Pending approval event for rejection",
    category: "workshop",
    location: "Campus B Lab",
    startDate: new Date(now + 6 * 24 * 60 * 60 * 1000),
    endDate: new Date(now + 7 * 24 * 60 * 60 * 1000),
    college: collegeB._id,
    createdBy: pendingCollegeAdmin._id,
    status: "pending_approval",
    isApproved: false,
    isVisible: false,
    isActive: true,
    maxParticipants: 30,
  });

  const pendingRegistration = await Registration.create({
    event: existingEvent._id,
    user: sameCollegePendingStudent._id,
    college: collegeA._id,
    status: "pending",
  });

  Object.assign(IDS, {
    collegeAdminCollegeId: String(collegeA._id),
    foreignCollegeId: String(collegeB._id),
    studentCollegeId: String(collegeA._id),
    pendingStudentId: String(sameCollegePendingStudent._id),
    sameCollegePendingStudentId: String(sameCollegePendingStudent._id),
    foreignCollegePendingStudentId: String(foreignCollegePendingStudent._id),
    pendingCollegeAdminId: String(pendingCollegeAdmin._id),
    existingEventId: String(existingEvent._id),
    pendingEventId: String(pendingEvent._id),
    pendingEventIdForReject: String(pendingEventForReject._id),
    pendingRegistrationId: String(pendingRegistration._id),
  });

  const [superLogin, collegeAdminLogin, studentLogin] = await Promise.all([
    api.post("/api/auth/login").send({ email: "superadmin@test.edu", password: "pass123" }),
    api.post("/api/auth/login").send({ email: "collegeadmin@test.edu", password: "pass123" }),
    api.post("/api/auth/login").send({ email: "student.one@test.edu", password: "pass123" }),
  ]);

  TOKENS.superadmin = superLogin.body?.token || superLogin.body?.data?.token;
  TOKENS.collegeAdmin = collegeAdminLogin.body?.token || collegeAdminLogin.body?.data?.token;
  TOKENS.student = studentLogin.body?.token || studentLogin.body?.data?.token;
});

afterEach(async () => {
  await Registration.deleteMany({ event: { $exists: true }, status: "waitlisted", waitlistPosition: { $gt: 50 } });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
