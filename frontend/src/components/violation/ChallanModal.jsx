import { useRef, useState } from "react";
import { X, Download, Shield, Printer, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../../config/AxiosInstance";

// ── Helpers ───────────────────────────────────────────────────────────────
const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

function numberToWords(n) {
    if (!n || n === 0) return "Zero";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const toW = (x) => {
        if (x === 0) return "";
        if (x < 20) return ones[x];
        if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
        if (x < 1000) return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + toW(x % 100) : "");
        if (x < 100000) return toW(Math.floor(x / 1000)) + " Thousand" + (x % 1000 ? " " + toW(x % 1000) : "");
        return toW(Math.floor(x / 100000)) + " Lakh" + (x % 100000 ? " " + toW(x % 100000) : "");
    };
    return toW(Math.floor(n));
}

// style
const S = {
    slip: {
        display: "flex", flexDirection: "column", background: "#ffffff",
        color: "#111827", fontFamily: "'Courier New', monospace",
        fontSize: "11px", width: "100%", minHeight: "600px",
        border: "1px solid #d1d5db",
    },
    accentTop: {
        height: "6px",
        background: "linear-gradient(to right, #0d1117, #0891b2, #0d1117)",
    },
    accentBottom: {
        height: "4px",
        background: "linear-gradient(to right, #0d1117, #0891b2, #0d1117)",
    },
    header: {
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "10px 8px 8px", borderBottom: "1px solid #d1d5db",
        gap: "4px", textAlign: "center", overflow: "hidden",
    },
    subText: { fontSize: "9px", color: "#6b7280", lineHeight: "1.4" },
    challanBadge: {
        marginTop: "4px", padding: "2px 8px",
        border: "1px solid #6b7280", fontSize: "8px",
        fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#374151",
        textAlign: "center", wordBreak: "break-word", maxWidth: "100%",
    },
    copyBar: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 12px", background: "#f3f4f6",
        borderBottom: "1px solid #d1d5db",
    },
    copyLabel: { fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#4b5563" },
    challanNo: { fontSize: "9px", fontWeight: 700, color: "#6b7280", fontFamily: "monospace" },
    section: { display: "flex", flexDirection: "column", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" },
    sectionTitle: { fontSize: "8px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9ca3af", marginBottom: "6px" },
    row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "3px 0", borderBottom: "1px dashed #f3f4f6", gap: "8px" },
    rowLabel: { fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0, marginRight: "8px" },
    rowVal: (highlight) => ({ fontSize: "10px", fontWeight: 700, textAlign: "right", color: highlight ? "#dc2626" : "#111827", wordBreak: "break-all", overflowWrap: "anywhere" }),
    feeRow: { display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px dashed #d1d5db", fontSize: "10px" },
    feeTotalRow: { display: "flex", justifyContent: "space-between", padding: "6px 0 2px", fontSize: "11px" },
    spacer: { flex: 1 },
    sigRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "8px 12px", borderTop: "1px solid #d1d5db" },
    sigBox: { display: "flex", flexDirection: "column", gap: "4px" },
    sigLine: { width: "96px", borderTop: "1px solid #9ca3af", marginTop: "24px" },
    sigText: { fontSize: "8px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" },
    stampWrap: { display: "flex", justifyContent: "center", paddingBottom: "8px" },
    stamp: {
        width: "52px", height: "52px", borderRadius: "50%",
        border: "1px dashed #d1d5db", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: "7px", color: "#d1d5db", textAlign: "center",
        lineHeight: "1.3", textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px",
    },
    footer: { padding: "6px 12px", background: "#f9fafb", borderTop: "1px solid #e5e7eb", textAlign: "center" },
};

