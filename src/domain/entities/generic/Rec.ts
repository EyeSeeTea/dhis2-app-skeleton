/**
 * Expand methods for Javascript objects. An example:
 *
 * ```
 * import _r from "./Rec";
 *
 * const obj = _r({ x: 1, y: 2, s: "hello" })
 *     .pick(["x", "y"])
 *     .merge(_r({ z: 3 }))
 *     .value(); // { x: 1, y: 2, z: 3}
 * ```
 */

export class Rec<T extends BaseObj> {
    protected constructor(protected obj: T) {}

    static from<T extends BaseObj>(obj: T): Rec<T> {
        return new Rec(obj);
    }

    keys(): Array<keyof T> {
        return Object.keys(this.obj) as Array<keyof T>;
    }

    values(): Array<T[keyof T]> {
        return Object.values(this.obj) as Array<T[keyof T]>;
    }

    toObject(): T {
        return this.obj;
    }

    value(): T {
        return this.obj;
    }

    pick<K extends keyof T>(keys: K[]): Rec<Pick<T, K>> {
        return this.pickBy(key => keys.includes(key as K)) as unknown as Rec<Pick<T, K>>;
    }

    omit<K extends keyof T>(keys: K[]): Rec<Omit<T, K>> {
        return this.pickBy(key => !keys.includes(key as K)) as unknown as Rec<Omit<T, K>>;
    }

    pickBy(filter: (key: keyof T) => boolean): Rec<Partial<T>> {
        const pairs = Object.entries(this.obj);
        const filtered = Object.fromEntries(pairs.filter(([k, _v]) => filter(k as keyof T)));
        return new Rec(filtered) as unknown as Rec<Partial<T>>;
    }

    omitBy(filter: (key: keyof T) => boolean): Rec<Partial<T>> {
        return this.pickBy(key => !filter(key));
    }

    merge<T2 extends BaseObj>(rec2: Rec<T2>): Rec<Merge<T, T2>> {
        const merged = { ...this.obj, ...rec2.obj } as Merge<T, T2>;
        return new Rec(merged);
    }
}

export default function _r<T extends BaseObj>(obj: T): Rec<T> {
    return Rec.from(obj);
}

type Merge<T1, T2> = Omit<T1, keyof T2> & T2;

type BaseObj = Record<string, unknown>;
