import { FutureData } from "../../data/api-futures";
import { Product } from "../entities/Product";
import { Id } from "../entities/Ref";
import { PaginatedReponse, TablePagination, TableSorting } from "../entities/TablePagination";

export interface ProductRepository {
    getProducts(
        paging: TablePagination,
        sorting: TableSorting<Product>
    ): FutureData<PaginatedReponse<Product>>;

    getProduct(Id: Id): FutureData<Product>;

    save(product: Product): FutureData<void>;
}
