import { useNavigate, useLocation } from "react-router-dom";
import { Shield, AlertTriangle, Home, ArrowLeft, Radio } from "lucide-react";

export default function PageNotFound() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-16 relative overflow-hidden">

            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                }}
            />

            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md">

                {/* Glitchy 404 */}
                <div className="relative select-none">
                    <span
                        className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter text-transparent"
                        style={{
                            WebkitTextStroke: "1px rgba(34,211,238,0.15)",
                        }}
                    >
                        404
                    </span>
                    {/* Cyan overlay with clip */}
                    <span
                        className="absolute inset-0 flex items-center justify-center text-[120px] sm:text-[160px] font-black leading-none tracking-tighter text-cyan-500/10"
                    >
                        404
                    </span>
                    {/* Red scan line */}
                    <div className="absolute left-0 right-0 h-[2px] bg-red-500/40 top-1/2 blur-[1px]" />
                </div>

                {/* Icon + label */}
                <div className="flex items-center gap-2 -mt-4">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertTriangle size={16} className="text-red-400" />
                    </div>
                    <span className="text-red-400 text-xs font-bold tracking-[0.3em] uppercase">
                        Access Point Not Found
                    </span>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-xl font-bold tracking-tight">
                        Zone Not Recognised
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        The surveillance system could not locate{" "}
                        <span className="text-cyan-500/70 font-mono text-xs bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                            {location.pathname}
                        </span>{" "}
                        in the campus map. This area may be restricted or does not exist.
                    </p>
                </div>

                {/* Animated radar pulse */}
                <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute w-16 h-16 rounded-full border border-cyan-500/10 animate-ping" />
                    <div className="absolute w-10 h-10 rounded-full border border-cyan-500/15 animate-ping" style={{ animationDelay: "0.3s" }} />
                    <div className="p-3 rounded-full bg-[#0d0f16] border border-cyan-500/20">
                        <Radio size={18} className="text-cyan-500/50" />
                    </div>
                </div>

                {/* Log line */}
                <div className="w-full px-4 py-3 rounded-xl bg-[#0d0f16] border border-[#1e2535] text-left">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Shield size={9} /> System Log
                    </p>
                    <p className="text-slate-500 text-[11px] font-mono leading-relaxed">
                        <span className="text-red-400/70">[ERR]</span> Route{" "}
                        <span className="text-cyan-400/60">{location.pathname}</span> not registered in router config.
                        <br />
                        <span className="text-slate-600/70">[SYS]</span> Redirecting to safe zone...
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <button
                        onClick={() => navigate("/home")}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-sm font-bold tracking-widest uppercase hover:bg-cyan-500/20 hover:border-cyan-400/40 transition-all"
                    >
                        <Home size={15} />
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#0d0f16] border border-[#1e2535] text-slate-400 text-sm font-bold tracking-widest uppercase hover:text-slate-200 hover:border-[#2a3550] transition-all"
                    >
                        <ArrowLeft size={15} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}