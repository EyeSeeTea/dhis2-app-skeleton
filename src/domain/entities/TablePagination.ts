export interface TableSorting<T> {
    field: keyof T;
    order: "asc" | "desc";
}
export interface TablePagination {
    pageSize: number;
    total: number;
    page: number;
}
