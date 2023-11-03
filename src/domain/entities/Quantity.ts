import { ValueObject } from "./generic/ValueObject";
import { validateNonNegativeNumber, validateNumber, validateRequired } from "./generic/validations";
import { ValidationErrorKey } from "./generic/Errors";
import { Either } from "./generic/Either";

export interface QuantityProps {
    value: number;
}

export class Quantity extends ValueObject<QuantityProps> {
    public readonly value: number;

    private constructor(props: QuantityProps) {
        super(props);

        this.value = props.value;
    }

    public static create(value: string): Either<ValidationErrorKey[], Quantity> {
        const requiredErrors = validateRequired(value);
        const numberErrors = validateNumber(value);
        const negativeErrors = validateNonNegativeNumber(+value);

        if (requiredErrors.length > 0) {
            return Either.error(requiredErrors);
        } else if (numberErrors.length > 0) {
            return Either.error(numberErrors);
        } else if (negativeErrors.length > 0) {
            return Either.error(negativeErrors);
        } else {
            return Either.success(new Quantity({ value: +value }));
        }
    }
}
