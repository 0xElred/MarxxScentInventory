import type { FC, ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, action }) => (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
        </div>
        {action}
    </div>
);

export default PageHeader;
