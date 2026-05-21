import { useCallback, useEffect, useState } from "react";
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

    const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchPage(page, debouncedSearch);
            setItems(result.data);
            setCurrentPage(result.current_page);
            setLastPage(result.last_page);
            setTotal(result.total);
        } catch (e) {
            console.error(e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [fetchPage, page, debouncedSearch]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        void load();
    }, [load, reloadKey]);

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
