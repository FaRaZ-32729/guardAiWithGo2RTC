import { Users, AlertTriangle, UserX, Cctv, RefreshCw } from "lucide-react";
import StatCard from "../components/home/statCards";
import RecentViolations from "../components/home/recentViolation";
import ViolationChart from "../components/home/violationChart";
import { useCamera } from "../context/CameraContext";
import { useStudent } from "../context/StudentContext";
import { useChallan } from "../context/ChallanContext ";
import { useEffect } from "react";

function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-[#1e2535] bg-[#0d0f16] p-4 flex flex-col gap-3 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <div className="h-2.5 w-20 rounded bg-[#1e2535]" />
                    <div className="h-7 w-16 rounded bg-[#1e2535]" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#1e2535]" />
            </div>
            <div className="h-2 w-14 rounded bg-[#1e2535]" />
        </div>
    );
}

export default function Home() {
    const { cameras, loading: camLoading, getAllCameras } = useCamera();
    const { students, loading: stuLoading, getAllStudents } = useStudent();
    const { challans, loading: chalLoading, getAllChallans } = useChallan();

    const loading = camLoading || stuLoading || chalLoading;

    useEffect(() => {
        getAllCameras();
        getAllStudents();
        getAllChallans();
    }, []);

    const handleRefresh = () => {
        getAllCameras();
        getAllStudents();
        getAllChallans();
    };

    // Derived stats
    const onlineCameras = cameras.filter(c => c.status === "online").length;
    const todayStr = new Date().toDateString();
    const violatorsToday = challans.filter(
        c => c.challanIssueDate && new Date(c.challanIssueDate).toDateString() === todayStr
    ).length;
    const recentChallans = [...challans]
        .sort((a, b) => new Date(b.challanIssueDate) - new Date(a.challanIssueDate))
        .slice(0, 4);

    const statCards = [
        { title: "Total Cameras", value: cameras.length.toLocaleString(), icon: Cctv, color: "emerald" },
        { title: "Total Students", value: students.length.toLocaleString(), icon: Users, color: "cyan" },
        { title: "Total Violations", value: challans.length.toLocaleString(), icon: AlertTriangle, color: "red" },
        { title: "Violators Today", value: violatorsToday.toLocaleString(), icon: UserX, color: "amber" },
    ];

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        {loading ? "Fetching live data..." : "Real-time surveillance active"}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0d0f16] border border-[#1e2535] text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-cyan-400 hover:border-cyan-500/30 transition-all disabled:opacity-40"
                >
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : statCards.map(s => <StatCard key={s.title} {...s} />)
                }
            </div>

            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 min-w-0">
                    <ViolationChart challans={challans} loading={chalLoading} />
                </div>
                <div className="xl:w-80 shrink-0">
                    <RecentViolations violations={recentChallans} loading={chalLoading} />
                </div>
            </div>
        </div>
    );
}
