import API from "../api/axios";

export const approveUser = (userId, config = {}) =>
  API.patch(`/auth/admin/approve-user/${userId}`, {}, config);

export const rejectUser = (userId, payload = {}, config = {}) =>
  API.delete(`/auth/admin/reject-user/${userId}`, { ...config, data: payload });

export const fetchPendingAdmins = (config = {}) =>
  API.get("/auth/admin/pending-users", config);

export const fetchAllUsers = (config = {}) =>
  API.get("/auth/admin/all-users", config);

export const fetchPendingStudents = (config = {}) =>
  API.get("/auth/college/pending-students", config);
