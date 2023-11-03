export type ValidationErrorKey =
    | "field_cannot_be_blank"
    | "field_cannot_be_negative"
    | "invalid_number_field";

export const validationErrorMessages: Record<ValidationErrorKey, () => string> = {
    field_cannot_be_blank: () => `Cannot be blank`,
    invalid_number_field: () => `Only numbers are allowed`,
    field_cannot_be_negative: () => `Only positive numbers are allowed`,
};

export type ValidationError<T> = {
    property: keyof T;
    value: unknown;
    errors: ValidationErrorKey[];
};
