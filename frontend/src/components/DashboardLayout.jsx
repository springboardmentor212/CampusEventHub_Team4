import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
    LayoutDashboard,
    Calendar,
    PlusCircle,
    Settings,
    LogOut,
    Bell,
    User as UserIcon,
    Search,
    Home,
    Briefcase,
    Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import API from "../api/axios";

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data.data.notifications.filter(n => !n.isRead));
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.patch("/notifications/mark-all-read");
            setNotifications([]);
        } catch (err) {
            console.error("Failed to mark read");
        }
    };

    const menuItems = [
        {
            label: "Control Panel",
            path: '/admin',
            icon: LayoutDashboard,
            roles: ['admin']
        },
        {
            label: "Dashboard",
            path: '/college-admin',
            icon: LayoutDashboard,
            roles: ['college_admin']
        },
        {
            label: "Events Feed",
            path: '/student',
            icon: Home,
            roles: ['student', 'college_admin', 'admin']
        },
        {
            label: "Create Event",
            path: "/create-event",
            icon: PlusCircle,
            roles: ['college_admin', 'admin'],
            requiresApproved: true
        },
        {
            label: "Manage Events",
            path: "/manage-events",
            icon: Briefcase,
            roles: ['college_admin', 'admin'],
            requiresApproved: true
        },
    ].filter(item => {
        const hasRole = item.roles.includes(user?.role);
        const isApproved = user?.role !== 'college_admin' || user?.isApproved;
        return hasRole && (!item.requiresApproved || isApproved);
    });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 hidden lg:flex flex-col z-30">
                <div className="p-8 pb-10">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-100 shadow-lg">
                            <Calendar className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">CampusHub</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Main Menu</p>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 font-medium text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between">
                    <div className="flex-1 flex items-center max-w-2xl">
                        <div className="relative group w-full max-w-md hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="w-full pl-11 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/10 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all relative"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
                                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                        <span className="font-bold text-xs text-slate-900 uppercase tracking-widest">Inbox</span>
                                        {notifications.length > 0 && (
                                            <button onClick={markAllAsRead} className="text-[10px] text-indigo-600 font-bold hover:underline">Clear All</button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-xs font-medium">
                                                No new notifications.
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n._id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                    <p className="font-bold text-slate-900 text-sm">{n.title}</p>
                                                    <p className="text-slate-500 text-xs mt-1">{n.message}</p>
                                                    <p className="text-[10px] font-semibold text-slate-400 mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center border border-indigo-200">
                                <UserIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-7xl mx-auto w-full flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

