import { FutureData } from "../../data/api-futures";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { Future } from "../entities/generic/Future";
import { ProductRepository } from "../repositories/ProductRepository";

export class UpdateProductUseCase {
    constructor(private productReposiory: ProductRepository) {}

    public execute(currentUser: User, product: Product): FutureData<void> {
        if (!currentUser.isAdmin()) {
            return Future.error(new Error("Only admin users can update quantity of a product"));
        }

        return this.productReposiory.save(product);
    }
}