// ── Single slip ───────────────────────────────────────────────────────────
function ChallanSlip({ v, copyLabel }) {
    const student = v.studentId || {};
    const isAnon = v.isAnonymous;
    const prev = v.previousChallanBalance || 0;
    const curr = v.currentChallan || 0;
    const total = v.payableAmount || (prev + curr);
    const challanNo = v.challanId || v._id?.slice(-8).toUpperCase();

    return (
        <div style={{ ...S.slip, position: "relative" }}>
            {/* ── PAID stamp overlay ── */}
            {v.status === "paid" && (
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 10,
                    pointerEvents: "none",
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%) rotate(-30deg)",
                        border: "5px solid rgba(16,185,129,0.75)",
                        borderRadius: "8px",
                        padding: "8px 20px",
                        color: "rgba(16,185,129,0.75)",
                        fontSize: "44px",
                        fontWeight: 900,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        fontFamily: "'Courier New', monospace",
                        lineHeight: 1,
                        userSelect: "none",
                        whiteSpace: "nowrap",
                    }}>
                        PAID
                    </div>
                </div>
            )}
            <div style={S.accentTop} />

            {/* Header */}
            <div style={S.header}>
                <img src="/logo.png" alt="ILMA University" crossOrigin="anonymous"
                    style={{ height: "38px", objectFit: "contain", maxWidth: "100%", marginBottom: "4px" }} />
                <p style={S.subText}>Disciplinary Committee · Campus Security Division</p>
                <div style={{ fontSize: "8px", color: "#374151", marginTop: "2px", textAlign: "center", lineHeight: "1.5" }}>
                    <span style={{ fontWeight: 600 }}>Pay Order in favor of: <span style={{ fontWeight: 900, color: "#111827" }}>ILMA UNIVERSITY</span></span>
                    &nbsp;·&nbsp;<span style={{ fontWeight: 600 }}>NTN: <span style={{ fontWeight: 900, color: "#111827" }}>#2840979-9</span></span>
                </div>
                <div style={S.challanBadge}>Violation Fine Challan</div>
            </div>

            {/* Copy label + Challan ID */}
            <div style={S.copyBar}>
                <span style={S.copyLabel}>[{copyLabel}]</span>
                <span style={S.challanNo}>#{challanNo}</span>
            </div>

            {/* Dates & Type */}
            <div style={S.section}>
                <DataRow label="Issue Date" val={formatDate(v.challanIssueDate)} />
                <DataRow label="Due Date" val={formatDate(v.challanDueDate)} highlight />
                <DataRow label="Violation" val={v.violationType?.toUpperCase() || "N/A"} />
                <DataRow label="Status" val={(v.status || "N/A").toUpperCase()} />
            </div>

            {/* Student info */}
            <div style={S.section}>
                <p style={S.sectionTitle}>{isAnon ? "Person Information" : "Student Information"}</p>
                {isAnon ? (
                    <DataRow label="Identity" val="ANONYMOUS / UNREGISTERED" />
                ) : (
                    <>
                        <DataRow label="Name" val={student.name || "N/A"} />
                        <DataRow label="Father's Name" val={student.fatherName || "N/A"} />
                        <DataRow label="Roll No." val={student.studentRollNumber || "N/A"} />
                        <DataRow label="Dept." val={student.department || "N/A"} />
                        <DataRow label="Email" val={student.email || "N/A"} />
                    </>
                )}
            </div>

            {/* Fee breakdown */}
            {!isAnon && (
                <div style={S.section}>
                    <p style={S.sectionTitle}>Fee Breakdown</p>
                    <div style={S.feeRow}>
                        <span style={{ color: "#6b7280" }}>Previous Balance</span>
                        <span style={{ fontWeight: 700, fontFamily: "monospace" }}>PKR {prev.toLocaleString()}</span>
                    </div>
                    <div style={S.feeRow}>
                        <span style={{ color: "#6b7280", textTransform: "capitalize" }}>{v.violationType} Fine</span>
                        <span style={{ fontWeight: 700, fontFamily: "monospace" }}>PKR {curr.toLocaleString()}</span>
                    </div>
                    <div style={S.feeTotalRow}>
                        <span style={{ fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Payable</span>
                        <span style={{ fontWeight: 900, fontFamily: "monospace", textDecoration: "underline" }}>PKR {total.toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: "8px", color: "#6b7280", marginTop: "2px" }}>
                        ({numberToWords(total)} Rupees Only)
                    </p>
                </div>
            )}

            <div style={S.spacer} />

            {/* Signatures */}
            <div style={S.sigRow}>
                <div style={S.sigBox}>
                    <div style={S.sigLine} />
                    <span style={S.sigText}>Student Signature</span>
                </div>
                <div style={{ ...S.sigBox, alignItems: "flex-end" }}>
                    <div style={S.sigLine} />
                    <span style={S.sigText}>Authorized Officer</span>
                </div>
            </div>

            {/* Stamp */}
            <div style={S.stampWrap}>
                <div style={S.stamp}>Official{"\n"}Stamp</div>
            </div>

            {/* Footer */}
            <div style={S.footer}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginBottom: "3px" }}>
                    Powered by:
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b7280" }}>
                        Campus-Guard AI
                    </span>
                </div>
            </div>

            <div style={S.accentBottom} />
        </div>
    );
}

