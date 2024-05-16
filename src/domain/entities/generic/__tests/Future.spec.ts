import { describe, expect, test, it, vi, expectTypeOf } from "vitest";
import { Future } from "$/domain/entities/generic/Future";

describe("Basic builders", () => {
    test("Future.success", async () => {
        const value$ = Future.success(10);

        expectTypeOf(value$).toEqualTypeOf<Future<unknown, number>>();
        await expectAsync(value$, { toEqual: 10 });
    });

    test("Future.error", async () => {
        const error = new CodedError("message: Error 1", { code: "E001" });
        const value$ = Future.error(error);

        expectTypeOf(value$).toEqualTypeOf<Future<CodedError, unknown>>();
        await expectAsync(value$, { toThrow: error });
    });
});

describe("run", () => {
    it("calls the sucess branch with the value", async () => {
        const success = vi.fn();
        const reject = vi.fn();

        Future.success(1).run(success, reject);
        await nextTick();

        expect(success).toHaveBeenCalledTimes(1);
        expect(success.mock.calls[0]).toEqual([1]);
        expect(reject).not.toHaveBeenCalled();
    });

    it("calls the error branch with the error", async () => {
        const success = vi.fn();
        const reject = vi.fn();

        const async = Future.error({ errorCode: "E12" });
        async.run(success, reject);
        await nextTick();

        expect(success).not.toHaveBeenCalled();
        expect(reject).toHaveBeenCalledTimes(1);
        const error = reject.mock.calls[0]?.[0];
        expect(error).toEqual({ errorCode: "E12" });
    });
});

describe("toPromise", () => {
    it("converts a successful Async to promise", async () => {
        await expect(Future.success(1).toPromise()).resolves.toEqual(1);
    });

    it("converts an error Async to promise", async () => {
        await expect(Future.error(new Error("message")).toPromise()).rejects.toThrow(
            new Error("message")
        );
    });
});

describe("helpers", () => {
    test("Future.sleep", async () => {
        await expectAsync(Future.sleep(1), { toEqual: 1 });
    });

    test("Future.void", async () => {
        await expectAsync(Future.void(), { toEqual: undefined });
    });
});

describe("Transformations", () => {
    test("map", async () => {
        const value1$ = Future.success(1);
        const value2$ = value1$.map(x => x.toString());

        await expectAsync(value2$, { toEqual: "1" });
    });

    test("mapError", async () => {
        const value1$ = Future.error(1);
        const value2$ = value1$.mapError(x => x.toString());
        expectTypeOf(value2$).toEqualTypeOf<Future<string, unknown>>();

        await expectAsync(value2$, { toThrow: "1" });
    });

    describe("flatMap/chain", () => {
        it("builds an async value mapping to another async", async () => {
            const value$ = Future.success(1)
                .chain(value => Future.success(value + 2))
                .flatMap(value => Future.success(value + 3))
                .flatMap(value => Future.success(value + 4));

            await expectAsync(value$, { toEqual: 10 });
        });
    });
});

describe("Future.block", () => {
    describe("when all awaited values in the block are successful", () => {
        it("returns the returned value as an async", async () => {
            const result$ = Future.block(async $ => {
                const value1 = await $(Future.success(1));
                const value2 = await $(Future.success("2"));
                const value3 = await $(Future.success(3));
                return value1 + parseInt(value2) + value3;
            });

            await expectAsync(result$, { toEqual: 6 });
        });
    });

    describe("when any the awaited values in the block is an error", () => {
        it("returns that error as the async result", async () => {
            const result$ = Future.block<string, number>(async $ => {
                const value1 = await $(Future.success(1));
                const value2 = await $(Future.error("message") as Future<string, number>);
                const value3 = await $(Future.success(3));
                return value1 + value2 + value3;
            });

            await expectAsync(result$, { toThrow: "message" });
        });
    });

    describe("when any the awaited values in the block is an error", () => {
        it("returns that error as the async result", async () => {
            const result$ = Future.block_<string>()(async $ => {
                const value1 = await $(Future.success(1));
                const value2 = await $(Future.error("message") as Future<string, number>);
                const value3 = await $(Future.success(3));
                return value1 + value2 + value3;
            });

            await expectAsync(result$, { toThrow: "message" });
        });
    });

    describe("when the helper $.error is called", () => {
        it("returns that async error as the async result", async () => {
            const value1 = 1;
            const double = vi.fn((x: number) => x);

            const result$ = Future.block_<Error>()(async $ => {
                if (value1 > 0) $.throw(new Error("message"));
                const value = await $(Future.success(double(1)));
                return value;
            });

            await expectAsync(result$, { toThrow: new Error("message") });
            expect(double).not.toHaveBeenCalled();
        });
    });
});

