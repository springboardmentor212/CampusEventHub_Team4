import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        registrationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Registration",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// User can only give feedback once per event
feedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Backward-compatible aliases.
feedbackSchema.virtual("event").get(function () {
    return this.eventId;
});

feedbackSchema.virtual("user").get(function () {
    return this.userId;
});

feedbackSchema.virtual("comments").get(function () {
    return this.comment;
});

export const Feedback = mongoose.model("Feedback", feedbackSchema);
