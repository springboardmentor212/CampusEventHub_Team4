import API from "../api/axios";

export const fetchMyRegistrations = (config = {}) => API.get("/registrations/my", config);
export const registerForEvent = (eventId, config = {}) => API.post(`/registrations/register/${eventId}`, {}, config);
export const cancelRegistration = (registrationId, config = {}) => API.delete(`/registrations/${registrationId}`, config);

export const fetchEventRegistrations = (eventId, config = {}) =>
  API.get(`/registrations/event/${eventId}`, config);
export const approveRegistration = (registrationId, config = {}) =>
  API.patch(`/registrations/${registrationId}/approve`, {}, config);
export const rejectRegistration = (registrationId, payload = {}, config = {}) =>
  API.patch(`/registrations/${registrationId}/reject`, payload, config);
export const markRegistrationAttendance = (registrationId, payload = {}, config = {}) =>
  API.patch(`/registrations/${registrationId}/attendance`, payload, config);
export const exportEventRegistrations = (eventId, config = {}) =>
  API.get(`/registrations/event/${eventId}/export`, config);
