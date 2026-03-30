import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
    LayoutDashboard,
    Activity,
    Calendar,
    PlusCircle,
    Settings,
    LogOut,
    Bell,
    User as UserIcon,
    Compass,
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
import { normalizeRole } from "../utils/roleRoutes";

const DashboardLayout = ({ children, suppressAdminNav = false, pendingRegistrations = 0, pendingStudents = 0 }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
    const normalizedRole = normalizeRole(user?.role);

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
            { label: 'Platform Alerts', path: '/superadmin?tab=alerts', icon: Bell, tab: 'alerts' },
            { label: 'Admin Monitoring', path: '/superadmin?tab=monitoring', icon: Users, tab: 'monitoring' },
            { label: 'Event Moderation', path: '/superadmin?tab=moderation', icon: Shield, tab: 'moderation' },
            { label: 'Feedback Insights', path: '/superadmin?tab=feedback-insights', icon: BarChart2, tab: 'feedback-insights' },
            { label: 'Governance Logs', path: '/superadmin?tab=governance-logs', icon: Activity, tab: 'governance-logs' },
            { label: 'Colleges', path: '/superadmin?tab=colleges', icon: Building2, tab: 'colleges' },
            { label: 'Events', path: '/superadmin?tab=events', icon: Calendar, tab: 'events' },
            { label: 'Analytics', path: '/superadmin?tab=analytics', icon: BarChart2, tab: 'analytics' },
            { label: 'Users', path: '/superadmin?tab=users', icon: Users, tab: 'users' },
            { label: 'Approvals', path: '/superadmin?tab=approvals', icon: CheckCircle, tab: 'approvals' },
        ];

        const collegeAdminMainLinks = [
            { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, tab: null },
            { label: 'My Events', path: '/admin?tab=events', icon: Calendar, tab: 'events' },
            { label: 'Registrations', path: '/admin?tab=registrations', icon: UserCheck, tab: 'registrations', badge: pendingRegistrations },
            { label: 'Students', path: '/admin?tab=approvals', icon: Shield, tab: 'approvals', badge: pendingStudents },
            { label: 'Feedback', path: '/admin?tab=feedback', icon: FileText, tab: 'feedback' },
        ];

        const collegeAdminQuickLinks = [
            { label: 'Create Event', path: '/create-event', icon: PlusCircle },
        ];

        const secondaryLinks = [
            { label: 'Dashboard', path: '/student/dashboard', icon: Home, roles: ['student'], matches: ['/campus-feed'] },
            { label: 'Explore Events', path: '/student/explore', icon: Compass, roles: ['student'], section: 'discover', matches: ['/campus-feed?section=discover'] },
            { label: 'My Events', path: '/student/my-events', icon: Calendar, roles: ['student'], section: 'my-events', matches: ['/campus-feed?section=my-events'] },
            { label: 'Activity', path: '/student/activity', icon: Activity, roles: ['student'], section: 'activity', matches: ['/campus-feed?section=activity'] },
            { label: 'Profile', path: '/profile', icon: UserIcon, roles: ['student', 'college_admin', 'admin'] },
            { label: 'Security', path: '/change-password', icon: Lock, roles: ['student', 'admin'] },
        ];

        return (
            <>
                <div className="p-8 pb-10">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Calendar className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">CampusHub</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {normalizedRole === 'admin' && !suppressAdminNav && (
                        <>
                            <p className="px-4 text-xs font-semibold text-slate-500 mb-4">Platform</p>
                            {adminLinks.map(item => {
                                const isActive = location.pathname === '/superadmin' && currentTab === item.tab;
                                return (
                                    <button key={item.path} onClick={() => { navigate(item.path); setIsSidebarMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 font-medium text-sm group ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`} />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {normalizedRole === 'college_admin' && !suppressAdminNav && (
                        <>
                            <p className="px-4 text-xs font-semibold text-slate-500 mb-4">Main</p>
                            {collegeAdminMainLinks.map(item => {
                                const isActive = location.pathname === '/admin' && currentTab === item.tab;
                                return (
                                    <button key={item.path} onClick={() => { navigate(item.path); setIsSidebarMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 font-medium text-sm group ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`} />
                                        <span className="text-sm">{item.label}</span>
                                        {item.badge > 0 && (
                                            <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-700">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}

                            <p className="px-4 text-xs font-semibold text-slate-500 mb-4 mt-8">Quick access</p>
                            {collegeAdminQuickLinks.map(item => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button key={item.path} onClick={() => { navigate(item.path); setIsSidebarMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 font-medium text-sm group ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`} />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                );
                            })}

                            <p className="px-4 text-xs font-semibold text-slate-500 mb-4 mt-8">Account</p>
                            <button onClick={() => { navigate('/profile'); setIsSidebarMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 font-medium text-sm group ${location.pathname === '/profile' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <UserIcon className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`} />
                                <span className="text-sm">My Profile</span>
                            </button>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors duration-150 font-medium text-sm">
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </>
                    )}

                    {normalizedRole !== 'college_admin' && <p className="px-4 text-xs font-semibold text-slate-500 mb-4 mt-8">Navigation</p>}
                    {normalizedRole !== 'college_admin' && secondaryLinks.filter(l => l.roles.includes(normalizedRole)).map(item => {
                        const isApproved = normalizedRole !== 'college_admin' || user?.isApproved;
                        if (item.requiresApproved && !isApproved) return null;

                        const currentSection = new URLSearchParams(location.search).get('section');
                        const currentPathWithSection = location.pathname === '/campus-feed' && currentSection
                            ? `/campus-feed?section=${currentSection}`
                            : location.pathname;
                        const isPathMatch = location.pathname === item.path;
                        const isSectionMatch = item.section && location.pathname === '/campus-feed' && currentSection === item.section;
                        const isAliasMatch = Array.isArray(item.matches) && item.matches.includes(currentPathWithSection);
                        const isDefaultDashboard = !item.section && location.pathname === '/campus-feed' && !currentSection;
                        const isActive = isPathMatch || isSectionMatch || isAliasMatch || isDefaultDashboard;
                        return (
                            <button key={item.path} onClick={() => { navigate(item.path); setIsSidebarMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 font-medium text-sm group ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`} />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {normalizedRole !== 'college_admin' && <div className="p-6 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors duration-150 font-medium text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>}
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
                    className="fixed inset-0 bg-slate-900/45 z-40 lg:hidden"
                    onClick={() => setIsSidebarMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 w-72 bg-white z-50 transition-transform duration-200 lg:hidden flex flex-col ${isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 md:px-8 flex items-center justify-between">
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsSidebarMobileOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="ml-4 flex items-center gap-2">
                            <Calendar className="text-slate-900 w-5 h-5" />
                            <span className="font-bold text-lg tracking-tight text-slate-900">CampusHub</span>
                        </div>
                    </div>
                    <div className="flex-1" />

                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-slate-900 rounded-full ring-2 ring-white" />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden z-50">
                                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                        <span className="font-semibold text-xs text-slate-900">Inbox</span>
                                        {notifications.length > 0 && (
                                            <button onClick={markAllAsRead} className="text-xs text-slate-700 font-medium hover:underline">Clear all</button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-xs font-medium">
                                                No new notifications.
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n._id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <p className="font-bold text-slate-900 text-sm">{n.title}</p>
                                                    <p className="text-slate-500 text-xs mt-1">{n.message}</p>
                                                    <p className="text-xs font-medium text-slate-400 mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
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
                                <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${user?.role === 'admin' ? 'bg-slate-900 text-white' :
                                        user?.role === 'college_admin' ? 'bg-slate-700 text-white' :
                                            'bg-slate-200 text-slate-700'
                                    }`}>
                                    {{ admin: 'Superadmin', college_admin: 'Admin', student: 'Student' }[user?.role] || user?.role}
                                </span>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                <UserIcon className="w-5 h-5 text-slate-700" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="app-shell p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;