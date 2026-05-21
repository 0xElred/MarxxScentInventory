import AppSidebar from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";

const MobileBar = () => {
    const { toggleSidebar } = useSidebar();
    return (
        <div className="mb-4 flex items-center sm:hidden">
            <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-gray-200"
            >
                Menu
            </button>
        </div>
    );
};

const LayoutContent = () => (
    <div className="min-h-screen bg-[#0f1f3d]">
        <AppSidebar />
        <main className="min-h-screen bg-[#0f1f3d] pl-0 sm:pl-64">
            <div className="px-4 py-6 sm:px-8 sm:py-8">
                <MobileBar />
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
