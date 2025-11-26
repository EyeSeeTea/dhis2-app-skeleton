import { FutureData } from "$/data/api-futures";
import { Future } from "$/domain/entities/generic/Future";
import { Map } from "$/domain/entities/Map";
import { MapRepository } from "$/domain/repositories/MapRepository";

export class MapTestRepository implements MapRepository {
    getAll(): FutureData<Map[]> {
        return Future.success([]);
    }
}
