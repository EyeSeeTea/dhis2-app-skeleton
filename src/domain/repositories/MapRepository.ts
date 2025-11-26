import { FutureData } from "$/data/api-futures";
import { Map } from "$/domain/entities/Map";

export interface MapRepository {
    getAll(): FutureData<Map[]>;
}
