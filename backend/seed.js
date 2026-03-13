import mongoose from "mongoose";
import { User } from "./models/User.js";
import { College } from "./models/College.js";
import { Event } from "./models/Event.js";
import { Registration } from "./models/Registration.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const BACKEND_BASE_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
const TEST_BANNER_IMAGE_URL = `${BACKEND_BASE_URL}/uploads/test.png`;

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

    // Repair stale indexes from older schema versions (e.g., event_id/user_id)
    // so current unique index (event + user) works reliably during reseed.
    await Registration.syncIndexes();
    console.log("Registration indexes synced");

    // ─── Colleges ──────────────────────────────────────────────────────────────
    const colleges = await College.create([
      {
        name: "Institute of Technology",
        code: "IOT",
        email: "admin@iot.edu",
        phone: "+1-555-0101",
        departments: ["Computer Science", "Electronics", "Mechanical"],
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
        departments: ["Physics", "Chemistry", "Mathematics"],
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
        department: "Platform Ops",
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
        department: "Computer Science",
        officialId: "IOT-ADM-01",
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        accountStatus: "active",
      },
      {
        username: "science_admin",
        email: "cos.admin@campushub.edu",
        password: "pass123",
        role: "college_admin",
        college: colleges[1]._id,
        firstName: "SCIENCE",
        lastName: "ADMIN",
        phone: "+91-8777777777",
        department: "Physics",
        officialId: "COS-ADM-01",
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        accountStatus: "active",
      },
      {
        username: "student_one",
        email: "student.one@iot.edu",
        password: "pass123",
        role: "student",
        college: colleges[0]._id,
        firstName: "Student",
        lastName: "One",
        phone: "+91-8111111111",
        department: "Computer Science",
        officialId: "IOT-STU-001",
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        accountStatus: "active",
      },
      {
        username: "student_two",
        email: "student.two@cos.edu",
        password: "pass123",
        role: "student",
        college: colleges[1]._id,
        firstName: "Student",
        lastName: "Two",
        phone: "+91-8222222222",
        department: "Mathematics",
        officialId: "COS-STU-001",
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        accountStatus: "active",
      }
    ]);
    console.log(`Created ${users.length} users`);

    // College admin defaults are locked down in pre-save; force active approvals for seeded envs.
    await User.updateMany(
      { role: "college_admin" },
      { $set: { isApproved: true, isActive: true, accountStatus: "active", isEmailVerified: true } }
    );

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
        createdBy: users[1]._id,
        isApproved: true,
        status: "upcoming",
        bannerImage: TEST_BANNER_IMAGE_URL,
        maxParticipants: 100,
        registrationDeadline: new Date(today.getTime() + 18 * 60 * 60 * 1000),
        requirements: ["Laptop", "College ID card", "Basic JavaScript knowledge"],
        dosAndDonts: ["Be on time", "No food inside", "Carry charger"],
        participationRequirements: [
          { label: "Year of Study", fieldType: "text", isRequired: true },
          { label: "GitHub Profile", fieldType: "text", isRequired: false },
        ],
      },
      {
        title: "Inter-College Sports Meet",
        description: "A grand sports event featuring football, basketball, and track events.",
        category: "sports",
        location: "Sports Complex, COS",
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        college: colleges[1]._id,
        createdBy: users[2]._id,
        isApproved: true,
        status: "upcoming",
        bannerImage: TEST_BANNER_IMAGE_URL,
        requirements: ["Sports gear", "Team jersey", "Hydration bottle"],
        dosAndDonts: ["Wear team jerseys", "No outside footwear"],
        isTeamEvent: true,
        participationMode: "quad",
        minTeamSize: 4,
        maxTeamSize: 4,
        participationRequirements: [
          { label: "Team Name", fieldType: "text", isRequired: true },
          { label: "Captain Email", fieldType: "email", isRequired: true },
        ],
      },
      {
        title: "Cultural Night",
        description: "An evening of music, dance, and drama performances.",
        category: "cultural",
        location: "Open Air Theater, IOT",
        startDate: today,
        endDate: new Date(today.getTime() + 5 * 60 * 60 * 1000),
        college: colleges[0]._id,
        createdBy: users[1]._id,
        isApproved: true,
        status: "ongoing",
        bannerImage: TEST_BANNER_IMAGE_URL,
        maxParticipants: 500,
        registrationDeadline: new Date(today.getTime() + 6 * 60 * 60 * 1000),
        requirements: ["Campus ID"],
        dosAndDonts: ["Respect stage protocols", "No restricted items", "Follow organizer instructions"],
      }
    ]);
    console.log(`Created ${events.length} events`);

    // ─── Registrations ───────────────────────────────────────────────────────
    const registrations = await Registration.create([
      {
        event: events[0]._id,
        user: users[3]._id,
        college: colleges[0]._id,
        status: "approved",
        customRequirements: { "Year of Study": "3rd Year", "GitHub Profile": "https://github.com/student-one" },
      },
      {
        event: events[1]._id,
        user: users[4]._id,
        college: colleges[1]._id,
        status: "pending",
        customRequirements: { "Team Name": "COS Falcons", "Captain Email": "student.two@cos.edu" },
      },
      {
        event: events[0]._id,
        user: users[4]._id,
        college: colleges[1]._id,
        status: "waitlisted",
        waitlistPosition: 1,
      },
    ]);
    console.log(`Created ${registrations.length} registrations`);

    await Event.findByIdAndUpdate(events[0]._id, { $set: { currentParticipants: 1 } });
    await Event.findByIdAndUpdate(events[1]._id, { $set: { currentParticipants: 1 } });
    await Event.findByIdAndUpdate(events[2]._id, { $set: { currentParticipants: 0 } });

    await User.findByIdAndUpdate(users[3]._id, { $set: { registeredEvents: [events[0]._id] } });
    await User.findByIdAndUpdate(users[4]._id, { $set: { registeredEvents: [events[1]._id, events[0]._id] } });

    console.log("\n=== Seed Data Created Successfully ===");
    console.log("\n=== Login Credentials ===");
    console.log("Super Admin (Access: /superadmin):"); console.log("  229x1a2856@gprec.ac.in / pass123");
    console.log("\nCollege Admin (Access: /admin):"); console.log("  229x1a2856@gmail.com / pass123");
    console.log("\nSecond College Admin (Access: /admin):"); console.log("  cos.admin@campushub.edu / pass123");
    console.log("\nSample Student (Access: /campus-feed):"); console.log("  student.one@iot.edu / pass123");
    console.log("\nSeed Banner Image URL:", TEST_BANNER_IMAGE_URL);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
