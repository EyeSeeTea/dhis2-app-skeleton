import { Product } from "../../domain/entities/Product";
import {
    TablePagination,
    TableSorting,
    PaginatedReponse,
} from "../../domain/entities/TablePagination";
import { Future } from "../../domain/entities/generic/Future";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { FutureData } from "../api-futures";

export class ProductTestRepository implements ProductRepository {
    getProducts(
        _paging: TablePagination,
        _sorting: TableSorting<Product>
    ): FutureData<PaginatedReponse<Product>> {
        return Future.success({
            pager: { page: 1, pageCount: 0, pageSize: 50, total: 0 },
            objects: [],
        });
    }
    getProduct(_Id: string): FutureData<Product> {
        return Future.error(new Error("Product not found"));
    }

    save(_product: Product): FutureData<void> {
        return Future.success(undefined);
    }
}
