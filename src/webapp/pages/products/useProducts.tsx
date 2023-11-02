import { Product } from "../../../domain/entities/Product";
import { TablePagination, TableSorting } from "../../../domain/entities/TablePagination";
import { useAppContext } from "../../contexts/app-context";
import { useReload } from "../../hooks/use-reload";
import { useCallback, useMemo, useState } from "react";

interface CurrentProduct {
    id: string;
    title: string;
    image: string;
    quantity: string;
    error?: string;
}

interface GlobalMessage {
    text: string;
    type: "success" | "error";
}

export function useProducts() {
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
                            image: product.image,
                            quantity: product.quantity.toString(),
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

        const isValidNumber = !isNaN(+quantity);

        if (!isValidNumber) {
            setCurrentProduct({
                ...currentProduct,
                quantity: quantity,
                error: "Only numbers are allowed",
            });
        } else {
            const value = Number(quantity);

            if (value < 0) {
                setCurrentProduct({
                    ...currentProduct,
                    quantity: quantity,
                    error: "Only positive numbers are allowed",
                });
            } else {
                setCurrentProduct({ ...currentProduct, quantity: quantity, error: undefined });
            }
        }
    }

    async function saveEditQuantity(): Promise<void> {
        const api = compositionRoot.api.get;

        if (currentProduct && api) {
            const quantity = +(currentProduct.quantity || "0");

            const product: Product = {
                ...currentProduct,
                quantity,
                status: quantity === 0 ? 0 : 1,
            };

            compositionRoot.products.update.execute(currentUser, product).run(
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
        globalMessage,
        currentProduct,
        updateProductQuantity,
        cancelEditQuantity,
        onChangeQuantity,
        saveEditQuantity,
    };
}
