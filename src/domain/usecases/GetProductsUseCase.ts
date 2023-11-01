import { FutureData } from "../../data/api-futures";
import { Product } from "../entities/Product";
import { PaginatedReponse, TablePagination, TableSorting } from "../entities/TablePagination";
import { ProductRepository } from "../repositories/ProductRepository";

export class GetProductsUseCase {
    constructor(private productReposiory: ProductRepository) {}

    public execute(
        paging: TablePagination,
        sorting: TableSorting<Product>
    ): FutureData<PaginatedReponse<Product>> {
        return this.productReposiory.getProducts(paging, sorting);
    }
}
