import AppSidebar from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import logoNavbar from "../assets/img/logonavbar.png";

const MenuIcon = () => (
    <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
    >
        <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
    >
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

const MobileHeader = () => {
    const { isOpen, toggleSidebar } = useSidebar();
    return (
        <header className="relative sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between border-b border-slate-700 bg-[#0f1f3d]/95 px-4 py-3 backdrop-blur sm:hidden">
            <button
                type="button"
                onClick={toggleSidebar}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-600 text-gray-200 transition hover:bg-slate-800"
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <img
                src={logoNavbar}
                alt="Marxx Scent"
                className="pointer-events-none absolute left-1/2 max-h-10 w-auto max-w-[180px] -translate-x-1/2 object-contain"
            />
            <div className="h-10 w-10 shrink-0" aria-hidden />
        </header>
    );
};

const LayoutContent = () => (
    <div className="min-h-screen bg-[#0f1f3d]">
        <AppSidebar />
        <main className="min-h-screen bg-[#0f1f3d] pl-0 sm:pl-64">
            <div className="px-4 py-6 sm:px-8 sm:py-8">
                <MobileHeader />
                <Outlet />
            </div>
        </main>
    </div>
);

const AppLayout = () => (
    <SidebarProvider>
        <LayoutContent />
    </SidebarProvider>
);

export default AppLayout;
