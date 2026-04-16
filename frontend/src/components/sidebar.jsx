import { NavLink } from "react-router-dom";
import { Home, Camera, Users, AlertTriangle, ChevronRight } from "lucide-react";

const tabs = [
    { to: "/home", label: "Home", icon: Home, badge: null },
    { to: "/cameras", label: "Cameras", icon: Camera, badge: "12" },
    { to: "/students", label: "Students", icon: Users, badge: null },
    { to: "/violations", label: "Violations", icon: AlertTriangle, badge: "3" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    return (
        <aside
            className={`
        fixed lg:static top-0 left-0 h-full z-30
        flex flex-col w-60 bg-[#0d0f16] border-r border-[#1e2535]
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}
        >
            {/* Spacer for mobile header */}
            <div className="lg:hidden h-14 shrink-0" />

            {/* Nav label */}
            <div className="px-4 pt-6 pb-2">
                <span className="text-[10px] text-slate-600 tracking-[0.25em] uppercase font-semibold">
                    Navigation
                </span>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-1 px-3 flex-1">
                {tabs.map(({ to, label, icon: Icon, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl relative
              transition-all duration-200 group border
              ${isActive
                                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                : "text-slate-500 hover:text-slate-200 hover:bg-[#1a2035] border-transparent"
                            }
            `}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full" />
                                )}

                                <Icon
                                    size={17}
                                    className={`shrink-0 transition-colors ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                                        }`}
                                />

                                <span className="flex-1 text-sm font-medium tracking-wide">{label}</span>

                                {isActive && <ChevronRight size={14} className="text-cyan-500/50" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}