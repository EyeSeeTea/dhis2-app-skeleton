import { EventStatus } from "@eyeseetea/d2-api";
import { Product } from "../../domain/entities/Product";
import {
    PaginatedReponse,
    TablePagination,
    TableSorting,
} from "../../domain/entities/TablePagination";
import { Future } from "../../domain/entities/generic/Future";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { D2Api } from "../../types/d2-api";
import { apiToFuture, FutureData } from "../api-futures";

const program = "x7s8Yurmj7Q";

export class ProductD2Repository implements ProductRepository {
    constructor(private api: D2Api) {}

    getProducts(
        paging: TablePagination,
        sorting: TableSorting<Product>
    ): FutureData<PaginatedReponse<Product>> {
        return apiToFuture(
            this.api.events.get({
                fields: eventsFields,
                program: "x7s8Yurmj7Q",
                page: paging.page,
                pageSize: paging.pageSize,
                order: `${sorting.field}:${sorting.order}`,
            })
        ).map(response => {
            const events = response.events.map(this.buildProduct);

            return {
                pager: response.pager,
                objects: events,
            };
        });
    }

    getProduct(id: string): FutureData<Product> {
        return this.getEvent(id).map(event => this.buildProduct(event));
    }

    save(product: Product): FutureData<void> {
        return this.getEvent(product.id).flatMap(event => {
            if (event) {
                const editedEvent = {
                    ...event,
                    dataValues: event.dataValues.map(dv => {
                        if (dv.dataElement === dataElements.quantity) {
                            return { ...dv, value: product.quantity.toString() };
                        } else if (dv.dataElement === dataElements.status) {
                            return { ...dv, value: product.status.toString() };
                        } else {
                            return dv;
                        }
                    }),
                };

                return apiToFuture(this.api.events.post({}, { events: [editedEvent] })).map(
                    postResponse => {
                        if (postResponse.status === "OK") {
                            Future.success(undefined);
                        } else {
                            Future.error(`An error has ocurred saving product`);
                        }
                    }
                );
            } else {
                return Future.error(new Error(`Product not found by id ${product.id}`));
            }
        });
    }

    private getEvent(eventId: string): FutureData<Event> {
        return apiToFuture(
            this.api.events.getAll({
                fields: eventsFields,
                program: program,
                event: eventId,
            })
        ).flatMap(response => {
            const event = response.events[0];

            if (event) {
                return Future.success(event);
            } else {
                return Future.error(new Error(`Product not found by id ${eventId}`));
            }
        });
    }

    private buildProduct(event: Event): Product {
        return {
            id: event.event,
            title:
                event.dataValues
                    .find(dv => dv.dataElement === dataElements.title)
                    ?.value.toString() || "",
            image:
                event.dataValues
                    .find(dv => dv.dataElement === dataElements.image)
                    ?.value.toString() || "",
            quantity: +(
                event.dataValues.find(dv => dv.dataElement === dataElements.quantity)?.value || 0
            ),
            status: +(
                event.dataValues.find(dv => dv.dataElement === dataElements.status)?.value || 0
            ),
        };
    }
}

const dataElements = {
    title: "qkvNoqnBdPk",
    image: "m1yv8j2av5I",
    quantity: "PZ7qxiDlYZ8",
    status: "AUsNzRGzRuC",
};

const eventsFields = {
    event: true,
    orgUnit: true,
    program: true,
    status: true,
    eventDate: true,
    programStage: true,
    dataValues: { dataElement: true, value: true },
} as const;

export interface Event {
    event: string;
    orgUnit: string;
    program: string;
    status: EventStatus;
    eventDate: string;
    attributeOptionCombo?: string;
    trackedEntityInstance?: string;
    programStage?: string;
    dataValues: Array<{
        dataElement: string;
        value: string | number | boolean;
    }>;
}

export interface DataValue {
    dataElement: string;
    value: string | number | boolean;
}
