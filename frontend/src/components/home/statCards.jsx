export default function StatCard({ title, value, icon: Icon, color, }) {
    const colors = {
        cyan: {
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
            icon: "text-cyan-400",
            value: "text-cyan-300",
            badge: "bg-cyan-500/10 text-cyan-400",
        },
        red: {
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            icon: "text-red-400",
            value: "text-red-300",
            badge: "bg-red-500/10 text-red-400",
        },
        amber: {
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            icon: "text-amber-400",
            value: "text-amber-300",
            badge: "bg-amber-500/10 text-amber-400",
        },
        emerald: {
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            icon: "text-emerald-400",
            value: "text-emerald-300",
            badge: "bg-emerald-500/10 text-emerald-400",
        },
    };

    const c = colors[color] || colors.cyan;

    return (
        <div
            className={`
        flex flex-col gap-3 p-5 rounded-2xl border ${c.border}
        bg-[#0d0f16] relative overflow-hidden
        hover:scale-[1.02] transition-transform duration-200 cursor-default
      `}
        >
            {/* Background */}
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.bg} blur-2xl opacity-60`} />

            {/* Icon + Trend */}
            <div className="flex items-start justify-between relative z-10">
                <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border}`}>
                    <Icon size={20} className={c.icon} />
                </div>
                <p className={`text-3xl font-bold tracking-tight ${c.value}`}>{value}</p>
            </div>

            {/* Value */}
            <div className="relative z-10">
                <p className="text-white text-sm font-semibold mt-0.5">{title}</p>
            </div>
        </div>
    );
}