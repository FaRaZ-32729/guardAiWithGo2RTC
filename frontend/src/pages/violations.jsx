// import { useEffect, useState } from "react";
// import {
//     AlertTriangle, Clock, Search, X,
//     Cigarette, Swords, CheckCircle, XCircle,
//     FileText, Hash, ZoomIn, User
// } from "lucide-react";
// import { useChallan } from "../context/ChallanContext ";
// import ChallanModal from "../components/violation/challanModal";

// const severityMap = {
//     smoking: { icon: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
//     fighting: { icon: "bg-red-500/10 text-red-400 border border-red-500/20" },
// };

// const statusConfig = {
//     unpaid: { label: "Unpaid", cls: "bg-red-500/10 text-red-400 border border-red-500/20" },
//     paid: { label: "Paid", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
//     overdue: { label: "Overdue", cls: "bg-rose-600/10 text-rose-400 border border-rose-500/30" },
//     null: { label: "N/A", cls: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
// };

// const FILTERS = [
//     { id: "all", label: "All" },
//     { id: "smoking", label: "Smoking", icon: Cigarette },
//     { id: "fighting", label: "Fighting", icon: Swords },
//     { id: "registered", label: "Registered", icon: CheckCircle },
//     { id: "Anonymous", label: "Anonymous", icon: XCircle },
// ];

// const formatDate = (dateStr) => {
//     if (!dateStr) return "N/A";
//     return new Date(dateStr).toLocaleDateString("en-GB", {
//         day: "2-digit", month: "short", year: "numeric"
//     });
// };

// // ── Single unified image URL resolver ────────────────────────────────────
// const toImageUrl = (filePath) => {
//     if (!filePath) return null;
//     if (filePath.startsWith("http")) return filePath;
//     const filename = filePath.split(/[/\\]/).pop();
//     return `http://localhost:5053/violations/${filename}`;
// };

// // ── Lightbox ──────────────────────────────────────────────────────────────
// function Lightbox({ src, label, onClose }) {
//     useEffect(() => {
//         const handler = (e) => { if (e.key === "Escape") onClose(); };
//         window.addEventListener("keydown", handler);
//         return () => window.removeEventListener("keydown", handler);
//     }, [onClose]);

//     return (
//         <div
//             className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
//             onClick={onClose}
//         >
//             <div
//                 className="relative max-w-2xl w-full flex flex-col items-center gap-3"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <button
//                     onClick={onClose}
//                     className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-[#0d0f16] border border-[#1e2535] text-slate-400 hover:text-white transition-colors"
//                 >
//                     <X size={14} />
//                 </button>
//                 <img
//                     src={src}
//                     alt={label}
//                     className="w-full max-h-[75vh] object-contain rounded-2xl border border-[#1e2535] shadow-2xl"
//                 />
//                 {label && (
//                     <p className="text-slate-500 text-xs uppercase tracking-widest">{label}</p>
//                 )}
//             </div>
//         </div>
//     );
// }

// // ── Clickable thumbnail ───────────────────────────────────────────────────
// function ThumbImage({ src, alt, label, className = "" }) {
//     const [open, setOpen] = useState(false);
//     const [err, setErr] = useState(false);

//     if (!src || err) {
//         return (
//             <div className={`flex items-center justify-center bg-[#0a0c12] border border-[#1e2535] rounded-xl ${className}`}>
//                 <User size={16} className="text-slate-700" />
//             </div>
//         );
//     }

//     return (
//         <>
//             <div
//                 className={`relative group cursor-zoom-in overflow-hidden rounded-xl border border-slate-700 hover:border-cyan-500/40 transition-all ${className}`}
//                 onClick={() => setOpen(true)}
//             >
//                 <img
//                     src={src}
//                     alt={alt}
//                     onError={() => setErr(true)}
//                     className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
//                     <ZoomIn size={15} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
//                 </div>
//             </div>
//             {open && <Lightbox src={src} label={label} onClose={() => setOpen(false)} />}
//         </>
//     );
// }

// // ── Main Page ─────────────────────────────────────────────────────────────
// export default function Violations() {
//     const { challans, loading, getAllChallans } = useChallan();
//     const [activeFilter, setActiveFilter] = useState("all");
//     const [search, setSearch] = useState("");
//     const [selectedChallan, setSelectedChallan] = useState(null);


//     console.log(challans)

//     useEffect(() => {
//         if (challans.length === 0) getAllChallans();
//     }, []);

//     const filtered = challans.filter((v) => {
//         const matchFilter =
//             activeFilter === "all" ? true :
//                 activeFilter === "smoking" ? v.violationType === "smoking" :
//                     activeFilter === "fighting" ? v.violationType === "fighting" :
//                         activeFilter === "registered" ? !v.isAnonymous :
//                             activeFilter === "Anonymous" ? v.isAnonymous : true;

