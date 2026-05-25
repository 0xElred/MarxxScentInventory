import type { FC, ReactNode } from "react";

interface TableScrollContainerProps {
    children: ReactNode;
}

/** Enables horizontal scroll on narrow viewports when table content is wider than the screen. */
const TableScrollContainer: FC<TableScrollContainerProps> = ({ children }) => (
    <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        {children}
    </div>
);

export default TableScrollContainer;
