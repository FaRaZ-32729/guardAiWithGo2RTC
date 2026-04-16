import { useEffect, useState } from "react";
import { Shield, Eye, EyeOff, Lock, Mail, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login, loading, error, clearError, user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");
    const navigate = useNavigate();

    const displayError = localError || error;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");
        clearError();

        if (!email || !password) {
            setLocalError("Email and password are required.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLocalError("Please enter a valid email address.");
            return;
        }

        await login(email, password);


    };

    useEffect(() => {
        if (user) {
            navigate("/home", { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (setter) => (e) => {
        setter(e.target.value);
        setLocalError("");
        clearError();
    };

    return (
        <div className="flex min-h-screen w-full bg-[#0f1117] overflow-hidden relative">

            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            {/* ── Left panel ── */}
            <div className="hidden lg:flex flex-col justify-center items-center flex-1 p-10 relative z-10">
                <div className="flex flex-col gap-6 max-w-sm">

                    {/* Logo */}
                    <div className=" gap-3 flex mb-10">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                            <Shield size={18} className="text-cyan-400" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-white text-sm font-bold tracking-widest uppercase">Campus-Guard</span>
                            <span className="text-cyan-500 text-sm  uppercase">AI</span>

                        </div>
                    </div>

                    {/* para */}
                    <div>
                        <h2 className="text-white text-2xl font-bold tracking-tight leading-snug">
                            AI-Powered Campus<br />
                            <span className="text-cyan-400">Surveillance System</span>
                        </h2>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                            Real-time violation detection, student tracking — unified dashboard.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                        {["12 Live Cameras", "AI Detection", "Student Logs"].map((f) => (
                            <span
                                key={f}
                                className="text-[11px] text-cyan-400/70 border border-cyan-500/20 px-3 py-1 rounded-full bg-cyan-500/5"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>


            {/* Divider */}
            < div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-[#1e2535] to-transparent self-stretch my-10" />

            {/* ── Right panel ── */}
            < div className="flex flex-col justify-center items-center flex-1 px-6 sm:px-12 lg:px-16 py-12 relative z-10" >

                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-2 mb-10">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                        <Shield size={16} className="text-cyan-400" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-white text-sm font-bold tracking-widest uppercase">SafeWatch</span>
                        <span className="text-cyan-500 text-[10px] tracking-[0.2em] uppercase">Campus AI</span>
                    </div>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-8">

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-px bg-cyan-500/50" />
                            <span className="text-cyan-500 text-[10px] tracking-[0.25em] uppercase font-semibold">Secure Access</span>
                        </div>
                        <h1 className="text-white text-2xl font-bold tracking-tight">Admin Login</h1>
                        <p className="text-slate-500 text-sm">Sign in to access the AI-Campus-Guard dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-xs tracking-widest uppercase">Email Address</label>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#0d0f16] transition-all
                ${email ? "border-cyan-500/40" : "border-[#1e2535]"}
                focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20`}>
                                <Mail size={15} className="text-slate-500 shrink-0" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleChange(setEmail)}
                                    placeholder="admin@campus.edu"
                                    autoComplete="email"
                                    className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-xs tracking-widest uppercase">Password</label>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#0d0f16] transition-all
                ${password ? "border-cyan-500/40" : "border-[#1e2535]"}
                focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20`}>
                                <Lock size={15} className="text-slate-500 shrink-0" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={handleChange(setPassword)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-600 hover:text-slate-300 transition-colors shrink-0">
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {displayError && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                <AlertTriangle size={14} className="shrink-0" />
                                {displayError}
                            </div>
                        )}

                        {/* <div className="flex justify-end">
                            <button type="button" className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">
                                Forgot password?
                            </button>
                        </div> */}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300
                ${loading
                                    ? "bg-cyan-500/20 border border-cyan-500/20 text-cyan-600 cursor-not-allowed"
                                    : "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-400/50 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/10"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                <><Shield size={15} /> Sign In</>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-700 text-[11px] leading-relaxed">
                        Session expires after 7 days · Unauthorized access is strictly prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
}