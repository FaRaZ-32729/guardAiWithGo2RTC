import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

// 7 days chart data 
function buildChartData(challans) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      dateStr: d.toDateString(),
      smoking: 0,
      fighting: 0,
    });
  }

  challans.forEach((c) => {
    if (!c.challanIssueDate) return;
    const ds = new Date(c.challanIssueDate).toDateString();
    const day = days.find(d => d.dateStr === ds);
    if (!day) return;
    if (c.violationType === "smoking") day.smoking++;
    if (c.violationType === "fighting") day.fighting++;
  });

  return days.map(({ label, smoking, fighting }) => ({ label, smoking, fighting }));
}

// bar custom hover card
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0f16] border border-[#1e2535] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5 font-bold uppercase tracking-widest text-[10px]">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-400 capitalize">{p.name}</span>
          <span className="text-white font-bold ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// main
export default function ViolationChart({ challans, loading = false }) {
  const safe = Array.isArray(challans) ? challans : [];
  const data = useMemo(() => buildChartData(safe), [safe]);
  const totalWeek = safe.filter(c => {
    if (!c.challanIssueDate) return false;
    const d = new Date(c.challanIssueDate);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[#0d0f16] border border-[#1e2535] h-full">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-white text-sm font-bold tracking-tight">Violations — Last 7 Days</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {loading ? "Loading..." : `${totalWeek} incidents this week`}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/80" /> Smoking
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-400/80" /> Fighting
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0" style={{ height: 220 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <div className="flex items-end gap-2">
                {[40, 70, 50, 90, 60, 80, 45].map((h, i) => (
                  <div key={i} className="w-6 rounded-t bg-[#1e2535]" style={{ height: h }} />
                ))}
              </div>
              <div className="h-2 w-32 rounded bg-[#1e2535]" />
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={3} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e2535"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={24}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(30,37,53,0.6)" }} />
              <Bar dataKey="smoking" fill="rgba(251,191,36,0.75)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fighting" fill="rgba(248,113,113,0.75)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}