//         const q = search.toLowerCase();
//         const name = v.isAnonymous ? "anonymous" : (v.studentId?.name || "");
//         const roll = v.studentId?.studentRollNumber || "";
//         const matchSearch = !q || name.toLowerCase().includes(q) || roll.toLowerCase().includes(q) || v._id.includes(q);

//         return matchFilter && matchSearch;
//     });



//     return (
//         <div className="flex flex-col gap-5 p-4 sm:p-6">

//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                 <div>
//                     <h1 className="text-white text-xl font-bold tracking-tight">Violations Log</h1>
//                     <p className="text-slate-500 text-xs mt-0.5">
//                         {filtered.length} of {challans.length} incidents · AI-detected
//                     </p>
//                 </div>
//             </div>

//             {/* Search + Filters */}
//             <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0d0f16] border border-[#1e2535] focus-within:border-cyan-500/40 transition-all flex-1 sm:max-w-xs">
//                     <Search size={14} className="text-slate-500 shrink-0" />
//                     <input
//                         type="text"
//                         placeholder="Search student, roll no..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="flex-1 bg-transparent text-white text-xs placeholder-slate-600 outline-none"
//                     />
//                     {search && (
//                         <button onClick={() => setSearch("")} className="text-slate-600 hover:text-slate-400">
//                             <X size={12} />
//                         </button>
//                     )}
//                 </div>

//                 <div className="flex items-center gap-1.5 flex-wrap">
//                     {FILTERS.map(({ id, label, icon: Icon }) => (
//                         <button key={id} onClick={() => setActiveFilter(id)}
//                             className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border
//                             ${activeFilter === id
//                                     ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
//                                     : "bg-[#0d0f16] border-[#1e2535] text-slate-500 hover:text-slate-300 hover:border-[#2a3550]"}`}>
//                             {Icon && <Icon size={11} />}
//                             {label}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Cards */}
//             <div className="flex flex-col gap-3">
//                 {loading ? (
//                     <div className="flex items-center justify-center py-16 text-slate-600 text-sm">Loading...</div>
//                 ) : filtered.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-700">
//                         <AlertTriangle size={32} />
//                         <p className="text-sm">No violations match your filters.</p>
//                     </div>
//                 ) : filtered.map((v) => {
//                     const isAnon = v.isAnonymous;
//                     const cfg = severityMap[v.violationType] || severityMap.smoking;
//                     const studentName = isAnon ? "Anonymous Person" : (v.studentId?.name || "Unknown");
//                     const roll = v.studentId?.studentRollNumber;
//                     // unified: one function, one folder for both evidence + face
//                     const imageUrl = toImageUrl(v.evidenceImage);

//                     return (
//                         <div key={v._id}
//                             className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-[#0d0f16] border border-[#1e2535] hover:border-[#2a3550] transition-all">

//                             {/* Type icon */}
//                             <div className={`p-2.5 rounded-xl self-start shrink-0 ${cfg.icon}`}>
//                                 <AlertTriangle size={18} />
//                             </div>

//                             {/* Info */}
//                             <div className="flex flex-col flex-1 min-w-0 gap-1">
//                                 <div className="flex flex-wrap items-center gap-2">
//                                     <span className="text-white text-sm font-bold">{studentName}</span>
//                                     <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border
//                                         ${v.violationType === "smoking"
//                                             ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
//                                             : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
//                                         {v.violationType === "smoking" ? <Cigarette size={9} /> : <Swords size={9} />}
//                                         {v.violationType}
//                                     </span>
//                                     <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border
//                                         ${!isAnon
//                                             ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
//                                             : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
//                                         {!isAnon ? <CheckCircle size={9} /> : <XCircle size={9} />}
//                                         {!isAnon ? "Registered" : "Anonymous"}
//                                     </span>
//                                 </div>
//                                 <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
//                                     {!isAnon && roll && (
//                                         <span className="flex items-center gap-1"><Hash size={10} />{roll}</span>
//                                     )}
//                                     <span className="flex items-center gap-1">
//                                         <Clock size={10} />{formatDate(v.challanIssueDate)}
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* ── Center: person image (click to expand) ── */}
//                             <ThumbImage
//                                 src={imageUrl}
//                                 alt={isAnon ? "Evidence" : studentName}
//                                 label={isAnon ? "Evidence Image" : studentName}
//                                 className="w-16 h-16 shrink-0"
//                             />

