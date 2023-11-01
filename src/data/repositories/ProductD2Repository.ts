import { Product } from "../../domain/entities/Product";
import {
    PaginatedReponse,
    TablePagination,
    TableSorting,
} from "../../domain/entities/TablePagination";
import { User } from "../../domain/entities/User";
import { Future } from "../../domain/entities/generic/Future";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { D2Api } from "../../types/d2-api";
import { apiToFuture, FutureData } from "../api-futures";

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
        return apiToFuture(
            this.api.events.getAll({
                fields: eventsFields,
                program: "x7s8Yurmj7Q",
                event: id,
            })
        ).flatMap(response => {
            const event = response.events[0];

            if (event) {
                return Future.success(this.buildProduct(event));
            } else {
                return Future.error(new Error(`Product not found by id ${id}`));
            }
        });
    }

    buildProduct(event: Event): Product {
        return {
            id: event.event,
            title: event.dataValues.find(dv => dv.dataElement === dataElements.title)?.value || "",
            image: event.dataValues.find(dv => dv.dataElement === dataElements.image)?.value || "",
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
