import express from "express";
import { upload } from "../utils/cloudinary.js";
import { authenticate, canManageEvents } from "../middleware/auth.js";

const router = express.Router();

// Upload an image (returns a Cloudinary URL)
router.post("/image", authenticate, canManageEvents, upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No image uploaded" });
    }
    res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
            url: req.file.path, // Cloudinary URL
            publicId: req.file.filename,
        },
    });
});

export default router;
