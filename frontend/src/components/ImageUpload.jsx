import { useState, useRef } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

const ImageUpload = ({ label, onUpload, defaultValue = null }) => {
    const [preview, setPreview] = useState(defaultValue);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setUploading(true);
        const loadingToast = toast.loading("Uploading image...");

        try {
            const formData = new FormData();
            formData.append("image", file);
            const res = await API.post("/media/image", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const url = res.data.data.url;
            setPreview(url);
            // Use callback to avoid race conditions with parent state
            onUpload(url);
            toast.success("Image uploaded!", { id: loadingToast });
        } catch (err) {
            let msg = "Upload failed. Verify server protocol/connection.";
            if (err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err.code === 'ERR_NETWORK') {
                msg = "Network error: Backend may be down or CORS misconfigured.";
            } else if (err.request && !err.response) {
                msg = "No response from server. Check backend URL and CORS.";
            }
            toast.error(msg, { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setPreview(null);
        onUpload("");
    };

    return (
        <div className="space-y-4">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 leading-none">
                {label}
            </label>

            <div
                onClick={() => !uploading && fileInputRef.current.click()}
                className={`
                    relative group cursor-pointer overflow-hidden
                    bg-slate-50 border-2 border-dashed border-slate-200 
                    rounded-[2rem] min-h-[220px] transition-all duration-500
                    flex flex-col items-center justify-center gap-4
                    hover:bg-indigo-50/30 hover:border-indigo-200
                    ${preview ? 'border-solid border-slate-100 bg-white' : ''}
                `}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-[220px] object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage();
                                }}
                                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-rose-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-10 px-6 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all shadow-sm">
                            {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 mb-1">
                                {uploading ? "Uploading image..." : "Click to upload banner image"}
                            </p>
                            <p className="text-xs text-slate-500 max-w-[240px]">
                                SVG, PNG, JPG (Max. 5MB). Optimal ratio: 16:9
                            </p>
                        </div>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    tabIndex={-1}
                />
            </div>
        </div>
    );
};

export default ImageUpload;
