import { Shield, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { api } from "../config/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);

        try {
            const response = await api.delete("/auth/logout");

            console.log("Logout response:", response.data);

            if (response.data?.success) {
                console.log("Logout successful from server");
            }

        } catch (error) {
            console.error("Logout API failed:", error.message);
        } finally {
            logout();

            // Redirect to login page and prevent back navigation
            navigate("/login", { replace: true });

            setLoggingOut(false);
        }
    };

    return (
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0d0f16] border-b border-[#1e2535] z-30 shrink-0">

            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-[#1a2035] transition-all"
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                        <Shield size={16} className="text-cyan-400" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-white text-sm font-bold tracking-widest uppercase">
                            Campus-Guard
                        </span>
                        <span className="text-cyan-500 text-[10px] tracking-[0.2em] uppercase">
                            AI
                        </span>
                    </div>
                </div>
            </div>

            {/* Logout button */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all
                        ${loggingOut
                            ? "bg-transparent border-[#1e2535] text-slate-600 cursor-not-allowed"
                            : "bg-transparent border-[#1e2535] text-slate-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                        }`}
                >
                    {loggingOut ? (
                        <>
                            <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span className="hidden sm:inline">Signing out...</span>
                        </>
                    ) : (
                        <>
                            <LogOut size={14} />
                            <span className="hidden sm:inline">Logout</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}