describe("fromComputation", () => {
    describe("for a successful computation", () => {
        it("return a success async", async () => {
            const value$ = Future.fromComputation((resolve, _reject) => {
                resolve(1);
                return () => {};
            });

            await expectAsync(value$, { toEqual: 1 });
        });
    });

    describe("for an unsuccessful computation", () => {
        it("return an error async", async () => {
            const value$ = Future.fromComputation<unknown, string>((_resolve, reject) => {
                reject("message");
                return () => {};
            });

            await expectAsync(value$, { toThrow: "message" });
        });
    });
});

describe("cancel", () => {
    it("cancels the async and the error branch is not called", async () => {
        const success = vi.fn();
        const reject = vi.fn();

        const cancel = Future.sleep(1).run(success, reject);
        cancel?.();
        await nextTick();

        expect(success).not.toHaveBeenCalled();
        expect(reject).toHaveBeenCalledTimes(0);
    });
});

describe("join2", () => {
    it("returns a single async with the pair of values", async () => {
        const join$ = Future.join2(Future.success(123), Future.success("hello"));

        expectTypeOf(join$).toEqualTypeOf<Future<unknown, [number, string]>>();
        await expectAsync(join$, { toEqual: [123, "hello"] });
    });

    it("returns an error if some of the inputs is an error", async () => {
        const join$ = Future.join2(Future.success(123), Future.error("Some error"));

        expectTypeOf(join$).toEqualTypeOf<Future<unknown, [number, unknown]>>();
        await expectAsync(join$, { toThrow: "Some error" });
    });
});

describe("joinObj", () => {
    it("returns an async with the object of values", async () => {
        const join$ = Future.joinObj({
            n: Future.success(123),
            s: Future.success("hello"),
        });

        await expectAsync(join$, {
            toEqual: { n: 123, s: "hello" },
        });
    });

    it("returns an error if some of the inputs is an error", async () => {
        const join$ = Future.joinObj({
            n: Future.success(123) as Future<string, number>,
            s: Future.error("Some error") as Future<string, {}>,
        });
        expectTypeOf(join$).toEqualTypeOf<Future<string, { n: number; s: {} }>>();

        await expectAsync(join$, { toThrow: "Some error" });
    });
});

describe("sequential", () => {
    it("returns an async containing all the values as an array", async () => {
        const values$ = Future.sequential([
            Future.success(1),
            Future.success(2),
            Future.success(3),
        ]);
        await expectAsync(values$, { toEqual: [1, 2, 3] });
    });
});

describe("parallel", async () => {
    test("concurrency smaller than length", async () => {
        const asyncs = [Future.sleep(3), Future.sleep(1), Future.sleep(2)];
        const values$ = Future.parallel(asyncs, { concurrency: 2 });
        await expectAsync(values$, { toEqual: [3, 1, 2] });
    });

    test("concurrency larger than length", async () => {
        const asyncs = [Future.sleep(3), Future.sleep(1), Future.sleep(2)];
        const values$ = Future.parallel(asyncs, { concurrency: 4 });
        await expectAsync(values$, { toEqual: [3, 1, 2] });
    });
});

function nextTick() {
    return new Promise(process.nextTick);
}

export async function expectAsync<E, D>(
    value$: Future<E, D>,
    options: { toEqual: D; toThrow?: undefined } | { toEqual?: undefined; toThrow: E }
): Promise<void> {
    if ("toEqual" in options) {
        await expect(value$.toPromise()).resolves.toEqual(options.toEqual);
    } else {
        await expect(value$.toPromise()).rejects.toMatchObject(options.toThrow as any);
    }
}

class CodedError extends Error {
    code: string;

    constructor(message: string, data: { code: string }) {
        super(message);
        this.code = data.code;
    }
}
