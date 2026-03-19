import mongoose from "mongoose";
import { User } from "./models/User.js";
import { College } from "./models/College.js";
import { Event } from "./models/Event.js";
import { Registration } from "./models/Registration.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const seedData = async () => {
  try {
    console.log("Attempting to connect to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Clear all collections to ensure a clean state
    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // ─── Super Admin Only ──────────────────────────────────────────────────────
    const admin = await User.create({
      username: "superadmin",
      email: "229x1a2856@gprec.ac.in",
      password: "pass123",
      role: "admin",
      firstName: "UDAY",
      lastName: "SOMAPURAM",
      phone: "+91-9999999999",
      officialId: "SUPER-ADM-001",
      isEmailVerified: true,
      isActive: true,
      isApproved: true,
      accountStatus: "active",
    });

    console.log("\n=== Seed Complete ===");
    console.log("\n=== Login Credentials ===");
    console.log("Super Admin  (Access: /superadmin):");
    console.log("  229x1a2856@gprec.ac.in / pass123");

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
