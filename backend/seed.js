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

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // ─── Colleges ──────────────────────────────────────────────────────────────
    const colleges = await College.create([
      {
        name: "Institute of Technology",
        code: "IOT",
        email: "admin@iot.edu",
        phone: "+1-555-0101",
        address: { street: "123 Tech Street", city: "Tech City", state: "CA", country: "India", pincode: "123456" },
        website: "https://iot.edu",
        description: "A premier engineering institute",
        type: "engineering",
        establishedYear: 2000,
        isActive: true,
        isVerified: true,
      },
      {
        name: "College of Science",
        code: "COS",
        email: "admin@cos.edu",
        phone: "+1-555-0102",
        address: { street: "456 Science Avenue", city: "Science City", state: "NY", country: "India", pincode: "654321" },
        website: "https://cos.edu",
        description: "Leading science and research institution",
        type: "science",
        establishedYear: 1995,
        isActive: true,
        isVerified: true,
      },
    ]);
    console.log(`Created ${colleges.length} colleges`);

    // ─── Users ─────────────────────────────────────────────────────────────────
    const users = await User.create([
      {
        username: "superadmin",
        email: "229x1a2856@gprec.ac.in",
        password: "pass123",
        role: "admin",
        college: colleges[0]._id,
        firstName: "UDAY",
        lastName: "SOMAPURAM",
        phone: "+91-9999999999",
        officialId: "SUPER-ADM-001",
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        accountStatus: "active",
      },
      {
        username: "college_admin",
        email: "229x1a2856@gmail.com",
        password: "pass123",
        role: "college_admin",
        college: colleges[0]._id,
        firstName: "COLLEGE",
        lastName: "ADMIN",
        phone: "+91-8888888888",
        officialId: "IOT-ADM-01",
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        accountStatus: "active",
      }
    ]);
    console.log(`Created ${users.length} users`);

    // ─── Events ────────────────────────────────────────────────────────────────
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

    const events = await Event.create([
      {
        title: "Tech Expo 2026",
        description: "Showcasing the latest in tech and innovation across full stack and AI.",
        category: "technical",
        location: "Main Auditorium, IOT",
        startDate: tomorrow,
        endDate: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
        college: colleges[0]._id,
        createdBy: users[0]._id,
        isApproved: true,
        status: "upcoming",
        maxParticipants: 100,
        registrationDeadline: new Date(today.getTime() + 18 * 60 * 60 * 1000),
        requirements: ["Laptop", "College ID card"],
        dosAndDonts: ["Be on time", "No food inside", "Required to register"],
      },
      {
        title: "Inter-College Sports Meet",
        description: "A grand sports event featuring football, basketball, and track events.",
        category: "sports",
        location: "Sports Complex, COS",
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        college: colleges[1]._id,
        createdBy: users[1]._id,
        isApproved: true,
        status: "upcoming",
        requirements: ["Sports gear"],
        dosAndDonts: ["Wear team jerseys", "No outside footwear"],
      },
      {
        title: "Cultural Night",
        description: "An evening of music, dance, and drama performances.",
        category: "cultural",
        location: "Open Air Theater, IOT",
        startDate: today,
        endDate: new Date(today.getTime() + 5 * 60 * 60 * 1000),
        college: colleges[0]._id,
        createdBy: users[0]._id,
        isApproved: true,
        status: "ongoing",
      }
    ]);
    console.log(`Created ${events.length} events`);

    console.log("\n=== Seed Data Created Successfully ===");
    console.log("\n=== Login Credentials ===");
    console.log("Super Admin (Access: /superadmin):"); console.log("  229x1a2856@gprec.ac.in / pass123");
    console.log("\nCollege Admin (Access: /admin):"); console.log("  229x1a2856@gmail.com / pass123");

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
