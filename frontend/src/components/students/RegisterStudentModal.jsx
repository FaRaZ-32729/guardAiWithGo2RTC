import { useState, useRef, useCallback } from "react";
import {
    X, User, Mail, Hash, Phone, Users, Building2,
    Upload, ImagePlus, AlertTriangle, CheckCircle,
    UserPlus, Camera, RotateCcw, FlipHorizontal
} from "lucide-react";
import { api } from "../../config/AxiosInstance";

const INITIAL_FORM = {
    name: "",
    email: "",
    studentRollNumber: "",
    parentsEmail: "",
    parentsPhone: "",
    fatherName: "",
    department: "",
};

// ── Reusable field ────────────────────────────────────────────────────────
function Field({ label, name, type = "text", value, onChange, placeholder, icon: Icon, required, error }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                <Icon size={9} />
                {label}
                {required && <span className="text-red-500">*</span>}
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

// ── Main Modal ────────────────────────────────────────────────────────────
export default function RegisterStudentModal({ onClose, onSuccess }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [faceFile, setFaceFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Image mode: "idle" | "upload" | "capture"
    const [imageMode, setImageMode] = useState("idle");
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [mirrored, setMirrored] = useState(true);

    const fileRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // ── Handlers ──────────────────────────────────────────────────────────
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
        setErrors((prev) => ({ ...prev, face: "" }));
        setImageMode("upload");
    };

    // ── Camera helpers ────────────────────────────────────────────────────
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
        } catch {
            setCameraError("Camera access denied. Please allow camera permission.");
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
        setImageMode(preview ? "upload" : "idle");
        setCameraError("");
    };

    const handleCapture = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (mirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setFaceFile(file);
            setPreview(URL.createObjectURL(blob));
            setErrors((prev) => ({ ...prev, face: "" }));
        }, "image/jpeg", 0.92);

        stopCamera();
        setImageMode("upload"); // shows preview after capture
    };

    const handleReset = () => {
        setFaceFile(null);
        setPreview(null);
        setImageMode("idle");
        if (fileRef.current) fileRef.current.value = "";
    };

    
    const validate = () => {
        const errs = {};
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.name.trim()) errs.name = "Required";
        if (!emailRx.test(form.email)) errs.email = "Valid email required";
        if (!form.studentRollNumber.trim()) errs.studentRollNumber = "Required";
        if (!emailRx.test(form.parentsEmail)) errs.parentsEmail = "Valid email required";
        if (!form.parentsPhone.trim()) errs.parentsPhone = "Required";
        if (!form.fatherName.trim()) errs.fatherName = "Required";
        if (!form.department.trim()) errs.department = "Required";
        if (!faceFile) errs.face = "Face image is required";
        return errs;
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        const payload = new FormData();
        payload.append("studentRollNumber", form.studentRollNumber);
        payload.append("face", faceFile);
        Object.entries(form).forEach(([k, v]) => {
            if (k !== "studentRollNumber") payload.append(k, v);
        });

        setLoading(true);
        setApiError("");
        try {
            const { data } = await api.post("/student/register", payload);
            setSuccess(true);
            setTimeout(() => { onSuccess?.(data.student); onClose(); }, 1300);
        } catch (err) {
            setApiError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-[#0d0f16] border border-[#1e2535] rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2535] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <UserPlus size={16} className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-white text-sm font-bold tracking-wide">Register Student</h2>
                            <p className="text-slate-500 text-[11px] mt-0.5">Add a new student to the surveillance system</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { stopCamera(); onClose(); }}
                        disabled={loading}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1a2035] transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable body */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5 overflow-y-auto">

                    {/* Face Image Section */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                            <ImagePlus size={9} /> Face Image <span className="text-red-500">*</span>
                        </label>

                        {/* Camera view */}
                        {imageMode === "capture" && (
                            <div className="flex flex-col gap-2">
                                <div className="relative rounded-xl overflow-hidden bg-black border border-[#1e2535] h-52">
                                    {cameraError ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-2 text-red-400">
                                            <AlertTriangle size={20} />
                                            <p className="text-xs text-center px-4">{cameraError}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                                style={{ transform: mirrored ? "scaleX(-1)" : "none" }}
                                            />
                                            {/* Scan overlay */}
                                            <div className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg" />
                                                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg" />
                                                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg" />
                                                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg" />
                                            </div>
                                            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                <span className="text-red-400 text-[9px] font-bold uppercase tracking-widest">Live</span>
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Camera controls */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMirrored(m => !m)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a2035] border border-[#1e2535] text-slate-400 text-[11px] font-bold hover:text-slate-200 transition-all"
                                    >
                                        <FlipHorizontal size={13} /> Flip
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseCapture}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a2035] border border-[#1e2535] text-slate-400 text-[11px] font-bold hover:text-slate-200 transition-all"
                                    >
                                        <X size={13} /> Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCapture}
                                        disabled={!cameraActive || !!cameraError}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition-all disabled:opacity-40"
                                    >
                                        <Camera size={13} /> Capture Photo
                                    </button>
                                </div>
                            </div>
                        )}

                        {/*  Preview state */}
                        {imageMode !== "capture" && (
                            <>
                                {preview ? (
                                    /* Preview with replace options */
                                    <div className="flex gap-3 items-center p-3 rounded-xl bg-[#0a0c12] border border-cyan-500/20">
                                        <img
                                            src={preview}
                                            alt="Face preview"
                                            className="w-16 h-16 rounded-xl object-cover border border-cyan-500/20 shrink-0"
                                        />
                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                            <p className="text-white text-xs font-semibold flex items-center gap-1.5">
                                                <CheckCircle size={12} className="text-emerald-400" />
                                                Image selected
                                            </p>
                                            <p className="text-slate-500 text-[10px] truncate">{faceFile?.name}</p>
                                            <div className="flex gap-2 mt-1">
                                                <button type="button" onClick={() => fileRef.current?.click()}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a2035] border border-[#1e2535] text-slate-400 text-[10px] font-bold hover:text-slate-200 transition-all">
                                                    <Upload size={9} /> Replace
                                                </button>
                                                <button type="button" onClick={handleOpenCapture}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a2035] border border-[#1e2535] text-slate-400 text-[10px] font-bold hover:text-slate-200 transition-all">
                                                    <Camera size={9} /> Recapture
                                                </button>
                                                <button type="button" onClick={handleReset}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all">
                                                    <RotateCcw size={9} /> Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Two option tiles */
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Upload tile */}
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className={`flex flex-col items-center justify-center gap-2.5 h-28 rounded-xl border-2 border-dashed transition-all
                                                ${errors.face
                                                    ? "border-red-500/40 bg-red-500/5"
                                                    : "border-[#1e2535] bg-[#0a0c12] hover:border-cyan-500/30 hover:bg-cyan-500/5"
                                                }`}
                                        >
                                            <div className="p-2.5 rounded-xl bg-[#1a2035] border border-[#1e2535]">
                                                <Upload size={18} className="text-slate-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-300 text-[11px] font-semibold">Upload Photo</p>
                                                <p className="text-slate-600 text-[9px] mt-0.5">JPG, PNG · Max 5MB</p>
                                            </div>
                                        </button>

                                        {/* Capture tile */}
                                        <button
                                            type="button"
                                            onClick={handleOpenCapture}
                                            className={`flex flex-col items-center justify-center gap-2.5 h-28 rounded-xl border-2 border-dashed transition-all
                                                ${errors.face
                                                    ? "border-red-500/40 bg-red-500/5"
                                                    : "border-[#1e2535] bg-[#0a0c12] hover:border-cyan-500/30 hover:bg-cyan-500/5"
                                                }`}
                                        >
                                            <div className="p-2.5 rounded-xl bg-[#1a2035] border border-[#1e2535]">
                                                <Camera size={18} className="text-slate-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-300 text-[11px] font-semibold">Capture Photo</p>
                                                <p className="text-slate-600 text-[9px] mt-0.5">Use device camera</p>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleFile}
                            className="hidden"
                        />
                        {errors.face && (
                            <p className="text-red-400 text-[10px] flex items-center gap-1">
                                <AlertTriangle size={9} /> {errors.face}
                            </p>
                        )}
                    </div>

                    {/* Personal Info */}
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] border-b border-[#1e2535] pb-1.5">
                            Personal Information
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ahmed Raza" icon={User} required error={errors.name} />
                            <Field label="Father Name" name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="e.g. Raza Khan" icon={Users} required error={errors.fatherName} />
                            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="student@campus.edu" icon={Mail} required error={errors.email} />
                            <Field label="Roll Number" name="studentRollNumber" value={form.studentRollNumber} onChange={handleChange} placeholder="BS-CS-F21-001" icon={Hash} required error={errors.studentRollNumber} />
                        </div>
                    </div>

                    {/* Department */}
                    <Field
                        label="Department"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        placeholder="e.g. Computer Science"
                        icon={Building2}
                        required
                        error={errors.department}
                    />

                    {/* Parent Info */}
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] border-b border-[#1e2535] pb-1.5">
                            Parent / Guardian Information
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Parent Email" name="parentsEmail" type="email" value={form.parentsEmail} onChange={handleChange} placeholder="parent@email.com" icon={Mail} required error={errors.parentsEmail} />
                            <Field label="Parent Phone" name="parentsPhone" type="tel" value={form.parentsPhone} onChange={handleChange} placeholder="+92 300 0000000" icon={Phone} required error={errors.parentsPhone} />
                        </div>
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            <AlertTriangle size={14} className="shrink-0" /> {apiError}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            <CheckCircle size={14} className="shrink-0" /> Student registered successfully!
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1 pb-1">
                        <button
                            type="button"
                            onClick={() => { stopCamera(); onClose(); }}
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl border border-[#1e2535] text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-[#1a2035] hover:text-slate-200 transition-all disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                                ${loading || success
                                    ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 cursor-not-allowed"
                                    : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Registering...
                                </>
                            ) : success ? (
                                <><CheckCircle size={13} /> Registered!</>
                            ) : (
                                <><UserPlus size={13} /> Register Student</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}