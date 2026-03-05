import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            label: "Control Panel",
            path: '/admin',
            roles: ['admin']
        },
        {
            label: "My Dashboard",
            path: '/college-admin',
            roles: ['college_admin']
        },
        {
            label: "Home / Feed",
            path: '/student',
            roles: ['student', 'college_admin', 'admin']
        },
        { label: "Create Event", path: "/create-event", roles: ['college_admin', 'admin'], requiresApproved: true },
        { label: "Manage Events", path: "/manage-events", roles: ['college_admin', 'admin'], requiresApproved: true },
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
        <div className="flex min-h-screen w-full bg-main-bg overflow-hidden relative">
            {/* Sidebar (Rectangle 16 Styling) */}
            <aside className="w-1/4 max-w-xs h-screen bg-sidebar fixed left-0 top-0 flex flex-col pt-10 px-6 shadow-xl z-20">
                <nav className="flex flex-col gap-8 w-full px-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`metallic-btn w-full py-4 text-lg ${location.pathname === item.path ? 'ring-2 ring-white/50' : ''}`}
                        >
                            {item.label}
                        </button>
                    ))}

                    {/* Logout Button (Rectangle 4) */}
                    <button
                        onClick={handleLogout}
                        className="metallic-btn w-full py-4 text-lg"
                    >
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-[25%] p-8 md:p-12 min-h-screen relative overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
