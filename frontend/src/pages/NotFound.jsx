import { useNavigate } from "react-router-dom";
import {
    Compass,
    ArrowRight,
    Search,
    Home,
    AlertCircle,
    RotateCcw,
    Sparkles,
    Zap,
    Map
} from "lucide-react";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-fade-in relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-50/50 rounded-full blur-[10rem] -translate-y-1/2 translate-x-1/2 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-amber-50/50 rounded-full blur-[8rem] translate-y-1/2 -translate-x-1/2 -z-10"></div>

            <div className="w-full max-w-2xl text-center space-y-12">
                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-indigo-600/10 rounded-[3rem] blur-3xl opacity-50 scale-150 animate-pulse group-hover:scale-175 transition-transform duration-1000"></div>
                    <div className="relative bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transform group-hover:rotate-6 transition-transform duration-700">
                        <Compass className="w-24 h-24 text-indigo-600 animate-spin-slow opacity-90" />
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-rose-500 text-white rounded-2xl border-8 border-white shadow-2xl flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-amber-400 text-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
                            <Zap className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full italic">Status 404</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Asset Missing</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic">
                        Navigational <span className="text-indigo-600">Anomaly.</span>
                    </h1>
                    <p className="max-w-md mx-auto text-slate-500 text-xl font-medium leading-relaxed italic opacity-80">
                        The resource requested has been archived or relocated within the campus digital infrastructure.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                    <button
                        onClick={() => navigate("/")}
                        className="hero-btn px-10 py-6 text-xs italic group min-w-[240px] shadow-3xl shadow-indigo-100/50"
                    >
                        <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Return Home Base
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3 group border border-transparent hover:border-slate-100 rounded-3xl"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                        Undo Navigation
                    </button>
                </div>

                <div className="pt-20 border-t border-slate-50 max-w-sm mx-auto flex flex-col items-center gap-6 opacity-60">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Powered by Campus Engine 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
