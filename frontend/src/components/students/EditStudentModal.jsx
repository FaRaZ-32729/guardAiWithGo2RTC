import { useState, useRef, useCallback } from "react";
import {
    X, User, Mail, Hash, Building2,
    Upload, ImagePlus, AlertTriangle, CheckCircle,
    Pencil, Camera, RotateCcw, FlipHorizontal
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";


function Field({ label, name, type = "text", value, onChange, placeholder, icon: Icon, error }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                <Icon size={9} /> {label}
            </label>
            <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border bg-[#0a0c12] transition-all
                ${error ? "border-red-500/40" : value ? "border-cyan-500/40" : "border-[#1e2535]"}
                focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20`}>
                <Icon size={13} className="text-slate-500 shrink-0" />
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-white text-xs placeholder-slate-600 outline-none"
                />
            </div>
            {error && (
                <p className="text-red-400 text-[10px] flex items-center gap-1">
                    <AlertTriangle size={9} /> {error}
                </p>
            )}
        </div>
    );
}


export default function EditStudentModal({ student, onClose }) {
    const { updateStudent } = useStudent();
    const fileRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [form, setForm] = useState({
        name: student.name || "",
        email: student.email || "",
        studentRollNumber: student.studentRollNumber || "",
        parentsEmail: student.parentsEmail || "",
        department: student.department || "",
    });

    const [faceFile, setFaceFile] = useState(null);
    const [preview, setPreview] = useState(student.face || null);
    const [isNewImage, setIsNewImage] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // "idle" | "options" | "capture"
    const [imageMode, setImageMode] = useState("idle");
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [mirrored, setMirrored] = useState(true);

    
    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        setApiError("");
    };

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(file.type)) {
            setErrors((prev) => ({ ...prev, face: "Only JPG, JPEG, PNG allowed." }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, face: "Image must be under 5 MB." }));
            return;
        }
        setFaceFile(file);
        setPreview(URL.createObjectURL(file));
        setIsNewImage(true);
        setErrors((prev) => ({ ...prev, face: "" }));
        setImageMode("idle");
    };

   
    const startCamera = useCallback(async () => {
        setCameraError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCameraActive(true);
        } catch (err) {
            const messages = {
                NotAllowedError: "Camera permission denied. Allow access in your browser address bar.",
                NotFoundError: "No camera found on this device.",
                NotReadableError: "Camera is already in use by another application.",
                OverconstrainedError: "Camera doesn't support the requested settings.",
            };
            setCameraError(messages[err.name] || `Camera error: ${err.message}`);
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setCameraActive(false);
    }, []);

    const handleOpenCapture = () => {
        setImageMode("capture");
        setTimeout(() => startCamera(), 100);
    };

    const handleCloseCapture = () => {
        stopCamera();
        setImageMode("idle");
        setCameraError("");
    };

    const handleCapture = () => {
        const video = videoRef.current;
        if (!video) return;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (mirrored) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setFaceFile(file);
            setPreview(URL.createObjectURL(blob));
            setIsNewImage(true);
            setErrors((prev) => ({ ...prev, face: "" }));
        }, "image/jpeg", 0.92);
        stopCamera();
        setImageMode("idle");
    };

    const handleResetImage = () => {
        setFaceFile(null);
        setPreview(student.face || null);
        setIsNewImage(false);
        setImageMode("idle");
        if (fileRef.current) fileRef.current.value = "";
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        const payload = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) payload.append(k, v); });
        if (faceFile) payload.append("face", faceFile);
        setLoading(true);
        const result = await updateStudent(student._id, payload);
        setLoading(false);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => { stopCamera(); onClose(); }, 1200);
        } else {
            setApiError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#0d0f16] border border-[#1e2535] rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2535] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <Pencil size={15} className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-white text-sm font-bold tracking-wide">Edit Student</h2>
                            <p className="text-slate-500 text-[11px] mt-0.5">Update student information</p>
                        </div>
                    </div>
                    <button onClick={() => { stopCamera(); onClose(); }} disabled={loading}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1a2035] transition-all">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5 overflow-y-auto">

                    {/* ── Face Image ── */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                            <ImagePlus size={9} /> Face Image
                            <span className="text-slate-600 normal-case tracking-normal ml-1">(optional)</span>
                        </label>

                        {/* Camera view */}
                        {imageMode === "capture" && (
                            <div className="flex flex-col gap-2">
                                <div className="relative rounded-xl overflow-hidden bg-black border border-[#1e2535] h-48">
                                    {cameraError ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-2 text-red-400 px-4 text-center">
                                            <AlertTriangle size={20} />
                                            <p className="text-xs">{cameraError}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <video
                                                ref={videoRef}
                                                autoPlay playsInline muted
                                                className="w-full h-full object-cover"
                                                style={{ transform: mirrored ? "scaleX(-1)" : "none" }}
                                            />
                                            {/* Corner brackets */}
                                            <div className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg" />
                                                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg" />
                                                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg" />
                                                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg" />
                                            </div>
                                            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                <span className="text-red-400 text-[9px] font-bold uppercase tracking-widest">Live</span>
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setMirrored(m => !m)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a2035] border border-[#1e2535] text-slate-400 text-[11px] font-bold hover:text-slate-200 transition-all">
                                        <FlipHorizontal size={12} /> Flip
                                    </button>
                                    <button type="button" onClick={handleCloseCapture}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a2035] border border-[#1e2535] text-slate-400 text-[11px] font-bold hover:text-slate-200 transition-all">
                                        <X size={12} /> Cancel
                                    </button>
                                    <button type="button" onClick={handleCapture}
                                        disabled={!cameraActive || !!cameraError}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition-all disabled:opacity-40">
                                        <Camera size={12} /> Capture Photo
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Preview / options */}
                        {imageMode !== "capture" && (
                            <>
                                {preview ? (
                                    // if image then show it
                                    <div className="flex gap-3 items-center p-3 rounded-xl bg-[#0a0c12] border border-cyan-500/20">
                                        <img src={preview} alt="preview"
                                            className="w-14 h-14 rounded-xl object-cover border border-cyan-500/20 shrink-0" />
                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                            <p className="text-white text-xs font-semibold flex items-center gap-1.5">
                                                <CheckCircle size={11} className="text-emerald-400" />
                                                {isNewImage ? "New image selected" : "Current photo"}
                                            </p>
                                            {isNewImage && faceFile && (
                                                <p className="text-slate-500 text-[10px] truncate">{faceFile.name}</p>
                                            )}
                                            <div className="flex gap-2 mt-0.5">
                                                <button type="button" onClick={() => fileRef.current?.click()}
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1a2035] border border-[#1e2535] text-slate-400 text-[10px] font-bold hover:text-slate-200 transition-all">
                                                    <Upload size={9} /> Upload
                                                </button>
                                                <button type="button" onClick={handleOpenCapture}
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1a2035] border border-[#1e2535] text-slate-400 text-[10px] font-bold hover:text-slate-200 transition-all">
                                                    <Camera size={9} /> Capture
                                                </button>
                                                {isNewImage && (
                                                    <button type="button" onClick={handleResetImage}
                                                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all">
                                                        <RotateCcw size={9} /> Restore
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // if no image then show options
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => fileRef.current?.click()}
                                            className="flex flex-col items-center justify-center gap-2.5 h-24 rounded-xl border-2 border-dashed border-[#1e2535] bg-[#0a0c12] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all">
                                            <div className="p-2 rounded-xl bg-[#1a2035] border border-[#1e2535]">
                                                <Upload size={16} className="text-slate-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-300 text-[11px] font-semibold">Upload Photo</p>
                                                <p className="text-slate-600 text-[9px]">JPG, PNG · Max 5MB</p>
                                            </div>
                                        </button>
                                        <button type="button" onClick={handleOpenCapture}
                                            className="flex flex-col items-center justify-center gap-2.5 h-24 rounded-xl border-2 border-dashed border-[#1e2535] bg-[#0a0c12] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all">
                                            <div className="p-2 rounded-xl bg-[#1a2035] border border-[#1e2535]">
                                                <Camera size={16} className="text-slate-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-300 text-[11px] font-semibold">Capture Photo</p>
                                                <p className="text-slate-600 text-[9px]">Use device camera</p>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFile} className="hidden" />
                        {errors.face && (
                            <p className="text-red-400 text-[10px] flex items-center gap-1">
                                <AlertTriangle size={9} /> {errors.face}
                            </p>
                        )}
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Ahmed Raza" icon={User} error={errors.name} />
                        <Field label="Roll Number" name="studentRollNumber" value={form.studentRollNumber} onChange={handleChange} placeholder="BS-CS-F21-001" icon={Hash} error={errors.studentRollNumber} />
                        <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="student@campus.edu" icon={Mail} type="email" error={errors.email} />
                        <Field label="Parent Email" name="parentsEmail" value={form.parentsEmail} onChange={handleChange} placeholder="parent@email.com" icon={Mail} type="email" error={errors.parentsEmail} />
                        <Field label="Department" name="department" value={form.department} onChange={handleChange} placeholder="Computer Science" icon={Building2} error={errors.department} />
                    </div>

                    {apiError && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            <AlertTriangle size={14} className="shrink-0" /> {apiError}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            <CheckCircle size={14} className="shrink-0" /> Student updated successfully!
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1 pb-1">
                        <button type="button" onClick={() => { stopCamera(); onClose(); }} disabled={loading}
                            className="flex-1 py-2.5 rounded-xl border border-[#1e2535] text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-[#1a2035] hover:text-slate-200 transition-all disabled:opacity-40">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || success}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                                ${loading || success
                                    ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 cursor-not-allowed"
                                    : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300"}`}>
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : success ? (
                                <><CheckCircle size={13} /> Saved!</>
                            ) : (
                                <><Pencil size={13} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}