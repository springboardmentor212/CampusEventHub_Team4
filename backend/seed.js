import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { College } from "./models/College.js";

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await College.deleteMany({});
    console.log("Cleared existing data");

    // Create sample colleges
    const colleges = await College.create([
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

    console.log(`Created ${colleges.length} colleges`);

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = await User.create([
      {
        username: "admin_user",
        email: "admin@campuseventhub.com",
        password: hashedPassword,
        role: "admin",
        college: colleges[0]._id,
        firstName: "System",
        lastName: "Administrator",
        phone: "+1-555-0001",
        isEmailVerified: true,
        isActive: true,
      },
      {
        username: "college_admin_1",
        email: "admin@iot.edu",
        password: hashedPassword,
        role: "college_admin",
        college: colleges[0]._id,
        firstName: "College",
        lastName: "Admin",
        phone: "+1-555-0101",
        isEmailVerified: true,
        isActive: true,
      },
      {
        username: "college_admin_2",
        email: "admin@cos.edu",
        password: hashedPassword,
        role: "college_admin",
        college: colleges[1]._id,
        firstName: "Science",
        lastName: "Admin",
        phone: "+1-555-0102",
        isEmailVerified: true,
        isActive: true,
      },
      {
        username: "student_1",
        email: "student1@iot.edu",
        password: hashedPassword,
        role: "student",
        college: colleges[0]._id,
        firstName: "Alice",
        lastName: "Johnson",
        phone: "+1-555-0111",
        isEmailVerified: true,
        isActive: true,
      },
      {
        username: "student_2",
        email: "student2@iot.edu",
        password: hashedPassword,
        role: "student",
        college: colleges[0]._id,
        firstName: "Bob",
        lastName: "Smith",
        phone: "+1-555-0112",
        isEmailVerified: true,
        isActive: true,
      },
      {
        username: "student_3",
        email: "student1@cos.edu",
        password: hashedPassword,
        role: "student",
        college: colleges[1]._id,
        firstName: "Carol",
        lastName: "Williams",
        phone: "+1-555-0121",
        isEmailVerified: true,
        isActive: true,
      },
    ]);

    console.log(`Created ${users.length} users`);

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
    console.error("Seed error:", error);
    process.exit(1);
  }
};

// Run seed function
seedData();
