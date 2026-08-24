import { describe, expect, it, vi } from "vitest";
import { apiToFuture } from "$/data/api-futures";
import { CancelableResponse } from "$/types/d2-api";

describe("apiToFuture", () => {
    it("returns the data of the response", async () => {
        const request = createRequest();
        const future = apiToFuture(request.response);
        const onSuccess = vi.fn();

        future.run(onSuccess, vi.fn());
        request.resolve("some-data");
        await flushPromises();

        expect(onSuccess).toHaveBeenCalledWith("some-data");
    });

    it("reports the error of a failed request", async () => {
        const request = createRequest();
        const error = new Error("Some request error");
        const onError = vi.fn();

        apiToFuture(request.response).run(vi.fn(), onError);
        request.fail(error);
        await flushPromises();

        expect(onError).toHaveBeenCalledWith(error);
    });

    /* The fetch backend aborts the request and wraps the AbortError in an HttpError, so the
       rejection is not recognizable as a cancellation by its type or its name. */
    it("reports no error when the request is cancelled", async () => {
        const abortError = new Error("AbortError: signal is aborted without reason");
        const request = createRequest({ onCancel: reject => reject(abortError) });
        const onError = vi.fn();

        const cancel = apiToFuture(request.response).run(vi.fn(), onError);
        cancel?.();
        await flushPromises();

        expect(request.cancel).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });
});

function createRequest(options: { onCancel?: (reject: (error: Error) => void) => void } = {}) {
    let resolveResponse: (data: string) => void = () => {};
    let rejectResponse: (error: Error) => void = () => {};

    const promise = new Promise<{ status: number; data: string; headers: Record<string, string> }>(
        (resolve, reject) => {
            resolveResponse = data => resolve({ status: 200, data: data, headers: {} });
            rejectResponse = reject;
        }
    );

    const cancel = vi.fn(() => options.onCancel?.(rejectResponse));
    const response = CancelableResponse.build({ response: () => promise, cancel: cancel });

    return {
        response: response,
        cancel: cancel,
        resolve: (data: string) => resolveResponse(data),
        fail: (error: Error) => rejectResponse(error),
    };
}

function flushPromises(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
}
