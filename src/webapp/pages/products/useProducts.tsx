import { Product } from "../../../domain/entities/Product";
import { Quantity } from "../../../domain/entities/Quantity";
import { TablePagination, TableSorting } from "../../../domain/entities/TablePagination";
import { validationErrorMessages } from "../../../domain/entities/generic/Errors";
import { useAppContext } from "../../contexts/app-context";
import { useReload } from "../../hooks/use-reload";
import { useCallback, useMemo, useState } from "react";
import { CurrentProduct, GlobalMessage, ProductsState } from "./ProductsState";

const pagination = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

const initialSorting = {
    field: "title" as const,
    order: "asc" as const,
};

export function useProducts(): ProductsState {
    const { compositionRoot, currentUser } = useAppContext();
    const [reloadKey, reload] = useReload();
    const [globalMessage, setGlobalMessage] = useState<GlobalMessage | undefined>(undefined);
    const [currentProduct, setCurrentProduct] = useState<CurrentProduct | undefined>(undefined);

    const getProducts = useMemo(
        () => (_search: string, paging: TablePagination, sorting: TableSorting<Product>) => {
            console.debug("Reloading", reloadKey);

            return compositionRoot.products.getAll.execute(paging, sorting).toPromise();
        },
        [compositionRoot.products.getAll, reloadKey]
    );

    const updateProductQuantity = useCallback(
        async (id: string) => {
            if (id) {
                if (!currentUser.isAdmin()) {
                    setGlobalMessage({
                        type: "error",
                        text: "Only admin users can edit quantity of a product",
                    });
                    return;
                }

                compositionRoot.products.getById.execute(id).run(
                    product => {
                        setCurrentProduct({
                            id,
                            title: product.title,
                            quantity: product.quantity.value.toString(),
                        });
                    },
                    error => {
                        setGlobalMessage({ type: "error", text: error.message });
                    }
                );
            }
        },
        [compositionRoot.products.getById, currentUser]
    );

    function cancelEditQuantity(): void {
        setCurrentProduct(undefined);
    }

    function onChangeQuantity(quantity: string): void {
        if (!currentProduct) return;

        Quantity.create(quantity).match({
            error: errors => {
                setCurrentProduct({
                    ...currentProduct,
                    quantity: quantity,
                    error: errors.map(error => validationErrorMessages[error]()).join("\n"),
                });
            },
            success: quantity => {
                setCurrentProduct({
                    ...currentProduct,
                    quantity: quantity.value.toString(),
                    error: undefined,
                });
            },
        });
    }

    async function saveEditQuantity(): Promise<void> {
        const api = compositionRoot.api.get;

        if (currentProduct && api) {
            compositionRoot.products.update
                .execute(currentUser, currentProduct.id, currentProduct.quantity)
                .run(
                    () => {
                        setGlobalMessage({
                            type: "success",
                            text: `Quantity ${currentProduct.quantity} for ${currentProduct.title} saved`,
                        });
                        reload();
                        setCurrentProduct(undefined);
                    },
                    () => {
                        setGlobalMessage({
                            type: "error",
                            text: `An error has ocurred saving quantity ${currentProduct.quantity} for ${currentProduct.title}`,
                        });
                    }
                );
        }
    }

    return {
        getProducts,
        pagination,
        initialSorting,
        globalMessage,
        currentProduct,
        updateProductQuantity,
        cancelEditQuantity,
        onChangeQuantity,
        saveEditQuantity,
    };
}
