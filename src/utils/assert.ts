/**
 * Asserts that a value is defined (not null or undefined). If the value is not defined,
 * it throws an error; otherwise, TypeScript narrows the type after this call.
 *
 * @example
 * ```typescript
 * const user = await fetchUser();
 * // user is of type User | null
 * assert(user, "User must be defined");
 * // user is now typed as User
 * ```
 */
export function assert<T>(value: T | null | undefined, message?: string): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error(message || "Assertion failed: value is null or undefined");
    }
}

/**
 * Ensures that a value is defined (not null or undefined). Returns the value if defined,
 * otherwise throw an error.
 *
 * @example
 * ```typescript
 * const user = await fetchUser();
 * // user is of type User | null
 * const user2 = ensure(user, "User must be defined");
 * // user2 is now typed as User
 * ```
 */
export function ensure<T>(value: T | null | undefined, message?: string): T {
    if (value === null || value === undefined) {
        throw new Error(message || "Value is null or undefined");
    }
    return value;
}
