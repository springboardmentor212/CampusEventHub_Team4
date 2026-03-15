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
    Home,
    Briefcase,
    Shield,
    Lock,
    Building2,
    Users,
    CheckCircle,
    BarChart2,
    Menu,
    X,
    UserCheck,
    FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import API from "../api/axios";

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            const notificationsList = res.data?.data?.notifications || [];
            setNotifications(notificationsList.filter(n => !n.isRead));
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.patch("/notifications/read");
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark read");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const NavContent = () => {
        const currentTab = new URLSearchParams(location.search).get('tab');

        const adminLinks = [
            { label: 'Overview', path: '/superadmin', icon: LayoutDashboard, tab: null },
            { label: 'Colleges', path: '/superadmin?tab=colleges', icon: Building2, tab: 'colleges' },
            { label: 'Events', path: '/superadmin?tab=events', icon: Calendar, tab: 'events' },
            { label: 'Analytics', path: '/superadmin?tab=analytics', icon: BarChart2, tab: 'analytics' },
            { label: 'Users', path: '/superadmin?tab=users', icon: Users, tab: 'users' },
            { label: 'Approvals', path: '/superadmin?tab=approvals', icon: CheckCircle, tab: 'approvals' },
        ];

        const collegeAdminLinks = [
            { label: 'Overview', path: '/admin', icon: LayoutDashboard, tab: null },
            { label: 'Registrations', path: '/admin?tab=registrations', icon: UserCheck, tab: 'registrations' },
            { label: 'Approvals', path: '/admin?tab=approvals', icon: Shield, tab: 'approvals' },
            { label: 'Feedback', path: '/admin?tab=feedback', icon: FileText, tab: 'feedback' },
        ];

        const secondaryLinks = [
            { label: 'Campus Feed', path: '/campus-feed', icon: Home, roles: ['student', 'college_admin'] },
            { label: 'Manage Events', path: '/manage-events', icon: Briefcase, roles: ['college_admin'], requiresApproved: true },
            { label: 'My Profile', path: '/profile', icon: UserIcon, roles: ['student', 'college_admin', 'admin'] },
            { label: 'Security', path: '/change-password', icon: Lock, roles: ['student', 'college_admin', 'admin'] },
        ];

        return (
            <>
                <div className="p-8 pb-10">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-100 shadow-lg">
                            <Calendar className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">CampusHub</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {user?.role === 'admin' && (
                        <>
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Platform Control</p>
                            {adminLinks.map(item => {
                                const isActive = location.pathname === '/superadmin' && currentTab === item.tab;
                                return (
                                    <button key={item.path} onClick={() => { navigate(item.path); setIsSidebarMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {user?.role === 'college_admin' && (
                        <>
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Administration</p>
                            {collegeAdminLinks.map(item => {
                                const isActive = location.pathname === '/admin' && currentTab === item.tab;
                                return (
                                    <button key={item.path} onClick={() => { navigate(item.path); setIsSidebarMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                );
                            })}
                        </>
                    )}

                    <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 mt-8">Navigation</p>
                    {secondaryLinks.filter(l => l.roles.includes(user?.role)).map(item => {
                        const isApproved = user?.role !== 'college_admin' || user?.isApproved;
                        if (item.requiresApproved && !isApproved) return null;

                        const isActive = location.pathname === item.path;
                        return (
                            <button key={item.path} onClick={() => { navigate(item.path); setIsSidebarMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
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
            </>
        );
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 hidden lg:flex flex-col z-30">
                <NavContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 w-72 bg-white z-50 transition-transform duration-300 lg:hidden flex flex-col ${isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="absolute right-4 top-4">
                    <button onClick={() => setIsSidebarMobileOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <NavContent />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between">
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsSidebarMobileOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="ml-4 flex items-center gap-2">
                            <Calendar className="text-indigo-600 w-5 h-5" />
                            <span className="font-bold text-lg tracking-tight text-slate-900">CampusHub</span>
                        </div>
                    </div>
                    <div className="flex-1" />

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
                                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
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
                                <p className="text-sm font-black text-slate-900 leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest ${user?.role === 'admin' ? 'bg-slate-900 text-white' :
                                        user?.role === 'college_admin' ? 'bg-indigo-600 text-white' :
                                            'bg-emerald-500 text-white'
                                    }`}>
                                    {{ admin: 'Superadmin', college_admin: 'Admin', student: 'Student' }[user?.role] || user?.role}
                                </span>
                            </div>
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100 shadow-sm">
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