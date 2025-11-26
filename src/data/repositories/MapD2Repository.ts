import { FutureData } from "$/data/api-futures";
import { Future } from "$/domain/entities/generic/Future";
import { Map } from "$/domain/entities/Map";
import { MapRepository } from "$/domain/repositories/MapRepository";

export class MapD2Repository implements MapRepository {
    getAll(): FutureData<Map[]> {
        // TODO: Implement fetching maps from d2-api (maybe from geometry property in TEIs or events)/supabase
        return Future.success([]);
    }
}
