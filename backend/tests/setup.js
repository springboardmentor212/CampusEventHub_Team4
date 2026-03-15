/**
 * tests/setup.js
 * Central config for all tests.
 * Fill in your actual IDs and credentials before running.
 */

import request from "supertest";

export const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5000";

// Login helper
async function login(email, password) {
  const res = await request(BASE_URL)
    .post("/api/auth/login")
    .send({ email, password });
  const bodyToken = res.body?.token || res.body?.data?.token;
  const cookieHeader = res.headers?.["set-cookie"]?.find((c) => c.startsWith("token="));
  const cookieToken = cookieHeader ? cookieHeader.split(";")[0].split("=")[1] : null;
  const token = bodyToken || cookieToken;

  if (!token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return token;
}

// Seed credentials. These must exist in DB before running tests.
// Defaults here match backend/seed.js, and can be overridden with env vars.
const CREDENTIALS = {
  superadmin: {
    email: process.env.TEST_SUPERADMIN_EMAIL || "229x1a2856@gprec.ac.in",
    password: process.env.TEST_SUPERADMIN_PASSWORD || "pass123",
  },
  collegeAdmin: {
    email: process.env.TEST_COLLEGE_ADMIN_EMAIL || "229x1a2856@gmail.com",
    password: process.env.TEST_COLLEGE_ADMIN_PASSWORD || "pass123",
  },
  student: {
    email: process.env.TEST_STUDENT_EMAIL || "student.one@iot.edu",
    password: process.env.TEST_STUDENT_PASSWORD || "pass123",
  },
};

// IDs. Fill these in from your DB.
export const IDS = {
  // College IDs
  collegeAdminCollegeId: "PASTE_COLLEGE_A_ID_HERE",
  foreignCollegeId: "PASTE_COLLEGE_B_ID_HERE",
  studentCollegeId: "PASTE_COLLEGE_A_ID_HERE",

  // User IDs
  pendingStudentId: "PASTE_ANY_PENDING_STUDENT_ID",
  sameCollegePendingStudentId: "PASTE_PENDING_STUDENT_FROM_COLLEGE_A",
  foreignCollegePendingStudentId: "PASTE_PENDING_STUDENT_FROM_COLLEGE_B",
  pendingCollegeAdminId: "PASTE_PENDING_COLLEGE_ADMIN_ID",

  // Event IDs
  existingEventId: "PASTE_ANY_APPROVED_EVENT_ID",
  pendingEventId: "PASTE_PENDING_EVENT_ID_1",
  pendingEventIdForReject: "PASTE_PENDING_EVENT_ID_2",

  // Registration IDs
  pendingRegistrationId: "PASTE_PENDING_REGISTRATION_ID",
};

export let TOKENS = { ...IDS };

beforeAll(async () => {
  const [superadmin, collegeAdmin, student] = await Promise.all([
    login(CREDENTIALS.superadmin.email, CREDENTIALS.superadmin.password),
    login(CREDENTIALS.collegeAdmin.email, CREDENTIALS.collegeAdmin.password),
    login(CREDENTIALS.student.email, CREDENTIALS.student.password),
  ]);

  TOKENS.superadmin = superadmin;
  TOKENS.collegeAdmin = collegeAdmin;
  TOKENS.student = student;
}, 15000);
