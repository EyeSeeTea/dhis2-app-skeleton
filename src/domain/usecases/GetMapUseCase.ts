import { FutureData } from "$/data/api-futures";
import { Map } from "$/domain/entities/Map";
import { MapRepository } from "$/domain/repositories/MapRepository";

export class GetMapsUseCase {
    constructor(private mapRepository: MapRepository) {}

    execute(): FutureData<Map[]> {
        return this.mapRepository.getAll();
    }
}