function DataRow({ label, val, highlight }) {
    return (
        <div style={S.row}>
            <span style={S.rowLabel}>{label}</span>
            <span style={S.rowVal(highlight)}>{val}</span>
        </div>
    );
}

function buildPrintHTML(challanRef) {
    const node = challanRef.current.cloneNode(true);
    return `<!DOCTYPE html>
<html><head>
    <meta charset="UTF-8"/>
    <title>Challan</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #fff; }
        @media print {
            @page { margin: 6mm; size: A4 landscape; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>${node.outerHTML}</body></html>`;
}

// ── Main Modal ────────────────────────────────────────────────────────────
export default function ChallanModal({ v, onClose, onStatusChange }) {
    const challanRef = useRef(null);
    const [dlLoading, setDlLoading] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(v.status);

    const isPaid = currentStatus === "paid";

    // status logic
    const handleMarkPaid = async () => {
        if (isPaid) return;
        setStatusLoading(true);
        try {
            const res = await api.put(`/challan/update/${v._id}/status`, { status: "paid" });
            setCurrentStatus("paid");
            onStatusChange?.(v._id, "paid"); // update parent list
            console.log("Challan marked as paid:", res.data.message);
        } catch (err) {
            console.error("Status update failed:", err.response?.data?.message || err.message);
            alert(err.response?.data?.message || "Failed to update status");
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDownload = async () => {
        setDlLoading(true);
        try {
            const { default: html2canvas } = await import("html2canvas");
            const canvas = await html2canvas(challanRef.current, {
                scale: 2.5, backgroundColor: "#ffffff",
                useCORS: true, allowTaint: false, logging: false, imageTimeout: 15000,
            });
            const link = document.createElement("a");
            link.download = `challan-${v.challanId || v._id?.slice(-8).toUpperCase()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } finally {
            setDlLoading(false);
        }
    };

    const handlePrint = () => {
        setPrintLoading(true);
        const win = window.open("", "_blank", "width=1050,height=700");
        win.document.write(buildPrintHTML(challanRef));
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); setPrintLoading(false); }, 600);
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)", overflowY: "auto", padding: "16px" }}>
            <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px", minHeight: "100%" }}>

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
                    style={{ background: "#0d0f16", border: "1px solid #1e2535", flexShrink: 0 }}>

                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                            <Shield size={15} className="text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold tracking-wide">Violation Fine Challan</p>
                            <p className="text-slate-500 text-[10px]">
                                #{v.challanId || v._id?.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">

                        {/* status button */}
                        <button
                            onClick={handleMarkPaid}
                            disabled={isPaid || statusLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:cursor-not-allowed"
                            style={{
                                background: isPaid ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                border: `1px solid ${isPaid ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                                color: isPaid ? "#34d399" : "#f87171",
                                opacity: isPaid ? 0.7 : 1,
                            }}>
                            {statusLoading
                                ? <Loader2 size={13} className="animate-spin" />
                                : <CheckCircle2 size={13} />}
                            {statusLoading ? "Updating..." : isPaid ? "Paid" : "Mark as Paid"}
                        </button>

                        <button onClick={handleDownload} disabled={dlLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#22d3ee" }}>
                            {dlLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                            {dlLoading ? "Saving..." : "Download"}
                        </button>

                        <button onClick={handlePrint} disabled={printLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                            style={{ background: "#1a2035", border: "1px solid #1e2535", color: "#94a3b8" }}>
                            {printLoading ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />}
                            Print
                        </button>

                        <button onClick={onClose} className="p-2 rounded-xl transition-all"
                            style={{ border: "1px solid #1e2535", color: "#64748b" }}>
                            <X size={15} />
                        </button>
                    </div>
                </div>

                {/* Three-copy challan */}
                <div ref={challanRef}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>

                    <ChallanSlip v={{ ...v, status: currentStatus }} copyLabel="Office Copy" />

                    <div style={{ position: "relative", borderLeft: "2px dashed #9ca3af", borderRight: "2px dashed #9ca3af" }}>
                        <ChallanSlip v={{ ...v, status: currentStatus }} copyLabel="Student Copy" />
                        <span style={{ position: "absolute", top: "6px", left: "50%", transform: "translateX(-50%)", fontSize: "12px", color: "#d1d5db" }}>✂</span>
                        <span style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", fontSize: "12px", color: "#d1d5db" }}>✂</span>
                    </div>

                    <ChallanSlip v={{ ...v, status: currentStatus }} copyLabel="Bank Copy" />
                </div>

            </div>
        </div>
    );
}