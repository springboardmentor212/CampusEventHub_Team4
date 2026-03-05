import mongoose from "mongoose";
import { User } from "./models/User.js";
import { College } from "./models/College.js";
import { Event } from "./models/Event.js";
import dotenv from "dotenv";

dotenv.config();
if (!process.env.MONGO_URI) {
  dotenv.config({ path: "./.env.local" });
}

const seedData = async () => {
  try {
    // Connect to MongoDB
    console.log("Attempting to connect to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Clear existing data
    await User.deleteMany({});
    await College.deleteMany({});
    await Event.deleteMany({});
    console.log("Cleared existing data");

    // Create sample colleges
    let colleges;
    try {
      colleges = await College.create([
        {
          name: "Institute of Technology",
          code: "IOT",
          email: "admin@iot.edu",
          phone: "+1-555-0101",
          address: {
            street: "123 Tech Street",
            city: "Tech City",
            state: "CA",
            country: "India",
            pincode: "123456",
          },
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
          address: {
            street: "456 Science Avenue",
            city: "Science City",
            state: "NY",
            country: "India",
            pincode: "654321",
          },
          website: "https://cos.edu",
          description: "Leading science and research institution",
          type: "science",
          establishedYear: 1995,
          isActive: true,
          isVerified: true,
        },
      ]);
    } catch (err) {
      console.error("COLLEGE CREATE ERROR:");
      console.error(JSON.stringify(err, null, 2));
      throw err;
    }

    console.log(`Created ${colleges.length} colleges`);

    let users;
    try {
      users = await User.create([
        {
          username: "admin_user",
          email: "admin@campuseventhub.com",
          password: "password123",
          role: "admin",
          college: colleges[0]._id,
          firstName: "System",
          lastName: "Administrator",
          phone: "+1-555-0001",
          officialId: "SA-001",
          isEmailVerified: true,
          isActive: true,
          isApproved: true,
        },
        {
          username: "college_admin_1",
          email: "admin@iot.edu",
          password: "password123",
          role: "college_admin",
          college: colleges[0]._id,
          firstName: "College",
          lastName: "Admin",
          phone: "+1-555-0101",
          officialId: "IOT-ADM-01",
          isEmailVerified: true,
          isActive: true,
          isApproved: true,
        },
        {
          username: "college_admin_2",
          email: "admin@cos.edu",
          password: "password123",
          role: "college_admin",
          college: colleges[1]._id,
          firstName: "Science",
          lastName: "Admin",
          phone: "+1-555-0102",
          officialId: "COS-ADM-01",
          isEmailVerified: true,
          isActive: true,
          isApproved: true,
        },
        {
          username: "student_1",
          email: "student1@iot.edu",
          password: "password123",
          role: "student",
          college: colleges[0]._id,
          firstName: "Alice",
          lastName: "Johnson",
          phone: "+1-555-0111",
          officialId: "IOT-ST-001",
          isEmailVerified: true,
          isActive: true,
          isApproved: true,
        },
        {
          username: "student_2",
          email: "student2@iot.edu",
          password: "password123",
          role: "student",
          college: colleges[0]._id,
          firstName: "Bob",
          lastName: "Smith",
          phone: "+1-555-0112",
          officialId: "IOT-ST-002",
          isEmailVerified: true,
          isActive: true,
          isApproved: true,
        },
        {
          username: "student_3",
          email: "student1@cos.edu",
          password: "password123",
          role: "student",
          college: colleges[1]._id,
          firstName: "Carol",
          lastName: "Williams",
          phone: "+1-555-0121",
          officialId: "COS-ST-001",
          isEmailVerified: true,
          isActive: true,
          isApproved: true,
        },
      ]);
    } catch (err) {
      console.error("USER CREATE ERROR:");
      console.error(err);
      throw err;
    }

    console.log(`Created ${users.length} users`);

    // Create sample events
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

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
          registrationDeadline: tomorrow,
          requirements: ["laptop", "ID card"]
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
          requirements: ["Sports gear"]
        },
        {
          title: "Cultural Night",
          description: "An evening of music, dance, and drama.",
          category: "cultural",
          location: "Open Air Theater, IOT",
          startDate: today,
          endDate: new Date(today.getTime() + 5 * 60 * 60 * 1000),
          college: colleges[0]._id,
          createdBy: users[1]._id,
          isApproved: true,
          status: "ongoing"
        }
      ]);
      console.log(`Created ${events.length} events`);
    } catch (err) {
      console.error("EVENT CREATE ERROR:");
      console.error(err);
    }

    console.log("\n=== Seed Data Created Successfully ===");
    console.log("\n=== Login Credentials ===");
    console.log("System Admin:");
    console.log("  Email: admin@campuseventhub.com");
    console.log("  Password: password123");
    console.log("\nCollege Admin (IOT):");
    console.log("  Email: admin@iot.edu");
    console.log("  Password: password123");
    console.log("\nCollege Admin (COS):");
    console.log("  Email: admin@cos.edu");
    console.log("  Password: password123");
    console.log("\nStudents:");
    console.log("  Email: student1@iot.edu | student2@iot.edu | student1@cos.edu");
    console.log("  Password: password123");

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Seed error details:");
    console.error(error);
    process.exit(1);
  }
};

// Run seed function
seedData();
