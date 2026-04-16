import { useState } from "react";
import { X, Camera, Link, Tag, AlertTriangle, CheckCircle } from "lucide-react";
import { api } from "../../config/AxiosInstance";

const INITIAL_FORM = { cameraName: "", streamUrl: "" };

export default function AddCameraModal({ onClose, onSuccess }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const validate = () => {
        if (!form.streamUrl.trim()) return "Stream URL is required.";
        try { new URL(form.streamUrl); } catch { return "Please enter a valid stream URL."; }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        setError("");
        try {

            const rawUrl = form.streamUrl.trim();
            const streamUrl = rawUrl.endsWith("/video") ? rawUrl : `${rawUrl}/video`;

            const payload = {
                cameraName: form.cameraName.trim() || "ILMA-Cam",
                streamUrl,
            };

            const response = await api.post("/camera/add", payload);

            const data = response.data;

            setSuccess(true);
            setTimeout(() => {
                onSuccess?.(data.camera);
                onClose();
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to register camera. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#0d0f16] border border-[#1e2535] rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2535]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <Camera size={16} className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-white text-sm font-bold tracking-wide">Register Camera</h2>
                            <p className="text-slate-500 text-[11px] mt-0.5">Add a new camera to the surveillance network</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1a2035] transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">

                    {/* Camera Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-xs tracking-widest uppercase flex items-center gap-1.5">
                            <Tag size={10} /> Camera Name
                            <span className="text-slate-600 normal-case tracking-normal">(optional)</span>
                        </label>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#0a0c12] transition-all
                            ${form.cameraName ? "border-cyan-500/40" : "border-[#1e2535]"}
                            focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20`}>
                            <Camera size={14} className="text-slate-500 shrink-0" />
                            <input
                                type="text"
                                name="cameraName"
                                value={form.cameraName}
                                onChange={handleChange}
                                placeholder="e.g. Main Entrance CAM"
                                className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
                            />
                        </div>
                    </div>

                    {/* URL */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-xs tracking-widest uppercase flex items-center gap-1.5">
                            <Link size={10} /> Stream URL
                            <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#0a0c12] transition-all
                            ${form.streamUrl ? "border-cyan-500/40" : "border-[#1e2535]"}
                            ${error ? "border-red-500/40" : ""}
                            focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20`}>
                            <Link size={14} className="text-slate-500 shrink-0" />
                            <input
                                type="url"
                                name="streamUrl"
                                value={form.streamUrl}
                                onChange={handleChange}
                                placeholder="http://..."
                                className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
                            />
                        </div>
                        <p className="text-slate-600 text-[10px] pl-1">
                            Supports HTTPS stream URLs.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            <AlertTriangle size={14} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            <CheckCircle size={14} className="shrink-0" />
                            Camera registered successfully!
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl border border-[#1e2535] text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-[#1a2035] hover:text-slate-200 transition-all disabled:opacity-50"
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
                                <><Camera size={13} /> Register Camera</>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}