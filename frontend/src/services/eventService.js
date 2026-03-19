import API from "../api/axios";

export const fetchEventById = (eventId, config = {}) => API.get(`/events/${eventId}`, config);
export const fetchEvents = (params = {}, config = {}) => API.get("/events", { ...config, params });
export const fetchMyEvents = (config = {}) => API.get("/events/my/events", config);

export const createEvent = (payload, config = {}) => API.post("/events/create", payload, config);
export const updateEvent = (eventId, payload, config = {}) => API.patch(`/events/${eventId}`, payload, config);
export const deleteEvent = (eventId, config = {}) => API.delete(`/events/${eventId}`, config);

export const cancelEvent = (eventId, config = {}) => API.patch(`/events/${eventId}/cancel`, {}, config);
export const pauseEvent = (eventId, config = {}) => API.patch(`/events/${eventId}/pause`, {}, config);
export const resumeEvent = (eventId, config = {}) => API.patch(`/events/${eventId}/resume`, {}, config);

export const approveEvent = (eventId, config = {}) => API.patch(`/events/${eventId}/approve`, {}, config);
export const rejectEvent = (eventId, payload = {}, config = {}) =>
  API.delete(`/events/${eventId}/reject`, { ...config, data: payload });
