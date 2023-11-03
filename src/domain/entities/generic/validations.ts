import { ValidationErrorKey } from "./Errors";

export function validateRequired(value: any): ValidationErrorKey[] {
    const isBlank = !value || (value.length !== undefined && value.length === 0);

    return isBlank ? ["field_cannot_be_blank"] : [];
}

export function validateNumber(value: string): ValidationErrorKey[] {
    const isValidNumber = !isNaN(+value);

    return !isValidNumber ? ["invalid_number_field"] : [];
}

export function validateNonNegativeNumber(value: number): ValidationErrorKey[] {
    return value < 0 ? ["field_cannot_be_negative"] : [];
}
