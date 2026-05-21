import type { FC, ChangeEvent } from "react";

interface TableSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const TableSearchBar: FC<TableSearchBarProps> = ({
    value,
    onChange,
    placeholder = "Search...",
}) => (
    <div className="border-b border-slate-700 px-4 py-3">
        <input
            type="search"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full max-w-sm rounded-lg border border-slate-600 bg-[#0f1f3d] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoComplete="off"
        />
    </div>
);

export default TableSearchBar;
