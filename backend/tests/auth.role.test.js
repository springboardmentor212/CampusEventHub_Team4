/**
 * tests/auth.role.test.js
 * Covers every security fix from the TODO.
 * Run: npm test
 */

import request from "supertest";
import { BASE_URL, TOKENS } from "./setup.js";

const api = (token) =>
  request(BASE_URL).set("Authorization", `Bearer ${token}`);

describe("FIX 1A - Student blocked from admin management routes", () => {
  test("student -> POST /admin/create-student -> 403", async () => {
    const res = await api(TOKENS.student)
      .post("/api/auth/admin/create-student")
      .send({ firstName: "X", lastName: "Y", email: "xy@test.com", password: "Test@1234" });
    expect(res.status).toBe(403);
  });

  test("student -> PATCH /admin/approve-user/:id -> 403", async () => {
    const res = await api(TOKENS.student)
      .patch(`/api/auth/admin/approve-user/${TOKENS.pendingStudentId}`);
    expect(res.status).toBe(403);
  });

  test("student -> DELETE /admin/reject-user/:id -> 403", async () => {
    const res = await api(TOKENS.student)
      .delete(`/api/auth/admin/reject-user/${TOKENS.pendingStudentId}`);
    expect(res.status).toBe(403);
  });
});

describe("FIX 1B - College admin can only manage own college students", () => {
  test("college_admin -> approve student from SAME college -> 200", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .patch(`/api/auth/admin/approve-user/${TOKENS.sameCollegePendingStudentId}`);
    expect(res.status).toBe(200);
  });

  test("college_admin -> approve student from DIFFERENT college -> 403", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .patch(`/api/auth/admin/approve-user/${TOKENS.foreignCollegePendingStudentId}`);
    expect(res.status).toBe(403);
  });

  test("college_admin -> reject student from DIFFERENT college -> 403", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .delete(`/api/auth/admin/reject-user/${TOKENS.foreignCollegePendingStudentId}`);
    expect(res.status).toBe(403);
  });

  test("college_admin -> approve a college_admin account -> 403", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .patch(`/api/auth/admin/approve-user/${TOKENS.pendingCollegeAdminId}`);
    expect(res.status).toBe(403);
  });

  test("college_admin -> createStudent ignores foreign collegeId in body", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .post("/api/auth/admin/create-student")
      .send({
        firstName: "Test",
        lastName: "Student",
        email: `test_${Date.now()}@college1.com`,
        password: "Test@1234",
        college: TOKENS.foreignCollegeId,
      });
    if (res.status === 200 || res.status === 201) {
      const assignedCollege =
        res.body.data?.user?.college?.toString() ??
        res.body.data?.college?.toString();
      expect(assignedCollege).toBe(TOKENS.collegeAdminCollegeId);
    } else {
      expect(res.status).not.toBe(403);
    }
  });

  test("superadmin -> approve pending college_admin -> 200", async () => {
    const res = await api(TOKENS.superadmin)
      .patch(`/api/auth/admin/approve-user/${TOKENS.pendingCollegeAdminId}`);
    expect(res.status).toBe(200);
  });
});

describe("FIX 2 - College profile editing is superadmin-only", () => {
  test("college_admin -> PUT own college basic field -> 403", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .put(`/api/colleges/${TOKENS.collegeAdminCollegeId}`)
      .send({ phone: "9000000000" });
    expect(res.status).toBe(403);
  });

  test("college_admin -> PUT foreign college -> 403", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .put(`/api/colleges/${TOKENS.foreignCollegeId}`)
      .send({ phone: "9000000000" });
    expect(res.status).toBe(403);
  });

  test("college_admin -> PUT isActive:false on own college -> 403", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .put(`/api/colleges/${TOKENS.collegeAdminCollegeId}`)
      .send({ isActive: false });
    expect(res.status).toBe(403);
  });

  test("superadmin -> PUT college -> 200", async () => {
    const res = await api(TOKENS.superadmin)
      .put(`/api/colleges/${TOKENS.collegeAdminCollegeId}`)
      .send({ isActive: true });
    expect(res.status).toBe(200);
  });
});

