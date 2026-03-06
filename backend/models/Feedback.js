import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comments: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// User can only give feedback once per event
feedbackSchema.index({ event: 1, user: 1 }, { unique: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
