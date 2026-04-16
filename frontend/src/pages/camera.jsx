import { useRef, useEffect, useState } from "react";
import { Camera, Trash2, VideoOff, Maximize2, X, LayoutGrid, Rows2, Square } from "lucide-react";
import AddCameraModal from "../components/camera/AddCamera";
import { useCamera } from "../context/CameraContext";

function CameraStream({ cam }) {
    const [imgError, setImgError] = useState(false);
    const containerRef = useRef(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setDims({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setImgError(false); // reset → img re-renders → onError fires again if still down
            setRetryKey(k => k + 1);
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden">
            {!imgError ? (
                <img
                    key={retryKey}
                    src={cam.streamUrl}
                    alt={cam.cameraName}
                    onError={() => setImgError(true)}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: dims.h,
                        height: dims.w,
                        transform: "translate(-50%, -50%) rotate(270deg)",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0c12]">
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)" }} />
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-16 h-16 rounded-full bg-red-500/5 border border-red-500/10 animate-ping" />
                        <div className="relative p-4 rounded-2xl bg-[#0d0f16] border border-red-500/20">
                            <VideoOff size={22} className="text-red-500/60" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-red-400/70 text-[10px] font-black uppercase tracking-[0.2em]">No Signal</span>
                        <span className="text-slate-700 text-[9px] tracking-widest uppercase">Feed Unavailable</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// expands to fit full screen
function FullscreenModal({ cam, onClose }) {
    const [imgError, setImgError] = useState(false);
    const containerRef = useRef(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setDims({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl bg-[#0d0f16] border border-[#1e2535] rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2535]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Live</span>
                        </div>
                        <span className="text-white text-sm font-semibold">{cam.cameraName}</span>
                        <span className="text-slate-500 text-xs font-mono truncate max-w-xs">{cam.streamUrl}</span>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a2035] transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div
                    ref={containerRef}
                    className="relative bg-black overflow-hidden"
                    style={{ aspectRatio: "16/9" }}
                >
                    {!imgError ? (
                        <img
                            src={cam.streamUrl}
                            alt={cam.cameraName}
                            onError={() => setImgError(true)}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: dims.h,
                                height: dims.w,
                                transform: "translate(-50%, -50%) rotate(270deg)",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center absolute inset-0 gap-3 text-slate-600">
                            <Camera size={44} />
                            <p className="text-sm">Stream unavailable</p>
                        </div>
                    )}

                    {/* Corner brackets */}
                    <div className="absolute inset-5 pointer-events-none z-10">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/30 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/30 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/30 rounded-br-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// grid layout
const LAYOUTS = [
    { id: "grid", icon: LayoutGrid, label: "Grid", cols: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", height: "h-40" },
    { id: "medium", icon: Rows2, label: "Medium", cols: "grid-cols-1 sm:grid-cols-2", height: "h-64" },
    { id: "large", icon: Square, label: "Large", cols: "grid-cols-1", height: "h-96" },
];


export default function Cameras() {
    const { cameras, deleteCamera, getAllCameras } = useCamera();
    const [showModal, setShowModal] = useState(false);
    const [fullscreenCam, setFullscreenCam] = useState(null);
    const [layoutId, setLayoutId] = useState("grid");

    const handleCameraAdded = () => getAllCameras();
    const layout = LAYOUTS.find(l => l.id === layoutId);

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-white text-xl font-bold tracking-tight">Camera Feed</h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        {cameras.length === 0
                            ? "No cameras registered"
                            : `${cameras.filter(c => c.status === "online").length} of ${cameras.length} cameras online`
                        }
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start flex-wrap">

                    {/* Layout toggle */}
                    {cameras.length > 0 && (
                        <div className="flex items-center p-1 rounded-xl bg-[#0d0f16] border border-[#1e2535] gap-0.5">
                            {LAYOUTS.map(({ id, icon: Icon, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setLayoutId(id)}
                                    title={`${label} view`}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                                        ${layoutId === id
                                            ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                                            : "text-slate-500 hover:text-slate-300 border border-transparent"
                                        }`}
                                >
                                    <Icon size={11} /> {label}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-all cursor-pointer"
                    >
                        <Camera size={15} /> Add Camera
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {cameras.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-5 py-20 px-6">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-24 h-24 rounded-full border border-slate-700/40 animate-ping opacity-20" />
                        <div className="absolute w-16 h-16 rounded-full border border-slate-700/50 animate-ping opacity-30" style={{ animationDelay: "0.4s" }} />
                        <div className="relative p-5 rounded-2xl bg-[#0d0f16] border border-[#1e2535]">
                            <VideoOff size={28} className="text-slate-600" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 text-center max-w-xs">
                        <h3 className="text-white text-sm font-bold tracking-wide">No Cameras Registered</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            The surveillance network has no active feeds. Register a camera to begin real-time monitoring.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-all"
                    >
                        <Camera size={14} /> Register First Camera
                    </button>
                </div>

            ) : (
                <div className={`grid ${layout.cols} gap-4 transition-all duration-300`}>
                    {cameras.map((cam) => (
                        <div
                            key={cam._id}
                            className="flex flex-col rounded-2xl border border-[#1e2535] bg-[#0d0f16] overflow-hidden hover:border-cyan-500/30 transition-all group"
                        >
                            {/* Stream area */}
                            <div className={`relative ${layout.height} bg-[#0a0c12] overflow-hidden transition-all duration-300`}>

                                <CameraStream cam={cam} />

                                {/* Fullscreen button */}
                                <button
                                    onClick={() => setFullscreenCam(cam)}
                                    className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-black/50 border border-white/10 text-white/50 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Maximize2 size={12} />
                                </button>
                            </div>

                            {/* Info row */}
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-white text-xs font-semibold truncate">{cam.cameraName}</p>
                                    <p className="text-slate-500 text-[11px] truncate">{cam.streamUrl}</p>
                                </div>
                                <Trash2
                                    size={15}
                                    className="text-slate-600 hover:text-red-400 cursor-pointer transition-colors shrink-0 ml-3"
                                    onClick={() => deleteCamera(cam._id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <AddCameraModal onClose={() => setShowModal(false)} onSuccess={handleCameraAdded} />
            )}
            {fullscreenCam && (
                <FullscreenModal cam={fullscreenCam} onClose={() => setFullscreenCam(null)} />
            )}
        </div>
    );
}   