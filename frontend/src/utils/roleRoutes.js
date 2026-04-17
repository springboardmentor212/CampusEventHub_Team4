export const normalizeRole = (role) => {
  if (!role) return "";

  const normalized = String(role).toLowerCase().trim().replace(/[-\s]+/g, "_");

  if (normalized === "superadmin" || normalized === "super_admin") return "admin";
  if (normalized === "collegeadmin") return "college_admin";
  if (normalized === "students") return "student";

  return normalized;
};

export const getRoleHomeRoute = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") return "/superadmin";
  if (normalizedRole === "college_admin") return "/admin";
  return "/campus-feed";
};
