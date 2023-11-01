import { FutureData } from "../../data/api-futures";
import { Product } from "../entities/Product";
import { Id } from "../entities/Ref";
import { ProductRepository } from "../repositories/ProductRepository";

export class GetProductByIdUseCase {
    constructor(private productReposiory: ProductRepository) {}

    public execute(id: Id): FutureData<Product> {
        return this.productReposiory.getProduct(id);
    }
}
