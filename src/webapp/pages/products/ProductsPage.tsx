import {
    ConfirmationDialog,
    ObjectsList,
    TableConfig,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";

import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../contexts/app-context";
import i18n from "../../../utils/i18n";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import { TextField, Typography } from "@material-ui/core";
import styled from "styled-components";
import { useProducts } from "./useProducts";
import { Product, ProductStatus } from "../../../domain/entities/Product";

const dataElements = {
    title: "qkvNoqnBdPk",
    image: "m1yv8j2av5I",
    quantity: "PZ7qxiDlYZ8",
    status: "AUsNzRGzRuC",
};

export const ProductsPage: React.FC = React.memo(() => {
    const { compositionRoot, currentUser } = useAppContext();
    const snackbar = useSnackbar();

    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [editedQuantity, setEditedQuantity] = useState<string | undefined>(undefined);
    const [quantityError, setQuantityError] = useState<string | undefined>(undefined);

    const { getProducts, getProduct, reload } = useProducts();

    const updatingQuantity = useCallback(
        async (id: string) => {
            if (id) {
                if (!currentUser.isAdmin()) {
                    snackbar.error(i18n.t("Only admin users can edit quantity od a product"));
                    return;
                }

                getProduct(id).run(
                    product => {
                        setEditingProduct(product);
                        setEditedQuantity(product.quantity.toString() || "");
                    },
                    error => {
                        snackbar.error(error.message);
                    }
                );
            }
        },
        [currentUser, getProduct, snackbar]
    );

    const baseConfig: TableConfig<Product> = useMemo(
        () => ({
            columns: [
                {
                    name: "title",
                    text: i18n.t("Title"),
                    sortable: false,
                },
                {
                    name: "image",
                    text: i18n.t("Image"),
                    sortable: false,
                    getValue: event => {
                        const url = `${compositionRoot.api.get?.baseUrl}/api/events/files?dataElementUid=${dataElements.image}&eventUid=${event.id}`;
                        return <img src={url} alt={event.title} width={100} />;
                    },
                },

                {
                    name: "quantity",
                    text: i18n.t("Quantity"),
                    sortable: false,
                },
                {
                    name: "status",
                    text: i18n.t("Status"),
                    sortable: false,
                    getValue: event => {
                        const status = event.status === 0 ? "inactive" : "active";

                        return (
                            <StatusContainer status={status}>
                                <Typography variant="body1">{status}</Typography>
                            </StatusContainer>
                        );
                    },
                },
            ],
            actions: [
                {
                    name: "updateQuantity",
                    text: i18n.t("Update Quantity"),
                    icon: <SystemUpdateAltIcon />,
                    onClick: async (selectedIds: string[]) => {
                        updatingQuantity(selectedIds[0] || "");
                    },
                },
            ],
            initialSorting: {
                field: "title" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [compositionRoot.api.get?.baseUrl, updatingQuantity]
    );

    const tableProps = useObjectsTable(baseConfig, getProducts);

    function cancelEditQuantity(): void {
        setEditedQuantity(undefined);
        setEditingProduct(undefined);
        setQuantityError(undefined);
    }

    async function saveEditQuantity(): Promise<void> {
        const api = compositionRoot.api.get;

        if (editingProduct && api) {
            const quantity = +(editedQuantity || "0");

            const editedEvent: Product = {
                ...editingProduct,
                quantity,
                status: quantity === 0 ? 0 : 1,
            };

            const data = await api?.events
                .getAll({
                    fields: { $all: true },
                    program: "x7s8Yurmj7Q",
                    event: editingProduct.id,
                })
                .getData();

            const editingD2Event = data.events[0];

            if (!editingD2Event) return;

            const d2Event = {
                ...editingD2Event,
                dataValues: editingD2Event?.dataValues.map(dv => {
                    if (dv.dataElement === dataElements.quantity) {
                        return { ...dv, value: editedEvent.quantity };
                    } else if (dv.dataElement === dataElements.status) {
                        return { ...dv, value: editedEvent.status };
                    } else {
                        return dv;
                    }
                }),
            };

            const response = await api.events.post({}, { events: [d2Event] }).getData();

            if (response.status === "OK") {
                snackbar.success(`Quantity ${editedQuantity} for ${editedEvent.title} saved`);
            } else {
                snackbar.error(
                    `An error has ocurred saving quantity ${editedQuantity} for ${editedEvent.title}`
                );
            }

            setEditingProduct(undefined);
            setEditedQuantity(undefined);
            reload();
        }
    }

    function handleChangeQuantity(
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void {
        const isValidNumber = !isNaN(+event.target.value);

        if (!isValidNumber) {
            setQuantityError("Only numbers are allowed");
            setEditedQuantity(event.target.value);
        } else {
            const value = Number(event.target.value);

            if (value < 0) {
                setQuantityError("Only positive numbers are allowed");
            } else {
                setQuantityError(undefined);
            }

            setEditedQuantity(event.target.value);
        }
    }

    return (
        <Container>
            <Typography variant="h4">{i18n.t("Products")}</Typography>

            <ObjectsList<Product>
                {...tableProps}
                columns={tableProps.columns}
                onChangeSearch={undefined}
            />
            <ConfirmationDialog
                isOpen={editingProduct !== undefined}
                title={i18n.t("Update Quantity")}
                onCancel={cancelEditQuantity}
                cancelText={i18n.t("Cancel")}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onSave={saveEditQuantity}
                saveText={i18n.t("Save")}
                maxWidth="xs"
                fullWidth
                disableSave={quantityError !== undefined}
            >
                <TextField
                    label={i18n.t("Quantity")}
                    value={editedQuantity}
                    onChange={handleChangeQuantity}
                    error={quantityError !== undefined}
                    helperText={quantityError}
                />
            </ConfirmationDialog>
        </Container>
    );
});

const Container = styled.div`
    padding: 32px;
`;

const StatusContainer = styled.div<{ status: ProductStatus }>`
    background: ${props => (props.status === "inactive" ? "red" : "green")};
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    padding: 8px;
    border-radius: 20px;
    width: 100px;
`;
