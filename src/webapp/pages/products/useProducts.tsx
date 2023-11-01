import { Product } from "../../../domain/entities/Product";
import { TablePagination, TableSorting } from "../../../domain/entities/TablePagination";
import { useAppContext } from "../../contexts/app-context";
import { useReload } from "../../hooks/use-reload";
import { useCallback, useMemo } from "react";

export function useProducts() {
    const { compositionRoot } = useAppContext();
    const [reloadKey, reload] = useReload();

    const getProducts = useMemo(
        () => (_search: string, paging: TablePagination, sorting: TableSorting<Product>) => {
            console.debug("Reloading", reloadKey);

            return compositionRoot.products.getAll.execute(paging, sorting).toPromise();
        },
        [compositionRoot.products.getAll, reloadKey]
    );

    const getProduct = useCallback(
        (id: string) => {
            return compositionRoot.products.getById.execute(id);
        },
        [compositionRoot.products.getById]
    );

    return { getProducts, getProduct, reload };
}
