import { Cancellation, Future, FutureData } from "$/domain/entities/generic/Future";
import { CancelableResponse, isCancel } from "$/types/d2-api";

export function apiToFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        let isCancelled = false;

        res.getData()
            .then(resolve)
            .catch((err: unknown) => {
                if (isCancelled || isCancel(err)) {
                    /* The caller cancelled the request, it's not an error to report. The shape
                       of the rejection depends on the backend (the fetch one wraps the
                       AbortError in an HttpError), so the flag is what makes this reliable. */
                    reject(new Cancellation());
                } else if (err instanceof Error) {
                    reject(err);
                } else {
                    console.error("apiToFuture:uncaught", err);
                    reject(new Error("Unknown error"));
                }
            });
        return () => {
            isCancelled = true;
            res.cancel();
        };
    });
}
