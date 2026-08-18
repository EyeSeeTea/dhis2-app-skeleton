import React from "react";
import {
    ObjectsListProps,
    ReferenceObject,
    TableConfig,
    TablePagination,
    TableSorting,
    TableState,
} from "@eyeseetea/d2-ui-components";
import { Cancel, FutureData } from "$/domain/entities/generic/Future";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { Maybe } from "$/utils/ts-utils";
import i18n from "$/utils/i18n";

export type GetRowsFuture<T extends ReferenceObject> = (
    search: string,
    paging: TablePagination,
    sorting: TableSorting<T>
) => FutureData<Paginated<T>>;

type State<T extends ReferenceObject> = {
    rows: Maybe<T[]>;
    pagination: TablePagination;
    sorting: TableSorting<T>;
    isLoading: boolean;
};

/* Future-based version of useObjectsTable. Requests are cancellable, so a request still in
   flight is cancelled when a new one is fired (a slow response of a search/filter the user has
   already changed would otherwise overwrite the rows) and when the component unmounts. */
export function useObjectsTableFuture<T extends ReferenceObject>(
    config: TableConfig<T>,
    getRows: GetRowsFuture<T>,
    options: { onError?: (error: Error) => void } = {}
): ObjectsListProps<T> {
    const { onError } = options;

    const initialState = React.useMemo(
        () => ({
            pagination: {
                page: 1,
                pageSize: config.paginationOptions.pageSizeInitialValue ?? 20,
                total: 0,
            },
            sorting: config.initialSorting,
            selection: config.initialSelection,
        }),
        [
            config.initialSelection,
            config.initialSorting,
            config.paginationOptions.pageSizeInitialValue,
        ]
    );

    const [state, setState] = React.useState<State<T>>(() => ({
        rows: undefined,
        pagination: initialState.pagination,
        sorting: initialState.sorting,
        isLoading: false,
    }));

    const [search, setSearch] = React.useState(config.initialSearch ?? "");
    const cancelRef = React.useRef<Cancel>(undefined);

    const loadRows = React.useCallback(
        (sorting: TableSorting<T>, pagination: Partial<TablePagination>) => {
            cancelRef.current?.();
            setState(state => ({ ...state, isLoading: true }));

            const paging = { ...initialState.pagination, ...pagination };

            cancelRef.current = getRows(search.trim(), paging, sorting).run(
                response => {
                    cancelRef.current = undefined;
                    setState({
                        rows: response.objects,
                        pagination: { ...paging, ...response.pager },
                        sorting: sorting,
                        isLoading: false,
                    });
                },
                error => {
                    cancelRef.current = undefined;
                    setState(state => ({ ...state, isLoading: false }));
                    onError?.(error);
                }
            );
        },
        [getRows, search, initialState.pagination, onError]
    );

    React.useEffect(() => {
        loadRows(config.initialSorting, initialState.pagination);
        return () => cancelRef.current?.();
    }, [config.initialSorting, loadRows, initialState.pagination]);

    const reload = React.useCallback(() => {
        loadRows(state.sorting, state.pagination);
    }, [loadRows, state.sorting, state.pagination]);

    const onChange = React.useCallback(
        (newState: TableState<T>) => loadRows(newState.sorting, newState.pagination),
        [loadRows]
    );

    return {
        ...config,
        isLoading: state.isLoading,
        rows: state.rows ?? [],
        onChange: onChange,
        pagination: state.pagination,
        searchBoxLabel: config.searchBoxLabel || i18n.t("Search by name"),
        onChangeSearch: setSearch,
        reload: reload,
        initialState: initialState,
    };
}
