import { api, authApi, IDS, TOKENS } from "./setup.js";

describe("Role access controls", () => {
  test("student cannot approve users", async () => {
    const res = await authApi(TOKENS.student).patch(`/api/auth/admin/approve-user/${IDS.pendingStudentId}`);
    expect(res.status).toBe(403);
  });

  test("college admin can approve own-college pending student", async () => {
    const res = await authApi(TOKENS.collegeAdmin).patch(`/api/auth/admin/approve-user/${IDS.sameCollegePendingStudentId}`);
    expect(res.status).toBe(200);
  });

  test("college admin cannot approve foreign-college pending student", async () => {
    const res = await authApi(TOKENS.collegeAdmin).patch(`/api/auth/admin/approve-user/${IDS.foreignCollegePendingStudentId}`);
    expect(res.status).toBe(403);
  });

  test("superadmin can approve pending college admin", async () => {
    const res = await authApi(TOKENS.superadmin).patch(`/api/auth/admin/approve-user/${IDS.pendingCollegeAdminId}`);
    expect(res.status).toBe(200);
  });

  test("college admin cannot update college profile", async () => {
    const res = await authApi(TOKENS.collegeAdmin)
      .put(`/api/colleges/${IDS.collegeAdminCollegeId}`)
      .send({ phone: "9000000000" });
    expect(res.status).toBe(403);
  });

  test("superadmin can update college profile", async () => {
    const res = await authApi(TOKENS.superadmin)
      .put(`/api/colleges/${IDS.collegeAdminCollegeId}`)
      .send({ phone: "9000000000" });
    expect(res.status).toBe(200);
  });
});

describe("Event and registration route protections", () => {
  test("superadmin cannot create events via college-admin route", async () => {
    const now = Date.now();
    const res = await authApi(TOKENS.superadmin)
      .post("/api/events/create")
      .send({
        title: `Blocked Event ${Date.now()}`,
        description: "Should be forbidden",
        category: "technical",
        location: "Test Hall",
        startDate: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
    expect(res.status).toBe(403);
  });

  test("superadmin can approve pending events", async () => {
    const res = await authApi(TOKENS.superadmin).patch(`/api/events/${IDS.pendingEventId}/approve`);
    expect(res.status).toBe(200);
  });

  test("superadmin can reject pending events", async () => {
    const res = await authApi(TOKENS.superadmin).delete(`/api/events/${IDS.pendingEventIdForReject}/reject`).send({ reason: "Policy" });
    expect(res.status).toBe(200);
  });

  test("registration approve/reject endpoints exist", async () => {
    const approve = await authApi(TOKENS.collegeAdmin).patch(`/api/registrations/${IDS.pendingRegistrationId}/approve`);
    expect(approve.status).not.toBe(404);

    const reject = await authApi(TOKENS.collegeAdmin).patch(`/api/registrations/${IDS.pendingRegistrationId}/reject`).send({ reason: "capacity" });
    expect(reject.status).not.toBe(404);
  });

  test("notification mark-read endpoint exists", async () => {
    const res = await authApi(TOKENS.student).patch("/api/notifications/read");
    expect(res.status).not.toBe(404);
  });

  test("public events feed is available", async () => {
    const res = await api.get("/api/events");
    expect(res.status).toBe(200);
  });
});
