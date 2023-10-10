import {
    ConfirmationDialog,
    ObjectsList,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";

import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../contexts/app-context";
import { useReload } from "../../hooks/use-reload";
import i18n from "../../../utils/i18n";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import { TextField, Typography } from "@material-ui/core";
import styled from "styled-components";

const dataElements = {
    title: "qkvNoqnBdPk",
    image: "m1yv8j2av5I",
    quantity: "PZ7qxiDlYZ8",
    status: "AUsNzRGzRuC",
};

interface ProgramEvent {
    id: string;
    title: string;
    image: string;
    quantity: number;
    status: number;
}

type ProductStatus = "active" | "inactive";

export const ProductsPage: React.FC = React.memo(() => {
    const { compositionRoot, currentUser } = useAppContext();
    const [reloadKey, reload] = useReload();
    const snackbar = useSnackbar();

    const [showEditQuantityDialog, setShowEditQuantityDialog] = useState(false);
    const [editingProgramEvent, setEditingProgramEvent] = useState<ProgramEvent | undefined>(
        undefined
    );
    const [editingEventId, setEditingEventId] = useState<string | undefined>(undefined);
    const [editedQuantity, setEditedQuantity] = useState<string | undefined>(undefined);
    const [quantityError, setQuantityError] = useState<string | undefined>(undefined);

    const updatingQuantity = useCallback(
        async (id: string) => {
            if (id) {
                if (!currentUser.isAdmin()) {
                    snackbar.error(i18n.t("Only admin users can edit quantity od a product"));
                    return;
                }

                const api = compositionRoot.api.get;

                const data = await api?.events
                    .getAll({
                        fields: eventsFields,
                        program: "x7s8Yurmj7Q",
                        event: id,
                    })
                    .getData();

                const event = data?.events[0];

                if (event) {
                    const events = data?.events.map(buildProgramEvent);
                    const event = events[0];

                    setEditingEventId(data?.events[0]?.event);
                    setEditingProgramEvent(event);
                    setEditedQuantity(event?.quantity.toString() || "");
                    setShowEditQuantityDialog(true);
                } else {
                    snackbar.error(`Event with id ${id} not found`);
                }
            }
        },
        [compositionRoot.api.get, currentUser, snackbar]
    );

    const baseConfig: TableConfig<ProgramEvent> = useMemo(
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

    const getRows = useMemo(
        () =>
            async (
                _search: string,
                paging: TablePagination,
                sorting: TableSorting<ProgramEvent>
            ) => {
                const api = compositionRoot.api.get;

                const data = await api?.events
                    .get({
                        fields: eventsFields,
                        program: "x7s8Yurmj7Q",
                        page: paging.page,
                        pageSize: paging.pageSize,
                        order: `${sorting.field}:${sorting.order}`,
                    })
                    .getData();

                const events = data?.events.map(buildProgramEvent);

                const emptyPager = {
                    page: 1,
                    pageCount: 1,
                    total: 0,
                    pageSize: 10,
                };

                console.debug("Reloading", reloadKey);

                return {
                    pager: data?.pager || emptyPager,
                    objects: events || [],
                };
            },
        [compositionRoot.api.get, reloadKey]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    function cancelEditQuantity(): void {
        setShowEditQuantityDialog(false);
        setEditingEventId(undefined);
        setEditedQuantity(undefined);
        setEditingProgramEvent(undefined);
        setQuantityError(undefined);
    }

    async function saveEditQuantity(): Promise<void> {
        const api = compositionRoot.api.get;

        if (editingProgramEvent && api) {
            const quantity = +(editedQuantity || "0");

            const editedEvent: ProgramEvent = {
                ...editingProgramEvent,
                quantity,
                status: quantity === 0 ? 0 : 1,
            };

            const data = await api?.events
                .getAll({
                    fields: { $all: true },
                    program: "x7s8Yurmj7Q",
                    event: editingEventId,
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

            setShowEditQuantityDialog(false);
            setEditingEventId(undefined);
            setEditingProgramEvent(undefined);
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

            <ObjectsList<ProgramEvent>
                {...tableProps}
                columns={tableProps.columns}
                onChangeSearch={undefined}
            />
            <ConfirmationDialog
                isOpen={showEditQuantityDialog}
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

function buildProgramEvent(event: Event): ProgramEvent {
    return {
        id: event.event,
        title: event.dataValues.find(dv => dv.dataElement === dataElements.title)?.value || "",
        image: event.dataValues.find(dv => dv.dataElement === dataElements.image)?.value || "",
        quantity: +(
            event.dataValues.find(dv => dv.dataElement === dataElements.quantity)?.value || 0
        ),
        status: +(event.dataValues.find(dv => dv.dataElement === dataElements.status)?.value || 0),
    };
}

const eventsFields = {
    event: true,
    dataValues: { dataElement: true, value: true },
    eventDate: true,
} as const;

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

export interface Event {
    event: string;
    dataValues: DataValue[];
    eventDate: string;
}

export interface DataValue {
    dataElement: string;
    value: string;
}