//                             {/* ── Right: status + challan button ── */}
//                             <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-wrap shrink-0">
//                                 {v.isChallanGenerated ? (
//                                     <>
//                                         <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusConfig[v.status]?.cls || statusConfig.null.cls}`}>
//                                             {statusConfig[v.status]?.label || "N/A"}
//                                         </span>
//                                         <button
//                                             onClick={() => setSelectedChallan(v)}
//                                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition-all">
//                                             <FileText size={12} /> View Challan
//                                         </button>
//                                     </>
//                                 ) : (
//                                     <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
//                                         Violation Only
//                                     </span>
//                                 )}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {selectedChallan && (
//                 <ChallanModal
//                     v={selectedChallan}
//                     onClose={() => setSelectedChallan(null)}
//                     onStatusChange={(id, status) => {
//                         // update challans list in context or local state
//                         getAllChallans();
//                     }}
//                 />
//             )}
//         </div>
//     );
// }



import { useEffect, useState } from "react";
import {
    AlertTriangle, Clock, Search, X,
    Cigarette, Swords, CheckCircle, XCircle,
    FileText, Hash, ZoomIn, User, CalendarDays
} from "lucide-react";
import { useChallan } from "../context/ChallanContext ";
import ChallanModal from "../components/violation/challanModal";

