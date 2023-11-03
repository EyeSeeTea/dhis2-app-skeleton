import { Quantity } from "./Quantity";
import { Id } from "./Ref";
import { Either } from "./generic/Either";
import { Entity, EntityData } from "./generic/Entity";
import { ValidationError, ValidationErrorKey } from "./generic/Errors";
import { validateRequired } from "./generic/validations";

interface ProductData extends EntityData {
    id: Id;
    title: string;
    image: string;
    quantity: Quantity;
    status: ProductStatus;
}

export type ProductStatus = "active" | "inactive";

export class Product extends Entity {
    public readonly title: string;
    public readonly image: string;
    public readonly quantity: Quantity;
    public readonly status: ProductStatus;

    constructor(data: ProductData) {
        super(data.id);

        this.title = data.title;
        this.image = data.image;
        this.quantity = data.quantity;
        this.status = data.status;
    }

    public updateQuantity(quantity: string): Either<ValidationError<Product>[], Product> {
        return Product.validateAndCreate(this.id, this.title, this.image, quantity);
    }

    public static create(
        id: string,
        title: string,
        image: string,
        quantity: string
    ): Either<ValidationError<Product>[], Product> {
        return this.validateAndCreate(id, title, image, quantity);
    }

    private static validateAndCreate(
        id: string,
        title: string,
        image: string,
        quantity: string
    ): Either<ValidationError<Product>[], Product> {
        const quantityValidation = Quantity.create(quantity);

        const errors: ValidationError<Product>[] = [
            { property: "id" as const, errors: validateRequired(id), value: id },
            { property: "title" as const, errors: validateRequired(title), value: title },
            { property: "image" as const, errors: validateRequired(image), value: image },
            this.extractError("quantity", quantityValidation, quantity),
        ].filter(validation => validation.errors.length > 0);

        if (errors.length === 0) {
            return Either.success(
                new Product({
                    id,
                    title,
                    image,
                    quantity: quantityValidation.get(),
                    status: +quantity === 0 ? "inactive" : "active",
                })
            );
        } else {
            return Either.error(errors);
        }
    }

    private static extractError<T>(
        property: keyof Product,
        validation: Either<ValidationErrorKey[], T>,
        value: unknown
    ): ValidationError<Product> {
        return {
            property,
            errors: validation
                ? validation.match({ error: errors => errors, success: () => [] })
                : [],
            value,
        };
    }
}
