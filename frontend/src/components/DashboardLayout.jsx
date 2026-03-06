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
    Briefcase
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
        <div className="flex min-h-screen w-full bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 hidden lg:flex flex-col z-30">
                <div className="p-6 border-b border-slate-100 mb-4">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Calendar className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">CampusHub</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`sidebar-link w-full ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-rose-600 hover:bg-rose-50"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl w-64 lg:w-96">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events, colleges..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-2xl border border-slate-100 overflow-hidden animate-fade-in">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <span className="font-bold text-slate-900">Notifications</span>
                                        {notifications.length > 0 && (
                                            <button onClick={markAllAsRead} className="text-xs text-indigo-600 font-medium hover:underline">Mark all as read</button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n._id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                    <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                                                    <p className="text-slate-500 text-xs mt-1">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <UserIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 flex-1 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
