import { useNavigate } from "react-router-dom";
import {
    Compass,
    ArrowRight,
    Search,
    Home,
    AlertCircle
} from "lucide-react";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="w-full max-w-2xl text-center space-y-8">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full blur-3xl opacity-50 scale-150 animate-pulse"></div>
                    <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
                        <Compass className="w-24 h-24 text-indigo-600 animate-spin-slow" />
                        <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-xl border-4 border-white shadow-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <span className="inline-badge">Error 404</span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                        Lost in <span className="text-indigo-600">Space.</span>
                    </h1>
                    <p className="max-w-md mx-auto text-slate-500 text-lg font-medium leading-relaxed">
                        The page you are looking for has been moved, deleted, or never existed in this campus digital ecosystem.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <button
                        onClick={() => navigate("/")}
                        className="hero-btn px-8 py-4 text-sm group min-w-[200px]"
                    >
                        Return Home
                        <Home className="w-4 h-4 ml-2" />
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-4 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2 group"
                    >
                        Go Back
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="pt-12 border-t border-slate-50 max-w-sm mx-auto">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search campus resources..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-indigo-100 placeholder:text-slate-400 text-sm italic"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
