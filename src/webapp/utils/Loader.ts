export type Loader<Data> =
    | { type: "loading" }
    | { type: "success"; data: Data }
    | { type: "error"; error: Error };
