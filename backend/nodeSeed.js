import { User } from "./models/User.js";

export async function seedSuperAdmin() {
  const existing = await User.findOne({ role: "admin" });

  if (existing) {
    return false;
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("Skipping superadmin seed: missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD");
    return false;
  }

  await User.create({
    username: "superadmin",
    email,
    password,
    role: "admin",
    firstName: "Platform",
    lastName: "Admin",
    phone: "+91-9999999999",
    officialId: "SUPER-ADM-001",
    isEmailVerified: true,
    isActive: true,
    isApproved: true,
    accountStatus: "active",
  });

  console.log("Superadmin seeded");
  return true;
}
