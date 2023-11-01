import { FutureData } from "../../data/api-futures";
import { Product } from "../entities/Product";
import { ProductRepository } from "../repositories/ProductRepository";

export class SaveProductUseCase {
    constructor(private productReposiory: ProductRepository) {}

    public execute(product: Product): FutureData<void> {
        return this.productReposiory.save(product);
    }
}
