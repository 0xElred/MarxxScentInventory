import type { PaginatedResponse } from "../interfaces/PaginationInterface";

export function parsePaginated<T>(resData: Record<string, unknown>, key: string): PaginatedResponse<T> {
    const paginator = (resData[key] ?? resData) as PaginatedResponse<T>;
    return {
        data: paginator.data ?? [],
        current_page: paginator.current_page ?? 1,
        last_page: paginator.last_page ?? 1,
        per_page: paginator.per_page ?? 15,
        total: paginator.total ?? 0,
    };
}
