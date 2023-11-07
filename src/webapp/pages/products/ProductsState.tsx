import { Product } from "../../../domain/entities/Product";
import { PaginatedReponse, TablePagination } from "../../../domain/entities/TablePagination";

export interface ProductsState {
    getProducts: (
        _search: string,
        paging: TablePagination,
        sorting: TableSorting<Product>
    ) => Promise<PaginatedReponse<Product>>;
    pagination: {
        pageSizeOptions: number[];
        pageSizeInitialValue: number;
    };
    initialSorting: TableSorting<Product>;
    globalMessage?: GlobalMessage;
    currentProduct?: CurrentProduct;
    updateProductQuantity: (id: string) => Promise<void>;
    cancelEditQuantity: () => void;
    onChangeQuantity: (quantity: string) => void;
    saveEditQuantity: () => Promise<void>;
}

export interface CurrentProduct {
    id: string;
    title: string;
    quantity: string;
    error?: string;
}

export interface GlobalMessage {
    text: string;
    type: "success" | "error";
}

export interface TableSorting<T> {
    field: keyof T;
    order: "asc" | "desc";
}
