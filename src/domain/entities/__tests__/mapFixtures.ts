import { Map, MapLayer } from "$/domain/entities/Map";

export function createMapWithLayer(): Map {
    const layer: MapLayer = {
        id: "layer-1",
        type: "fill",
        sourceId: "source-1",
        paint: {
            "fill-color": "#0000FF",
            "fill-opacity": 0.5,
        },
        visible: true,
    };

    return createBasicMap([layer]);
}

export function createBasicMap(layers?: MapLayer[]): Map {
    return new Map({
        id: "test-map",
        title: "Test Map",
        options: {
            center: [0, 0],
            zoom: 2,
        },
        data: {
            sources: [],
            layers: layers ?? [],
        },
    });
}