describe("FIX 3 - Superadmin cannot create/edit/delete events", () => {
  test("superadmin -> POST /events/create -> 403", async () => {
    const res = await api(TOKENS.superadmin)
      .post("/api/events/create")
      .send({ title: "Should Fail", description: "test" });
    expect(res.status).toBe(403);
  });

  test("superadmin -> PATCH /events/:id -> 403", async () => {
    const res = await api(TOKENS.superadmin)
      .patch(`/api/events/${TOKENS.existingEventId}`)
      .send({ title: "Hacked Title" });
    expect(res.status).toBe(403);
  });

  test("superadmin -> DELETE /events/:id -> 403", async () => {
    const res = await api(TOKENS.superadmin)
      .delete(`/api/events/${TOKENS.existingEventId}`);
    expect(res.status).toBe(403);
  });

  test("superadmin -> PATCH /events/:id/approve -> 200", async () => {
    const res = await api(TOKENS.superadmin)
      .patch(`/api/events/${TOKENS.pendingEventId}/approve`);
    expect(res.status).toBe(200);
  });

  test("superadmin -> DELETE /events/:id/reject -> 200", async () => {
    const res = await api(TOKENS.superadmin)
      .delete(`/api/events/${TOKENS.pendingEventIdForReject}/reject`);
    expect(res.status).toBe(200);
  });

  test("college_admin -> POST /events/create -> 200 or 201", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .post("/api/events/create")
      .send({
        title: `Integration Test Event ${Date.now()}`,
        description: "Created by integration test",
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        category: "academic",
        college: TOKENS.collegeAdminCollegeId,
      });
    expect([200, 201]).toContain(res.status);
  });
});

describe("FIX 5 - Registration approve/reject endpoints", () => {
  test("PATCH /registrations/:id/approve -> not 404", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .patch(`/api/registrations/${TOKENS.pendingRegistrationId}/approve`);
    expect(res.status).not.toBe(404);
    expect(res.status).not.toBe(405);
  });

  test("PATCH /registrations/:id/reject -> not 404", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .patch(`/api/registrations/${TOKENS.pendingRegistrationId}/reject`);
    expect(res.status).not.toBe(404);
    expect(res.status).not.toBe(405);
  });

  test("PATCH /registrations/:id/status -> 404 (old broken endpoint gone)", async () => {
    const res = await api(TOKENS.collegeAdmin)
      .patch(`/api/registrations/${TOKENS.pendingRegistrationId}/status`)
      .send({ status: "approved" });
    expect(res.status).toBe(404);
  });
});

describe("FIX 6 - Notification mark-read endpoint", () => {
  test("PATCH /notifications/read -> not 404", async () => {
    const res = await api(TOKENS.student)
      .patch("/api/notifications/read");
    expect(res.status).not.toBe(404);
  });

  test("PATCH /notifications/mark-all-read -> 404 (old endpoint gone)", async () => {
    const res = await api(TOKENS.student)
      .patch("/api/notifications/mark-all-read");
    expect(res.status).toBe(404);
  });
});

describe("FIX 8 - Event scope filter", () => {
  test("GET /events with no scope and no auth -> 200 (public feed intact)", async () => {
    const res = await request(BASE_URL).get("/api/events");
    expect(res.status).toBe(200);
  });

  test("GET /events?scope=my_college without auth -> 401", async () => {
    const res = await request(BASE_URL).get("/api/events?scope=my_college");
    expect(res.status).toBe(401);
  });

  test("GET /events?scope=other_colleges without auth -> 401", async () => {
    const res = await request(BASE_URL).get("/api/events?scope=other_colleges");
    expect(res.status).toBe(401);
  });

  test("GET /events?scope=my_college with auth -> 200, all events from own college", async () => {
    const res = await api(TOKENS.student).get("/api/events?scope=my_college");
    expect(res.status).toBe(200);
    const events = res.body.data?.events ?? [];
    events.forEach((e) => {
      const colId = e.college?._id?.toString() ?? e.college?.toString();
      expect(colId).toBe(TOKENS.studentCollegeId);
    });
  });

  test("GET /events?scope=other_colleges with auth -> 200, no events from own college", async () => {
    const res = await api(TOKENS.student).get("/api/events?scope=other_colleges");
    expect(res.status).toBe(200);
    const events = res.body.data?.events ?? [];
    events.forEach((e) => {
      const colId = e.college?._id?.toString() ?? e.college?.toString();
      expect(colId).not.toBe(TOKENS.studentCollegeId);
    });
  });
});
