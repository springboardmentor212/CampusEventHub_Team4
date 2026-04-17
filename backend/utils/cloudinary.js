import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if Cloudinary is configured
const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== "" &&
    process.env.CLOUDINARY_API_KEY !== "";

let upload;

if (hasCloudinary) {
    // ─── Cloudinary Storage ─────────────────────────────────────────────────────
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: "campus-event-hub",
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            transformation: [{ width: 1200, height: 675, crop: "limit" }],
        },
    });

    upload = multer({ storage });
    console.log("✅ Image storage: Cloudinary");
} else {
    // ─── Local Disk Storage Fallback ─────────────────────────────────────────────
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const diskStorage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${unique}${path.extname(file.originalname)}`);
        },
    });

    // Multer middleware for disk
    const diskUpload = multer({
        storage: diskStorage,
        fileFilter: (_req, file, cb) => {
            const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            if (allowed.includes(file.mimetype)) cb(null, true);
            else cb(new Error("Only image files are allowed"), false);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    });

    // Wrap to normalise req.file.path to a URL the frontend can use
    upload = {
        single: (fieldName) => (req, res, next) => {
            diskUpload.single(fieldName)(req, res, (err) => {
                if (err) return next(err);
                if (req.file) {
                    // Expose a URL-like path so the media route can use req.file.path
                    const relativePath = `/uploads/${req.file.filename}`;
                    const firstFrontend = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
                    req.file.path = `${firstFrontend.replace("5173", "5000") || "http://localhost:5000"}${relativePath}`;
                }
                next();
            });
        },
    };

    console.log("⚠️  Cloudinary not configured — using local disk storage for images.");
}

export { upload };
export default cloudinary;
