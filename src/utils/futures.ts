import { Future, FutureData } from "../domain/entities/Future";
import { CancelableResponse } from "../types/d2-api";

export function apiToFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch(err => reject(err ? err.message : "Unknown error"));
        return res.cancel;
    });
}
