import {
    createContext,
    useContext,
    useEffect,
    useState,
    type FC,
    type ReactNode,
} from "react";

type SidebarContextType = {
    isOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(
    undefined,
);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must used within SidebarProvider");
    }
    return context;
};

export const SidebarProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen((prev) => !prev);
    const closeSidebar = () => setIsOpen(false);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 640px)");
        const onChange = () => {
            if (mq.matches) setIsOpen(false);
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const isMobile = window.matchMedia("(max-width: 639px)").matches;
        if (!isMobile) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    return (
        <SidebarContext.Provider
            value={{ isOpen, toggleSidebar, closeSidebar }}
        >
            {children}
        </SidebarContext.Provider>
    );
}; 