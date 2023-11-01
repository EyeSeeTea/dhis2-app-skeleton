import { TablePagination, TableSorting } from "../../../domain/entities/TablePagination";
import { useAppContext } from "../../contexts/app-context";
import { useReload } from "../../hooks/use-reload";
import { useMemo } from "react";

export function useProducts() {
    const { compositionRoot } = useAppContext();
    const [reloadKey, reload] = useReload();

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

    return { getRows, reload };
}

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

const dataElements = {
    title: "qkvNoqnBdPk",
    image: "m1yv8j2av5I",
    quantity: "PZ7qxiDlYZ8",
    status: "AUsNzRGzRuC",
};

export interface ProgramEvent {
    id: string;
    title: string;
    image: string;
    quantity: number;
    status: number;
}

export type ProductStatus = "active" | "inactive";

const eventsFields = {
    event: true,
    dataValues: { dataElement: true, value: true },
    eventDate: true,
} as const;

export interface Event {
    event: string;
    dataValues: DataValue[];
    eventDate: string;
}

export interface DataValue {
    dataElement: string;
    value: string;
}
