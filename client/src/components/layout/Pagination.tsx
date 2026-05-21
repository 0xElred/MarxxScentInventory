import type { FC } from "react";

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ currentPage, lastPage, total, onPageChange }) => {
    if (lastPage <= 1 && total === 0) return null;

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-700 px-4 py-3 sm:flex-row">
            <p className="text-sm text-gray-400">
                Page {currentPage} of {lastPage} · {total} total
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-gray-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>
                <button
                    type="button"
                    disabled={currentPage >= lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-gray-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
