import { ReferenceObject, TablePagination, TableSorting } from "@eyeseetea/d2-ui-components";
import { Paginated } from "$/domain/entities/generic/Pagination";

export type GetRows<T extends ReferenceObject> = (
    search: string,
    paging: TablePagination,
    sorting: TableSorting<T>
) => Promise<Paginated<T>>;
