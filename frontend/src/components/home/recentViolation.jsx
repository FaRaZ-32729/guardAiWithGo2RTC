import { useNavigate } from "react-router-dom";
import { AlertTriangle, Cigarette, Swords, ArrowRight, Clock } from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2.5 animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-[#1e2535] shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-2.5 w-24 rounded bg-[#1e2535]" />
        <div className="h-2 w-16 rounded bg-[#1e2535]" />
      </div>
      <div className="h-4 w-12 rounded-full bg-[#1e2535]" />
    </div>
  );
}

export default function RecentViolations({ violations = [], loading = false }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col rounded-2xl bg-[#0d0f16] border border-[#1e2535] overflow-hidden h-full">

      {/* Header */}
      <div className="flex items-center justify-center px-4 py-3.5 border-b border-[#1e2535]">
        <div>
          <h2 className="text-white text-sm font-bold tracking-tight">Recent Violations</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">Latest 4 incidents</p>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-[#1e2535] px-4 flex-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : violations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-700">
            <AlertTriangle size={24} />
            <p className="text-xs">No violations yet</p>
          </div>
        ) : (
          violations.slice(0, 4).map((v) => {
            const isAnon = v.isAnonymous;
            const name = isAnon ? "Anonymous" : (v.studentId?.name || "Unknown");
            const roll = v.studentId?.studentRollNumber;
            const isSmoking = v.violationType === "smoking";

            return (
              <div key={v._id} className="flex items-center gap-3 py-3">

                {/* Icon */}
                <div className={`p-2 rounded-xl shrink-0 ${isSmoking
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                  {isSmoking
                    ? <Cigarette size={14} />
                    : <Swords size={14} />
                  }
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-white text-xs font-semibold truncate">{name}</span>
                  <span className="text-slate-500 text-[10px] truncate">
                    {roll ? `#${roll}` : "Unregistered"}
                    {" · "}
                    <span className="capitalize">{v.violationType}</span>
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-slate-600 text-[10px] shrink-0">
                  <Clock size={9} />
                  {formatDate(v.challanIssueDate)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {!loading && violations.length > 0 && (
        <button
          onClick={() => navigate("/violations")}
          className="flex items-center justify-center gap-2 py-3 border-t border-[#1e2535] text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-cyan-400 hover:bg-cyan-500/5 transition-all"
        >
          View All Violations <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}