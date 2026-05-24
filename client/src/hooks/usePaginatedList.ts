import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import type { PaginatedResponse } from "../interfaces/PaginationInterface";

interface UsePaginatedListOptions {
    debounceMs?: number;
}

export function usePaginatedList<T>(
    fetchPage: (page: number, search: string) => Promise<PaginatedResponse<T>>,
    options: UsePaginatedListOptions = {}
) {
    const { debounceMs = 400 } = options;
    const [items, setItems] = useState<T[]>([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, debounceMs);
    const [page, setPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const prevDebouncedSearch = useRef(debouncedSearch);

    const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

    useEffect(() => {
        let cancelled = false;
        const searchChanged = prevDebouncedSearch.current !== debouncedSearch;
        prevDebouncedSearch.current = debouncedSearch;

        const pageToFetch = searchChanged ? 1 : page;
        if (searchChanged && page !== 1) {
            setPage(1);
        }

        async function run() {
            setLoading(true);
            try {
                const result = await fetchPage(pageToFetch, debouncedSearch);
                if (cancelled) return;

                setItems(result.data);
                setCurrentPage(result.current_page);
                setLastPage(result.last_page);
                setTotal(result.total);

                if (pageToFetch > result.last_page && result.last_page > 0) {
                    setPage(result.last_page);
                }
            } catch (e) {
                if (!cancelled) {
                    console.error(e);
                    setItems([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void run();
        return () => {
            cancelled = true;
        };
    }, [fetchPage, page, debouncedSearch, reloadKey]);

    return {
        items,
        search,
        setSearch,
        page: currentPage,
        lastPage,
        total,
        loading,
        setPage,
        refresh,
    };
}