const severityMap = {
    smoking: { icon: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
    fighting: { icon: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const statusConfig = {
    unpaid: { label: "Unpaid", cls: "bg-red-500/10 text-red-400 border border-red-500/20" },
    paid: { label: "Paid", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
    overdue: { label: "Overdue", cls: "bg-rose-600/10 text-rose-400 border border-rose-500/30" },
    null: { label: "N/A", cls: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
};

const FILTERS = [
    { id: "all", label: "All" },
    { id: "smoking", label: "Smoking", icon: Cigarette },
    { id: "fighting", label: "Fighting", icon: Swords },
    { id: "registered", label: "Registered", icon: CheckCircle },
    { id: "Anonymous", label: "Anonymous", icon: XCircle },
];

const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
};

const toImageUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;
    const filename = filePath.split(/[/\\]/).pop();
    return `http://localhost:5053/violations/${filename}`;
};

const todayStr = new Date().toISOString().split("T")[0];

// ── Lightbox ──────────────────────────────────────────────────────────────
function Lightbox({ src, label, onClose }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="relative max-w-2xl w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-[#0d0f16] border border-[#1e2535] text-slate-400 hover:text-white transition-colors">
                    <X size={14} />
                </button>
                <img src={src} alt={label} className="w-full max-h-[75vh] object-contain rounded-2xl border border-[#1e2535] shadow-2xl" />
                {label && <p className="text-slate-500 text-xs uppercase tracking-widest">{label}</p>}
            </div>
        </div>
    );
}

// ── Clickable thumbnail ───────────────────────────────────────────────────
function ThumbImage({ src, alt, label, className = "" }) {
    const [open, setOpen] = useState(false);
    const [err, setErr] = useState(false);

    if (!src || err) {
        return (
            <div className={`flex items-center justify-center bg-[#0a0c12] border border-[#1e2535] rounded-xl ${className}`}>
                <User size={16} className="text-slate-700" />
            </div>
        );
    }

    return (
        <>
            <div className={`relative group cursor-zoom-in overflow-hidden rounded-xl border border-slate-700 hover:border-cyan-500/40 transition-all ${className}`} onClick={() => setOpen(true)}>
                <img src={src} alt={alt} onError={() => setErr(true)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                    <ZoomIn size={15} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
            </div>
            {open && <Lightbox src={src} label={label} onClose={() => setOpen(false)} />}
        </>
    );
}

// ── Date input ────────────────────────────────────────────────────────────
function DateInput({ label, value, onChange, min, max }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-slate-600 text-[10px] uppercase tracking-widest px-1">{label}</span>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d0f16] border border-[#1e2535] focus-within:border-cyan-500/40 transition-all">
                <CalendarDays size={13} className="text-slate-500 shrink-0" />
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    min={min}
                    max={max}
                    className="bg-transparent text-white text-xs outline-none cursor-pointer"
                    style={{ colorScheme: "dark" }}
                />
                {value && (
                    <button onClick={() => onChange("")} className="text-slate-600 hover:text-slate-400 ml-1">
                        <X size={11} />
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function Violations() {
    const { challans, loading, getAllChallans } = useChallan();
    const [activeFilter, setActiveFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedChallan, setSelectedChallan] = useState(null);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        if (challans.length === 0) getAllChallans();
    }, []);

    const filtered = challans.filter((v) => {
        const matchFilter =
            activeFilter === "all" ? true :
                activeFilter === "smoking" ? v.violationType === "smoking" :
                    activeFilter === "fighting" ? v.violationType === "fighting" :
                        activeFilter === "registered" ? !v.isAnonymous :
                            activeFilter === "Anonymous" ? v.isAnonymous : true;

        const q = search.toLowerCase();
        const name = v.isAnonymous ? "anonymous" : (v.studentId?.name || "");
        const roll = v.studentId?.studentRollNumber || "";
        const matchSearch = !q || name.toLowerCase().includes(q) || roll.toLowerCase().includes(q) || v._id.includes(q);

        let matchDate = true;
        if (dateFrom || dateTo) {
            const issueDate = v.challanIssueDate ? new Date(v.challanIssueDate) : null;
            if (!issueDate) {
                matchDate = false;
            } else {
                if (dateFrom) matchDate = matchDate && issueDate >= new Date(dateFrom);
                if (dateTo) {
                    const toEnd = new Date(dateTo);
                    toEnd.setHours(23, 59, 59, 999);
                    matchDate = matchDate && issueDate <= toEnd;
                }
            }
        }

        return matchFilter && matchSearch && matchDate;
    });

    const hasDateFilter = dateFrom || dateTo;

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-white text-xl font-bold tracking-tight">Violations Log</h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        {filtered.length} of {challans.length} incidents · AI-detected
                    </p>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col gap-3">

                {/* Row 1: search + type filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0d0f16] border border-[#1e2535] focus-within:border-cyan-500/40 transition-all flex-1 sm:max-w-xs">
                        <Search size={14} className="text-slate-500 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search student, roll no..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-white text-xs placeholder-slate-600 outline-none"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-slate-600 hover:text-slate-400">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {FILTERS.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setActiveFilter(id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border
                                ${activeFilter === id
                                        ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                                        : "bg-[#0d0f16] border-[#1e2535] text-slate-500 hover:text-slate-300 hover:border-[#2a3550]"}`}>
                                {Icon && <Icon size={11} />}
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Row 2: date range */}
                <div className="flex flex-wrap items-end gap-3">
                    <DateInput
                        label="From"
                        value={dateFrom}
                        onChange={(val) => {
                            setDateFrom(val);
                            // if new from > to, reset to
                            if (dateTo && val > dateTo) setDateTo("");
                        }}
                        max={dateTo || todayStr}
                    />
                    <DateInput
                        label="To"
                        value={dateTo}
                        onChange={setDateTo}
                        min={dateFrom || undefined}
                        max={todayStr}
                    />
                    {hasDateFilter && (
                        <button
                            onClick={() => { setDateFrom(""); setDateTo(""); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0d0f16] border border-[#1e2535] text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all self-end">
                            <X size={11} /> Clear Dates
                        </button>
                    )}
                    {hasDateFilter && (
                        <span className="text-slate-600 text-[11px] self-end pb-2">
                            Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                            {dateFrom && dateTo ? ` · ${dateFrom} → ${dateTo}` : dateFrom ? ` · from ${dateFrom}` : ` · until ${dateTo}`}
                        </span>
                    )}
                </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-600 text-sm">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-700">
                        <AlertTriangle size={32} />
                        <p className="text-sm">No violations match your filters.</p>
                    </div>
                ) : filtered.map((v) => {
                    const isAnon = v.isAnonymous;
                    const cfg = severityMap[v.violationType] || severityMap.smoking;
                    const studentName = isAnon ? "Anonymous Person" : (v.studentId?.name || "Unknown");
                    const roll = v.studentId?.studentRollNumber;
                    const imageUrl = toImageUrl(v.evidenceImage);

                    return (
                        <div key={v._id}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-[#0d0f16] border border-[#1e2535] hover:border-[#2a3550] transition-all">

                            <div className={`p-2.5 rounded-xl self-start shrink-0 ${cfg.icon}`}>
                                <AlertTriangle size={18} />
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-white text-sm font-bold">{studentName}</span>
                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border
                                        ${v.violationType === "smoking"
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                        {v.violationType === "smoking" ? <Cigarette size={9} /> : <Swords size={9} />}
                                        {v.violationType}
                                    </span>
                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border
                                        ${!isAnon
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                                        {!isAnon ? <CheckCircle size={9} /> : <XCircle size={9} />}
                                        {!isAnon ? "Registered" : "Anonymous"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                                    {!isAnon && roll && (
                                        <span className="flex items-center gap-1"><Hash size={10} />{roll}</span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />{formatDate(v.challanIssueDate)}
                                    </span>
                                </div>
                            </div>

                            <ThumbImage
                                src={imageUrl}
                                alt={isAnon ? "Evidence" : studentName}
                                label={isAnon ? "Evidence Image" : studentName}
                                className="w-16 h-16 shrink-0"
                            />

                            <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-wrap shrink-0">
                                {v.isChallanGenerated ? (
                                    <>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusConfig[v.status]?.cls || statusConfig.null.cls}`}>
                                            {statusConfig[v.status]?.label || "N/A"}
                                        </span>
                                        <button
                                            onClick={() => setSelectedChallan(v)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition-all">
                                            <FileText size={12} /> View Challan
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                        Violation Only
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedChallan && (
                <ChallanModal
                    v={selectedChallan}
                    onClose={() => setSelectedChallan(null)}
                    onStatusChange={() => getAllChallans()}
                />
            )}
        </div>
    );
}