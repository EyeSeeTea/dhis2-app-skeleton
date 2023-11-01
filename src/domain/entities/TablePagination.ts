export interface TableSorting<T> {
    field: keyof T;
    order: "asc" | "desc";
}
export interface TablePagination {
    pageSize: number;
    total: number;
    page: number;
}

export interface Pager {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
}

export interface PaginatedReponse<T> {
    pager: Pager;
    objects: T[];
}
