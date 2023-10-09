import { Rec } from "../Rec";
import { expectTypeOf } from "expect-type";

const rec1 = Rec.from({ x: 1, s: "hello", n: null });

describe("Rec", () => {
    test("keys", () => {
        const keys = rec1.keys();
        expectTypeOf(keys).toEqualTypeOf<Array<"x" | "s" | "n">>();
        expect(keys).toEqual(["x", "s", "n"]);
    });

    test("values", () => {
        const values = rec1.values();
        expectTypeOf(values).toEqualTypeOf<Array<number | string | null>>();
        expect(values).toEqual([1, "hello", null]);
    });

    test("pick", () => {
        const picked = rec1.pick(["x", "n"]);
        expectTypeOf(picked).toEqualTypeOf<Rec<{ x: number; n: null }>>();
        expect(picked.toObject()).toEqual({ x: 1, n: null });
    });

    test("pickBy", () => {
        expect(rec1.pickBy(key => key === "x").toObject()).toEqual({ x: 1 });
    });

    test("omit", () => {
        expect(rec1.omit(["x", "n"]).toObject()).toEqual({ s: "hello" });
    });

    test("omitBy", () => {
        expect(rec1.omitBy(key => key === "x").toObject()).toEqual({ s: "hello", n: null });
    });

    test("merge", () => {
        const rec2 = Rec.from({ n: true, z: 123 });
        const merged = rec1.merge(rec2);
        expectTypeOf(merged).toEqualTypeOf<Rec<{ x: number; s: string; n: boolean; z: number }>>();
        expect(merged.toObject()).toEqual({ x: 1, s: "hello", n: true, z: 123 });
    });
});
