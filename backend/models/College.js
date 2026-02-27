import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: "India" },
    pincode: { type: String, trim: true },
  },
  website: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  establishedYear: {
    type: Number,
  },
  type: {
    type: String,
    enum: ["engineering", "medical", "arts", "commerce", "science", "university", "other"],
    default: "other",
  },
  maxEventsPerMonth: {
    type: Number,
    default: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
collegeSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

// Virtual for full address
collegeSchema.virtual("fullAddress").get(function () {
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.state) parts.push(this.address.state);
  if (this.address.pincode) parts.push(this.address.pincode);
  if (this.address.country) parts.push(this.address.country);
  return parts.join(", ");
});

export const College = mongoose.model("College", collegeSchema);
