import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/useAuth";
import sidebarLogo from "../assets/img/sidebarlogo.png";

const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/products", label: "Products" },
    { path: "/users", label: "Users" },
    { path: "/orders", label: "Orders" },
];

const MOBILE_MAX = 639;

const AppSidebar = () => {
    const { isOpen, closeSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            /* ignore */
        }
        localStorage.removeItem("token");
        navigate("/");
    };

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "?";

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 sm:hidden"
                    onClick={closeSidebar}
                    aria-hidden
                />
            )}
            <aside
                className={`fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r border-gray-900 bg-black transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0`}
            >
                <div className="flex min-h-[72px] items-center justify-center border-b border-gray-900 px-4 py-5">
                    <img
                        src={sidebarLogo}
                        alt="Marxx Scent"
                        className="max-h-14 w-full object-contain"
                    />
                </div>

                <div className="border-b border-gray-900 px-4 py-4">
                    <div className="flex items-center gap-3">
                        {user?.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-sm font-semibold text-white">
                                {initials}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-white">
                                Hello, {user?.name ?? "Guest"}
                            </p>
                            <p className="text-xs capitalize text-gray-400">
                                {user?.role?.name ?? "—"}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                    if (window.innerWidth <= MOBILE_MAX)
                                        closeSidebar();
                                }}
                                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                    active
                                        ? "bg-gray-100 text-black"
                                        : "text-gray-300 hover:bg-gray-900 hover:text-white"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-gray-900 p-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (window.innerWidth <= MOBILE_MAX) closeSidebar();
                            void handleLogout();
                        }}
                        className="w-full rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-gray-900 hover:text-white"
                    >
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AppSidebar;
