export type Pager = {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
};

export type PaginatedResponse<T> = {
    pager: Pager;
    objects: T[];
};
