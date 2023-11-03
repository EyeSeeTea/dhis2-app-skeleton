import { FutureData } from "../../data/api-futures";
import { Product } from "../entities/Product";
import { Id } from "../entities/Ref";
import { User } from "../entities/User";
import { validationErrorMessages } from "../entities/generic/Errors";
import { Future } from "../entities/generic/Future";
import { ProductRepository } from "../repositories/ProductRepository";

export class UpdateProductQuantityUseCase {
    constructor(private productReposiory: ProductRepository) {}

    public execute(currentUser: User, productId: Id, quantity: string): FutureData<void> {
        if (!currentUser.isAdmin()) {
            return Future.error(new Error("Only admin users can update quantity of a product"));
        }

        return this.productReposiory.getProduct(productId).flatMap(product => {
            return product.updateQuantity(quantity).match({
                error: errors => {
                    const errorMessages = errors
                        .map(error => error.errors.map(err => validationErrorMessages[err]()))
                        .flat()
                        .join("\n");

                    return Future.error(new Error(errorMessages));
                },
                success: edited => {
                    return this.productReposiory.save(edited);
                },
            });
        });
    }
}
