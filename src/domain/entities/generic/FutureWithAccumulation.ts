import { Future } from "./Future";

export class FutureWithAccumulation {
    static sequential<E, D>(
        futures: Array<Future<E, D>>,
        options: SequentialWithAccumulationOptions = {}
    ): Future<never, SequentialAccumulatedData<E, D>> {
        const { stopOnError = false } = options;
        const processSequentially = (
            futures: Array<Future<E, D>>,
            accumulatedData: D[] = []
        ): Future<never, SequentialAccumulatedData<E, D>> => {
            const [firstFuture, ...remainingFutures] = futures;

            if (!firstFuture) {
                return Future.success({ type: "success", data: accumulatedData });
            }

            return firstFuture
                .flatMap(resultData => {
                    return processSequentially(remainingFutures, [...accumulatedData, resultData]);
                })
                .flatMapError((error: E) => {
                    if (stopOnError) {
                        const accumulatedDataWithError: SequentialAccumulatedData<E, D> = {
                            type: "error",
                            error: error,
                            data: accumulatedData,
                        };
                        return Future.success(accumulatedDataWithError);
                    } else {
                        return processSequentially(remainingFutures, accumulatedData);
                    }
                });
        };

        return processSequentially(futures);
    }

    static parallel<E, D>(
        futures: Array<Future<E, D>>,
        options: ParallelWithAccumulationOptions = {}
    ): Future<never, ParallelAccumulatedData<E, D>> {
        const { concurrency = 10, stopOnError = true } = options;

        const toParallelResult = (future: Future<E, D>): Future<never, ParallelResult<E, D>> => {
            return future
                .map<ParallelResult<E, D>>(data => ({ type: "success", data }))
                .mapError<ParallelResult<E, D>>(error => ({ type: "error", error }))
                .flatMapError(errorResult =>
                    Future.success<never, ParallelResult<E, D>>(errorResult)
                );
        };

        const processInParallel = (
            pendingFutures: Array<Future<E, D>>,
            accumulatedData: D[] = []
        ): Future<never, ParallelAccumulatedData<E, D>> => {
            if (pendingFutures.length === 0) {
                return Future.success({ type: "success", data: accumulatedData });
            }

            const currentBatch = pendingFutures.slice(0, concurrency);
            const remainingFutures = pendingFutures.slice(concurrency);

            return Future.parallel(currentBatch.map(toParallelResult), {
                concurrency: concurrency,
            }).flatMap(batchResults => {
                const successfulData = batchResults.flatMap(result =>
                    result.type === "success" ? [result.data] : []
                );

                const batchErrors = batchResults.flatMap(result =>
                    result.type === "error" ? [result.error] : []
                );

                const nextAccumulatedData = [...accumulatedData, ...successfulData];

                if (batchErrors.length > 0 && stopOnError) {
                    return Future.success({
                        type: "error",
                        errors: batchErrors,
                        data: nextAccumulatedData,
                    });
                }

                return processInParallel(remainingFutures, nextAccumulatedData);
            });
        };

        return processInParallel(futures);
    }
}

export type ParallelWithAccumulationOptions = {
    concurrency?: number;
    stopOnError?: boolean;
};

export type ParallelAccumulatedData<E, D> =
    | { type: "success"; data: D[] }
    | { type: "error"; errors: E[]; data: D[] };

type ParallelResult<E, D> = { type: "success"; data: D } | { type: "error"; error: E };

export type SequentialWithAccumulationOptions = { stopOnError?: boolean };

export type SequentialAccumulatedData<E, D> =
    | { type: "success"; data: D[] }
    | { type: "error"; error: E; data: D[] };
