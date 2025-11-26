import { createBasicMap, createMapWithLayer } from "$/domain/entities/__tests__/mapFixtures";
import { Map, MapLayer, MapDataSource } from "$/domain/entities/Map";

describe("Map Entity", () => {
    describe("hasLayers", () => {
        it("should return false for a map with no layers", () => {
            const map = createBasicMap();
            expect(map.hasLayers()).toBe(false);
        });

        it("should return true for a map with layers", () => {
            const map = createMapWithLayer();
            expect(map.hasLayers()).toBe(true);
        });
    });

    describe("getLayer", () => {
        it("should retrieve a layer by id", () => {
            const map = createMapWithLayer();
            const layer = map.getLayer("layer-1");

            expect(layer).toBeDefined();
            expect(layer?.id).toBe("layer-1");
        });

        it("should return undefined for non-existent layer", () => {
            const map = createMapWithLayer();
            const layer = map.getLayer("non-existent");

            expect(layer).toBeUndefined();
        });
    });

    describe("addLayer", () => {
        it("should add a new layer to the map", () => {
            const map = createBasicMap();
            const newLayer: MapLayer = {
                id: "layer-2",
                type: "circle",
                sourceId: "source-1",
                paint: {
                    "circle-radius": 6,
                    "circle-color": "#FF0000",
                },
                visible: true,
            };

            const updatedMap = map.addLayer(newLayer);
            expect(updatedMap.data.layers).toHaveLength(1);
            expect(updatedMap.data.layers[0]?.id).toBe("layer-2");
            expect(map.data.layers).toHaveLength(0);
        });

        it("should maintain immutability when adding layers", () => {
            const originalMap = createBasicMap();
            const layer: MapLayer = {
                id: "new-layer",
                type: "fill",
                sourceId: "source-1",
                visible: true,
            };

            const updatedMap = originalMap.addLayer(layer);

            expect(originalMap.data.layers).toHaveLength(0);
            expect(updatedMap.data.layers).toHaveLength(1);
            expect(originalMap).not.toBe(updatedMap);
        });
    });

    describe("removeLayer", () => {
        it("should remove a layer by id", () => {
            const map = createMapWithLayer();
            const updatedMap = map.removeLayer("layer-1");

            expect(updatedMap.data.layers).toHaveLength(0);
            expect(map.data.layers).toHaveLength(1);
        });

        it("should return the same instance if layer doesn't exist", () => {
            const map = createMapWithLayer();
            const updatedMap = map.removeLayer("non-existent");

            expect(updatedMap).toBe(map);
        });
    });

    describe("updateOptions", () => {
        it("should update map options", () => {
            const map = createBasicMap();
            const updatedMap = map.updateOptions({
                center: [10, 20],
                zoom: 8,
            });

            expect(updatedMap.options.center).toEqual([10, 20]);
            expect(updatedMap.options.zoom).toBe(8);

            expect(map.options.center).toEqual([0, 0]);
            expect(map.options.zoom).toBe(2);
        });

        it("should partially update options without affecting others", () => {
            const map = createBasicMap();
            const updatedMap = map.updateOptions({ zoom: 5 });

            expect(updatedMap.options.zoom).toBe(5);
            expect(updatedMap.options.center).toEqual([0, 0]);
        });
    });

    describe("getVisibleLayerCount", () => {
        it("should count only visible layers", () => {
            const layers: MapLayer[] = [
                {
                    id: "layer-1",
                    type: "fill",
                    sourceId: "source-1",
                    visible: true,
                },
                {
                    id: "layer-2",
                    type: "line",
                    sourceId: "source-1",
                    visible: false,
                },
                {
                    id: "layer-3",
                    type: "circle",
                    sourceId: "source-2",
                    visible: true,
                },
            ];
            const map = createBasicMap(layers);
            expect(map.getVisibleLayerCount()).toBe(2);
        });

        it("should return 0 when no layers are visible", () => {
            const layers: MapLayer[] = [
                {
                    id: "layer-1",
                    type: "fill",
                    sourceId: "source-1",
                    visible: false,
                },
            ];
            const map = createBasicMap(layers);
            expect(map.getVisibleLayerCount()).toBe(0);
        });
    });

    it("should handle a realistic health facility map", () => {
        const source: MapDataSource = {
            id: "facilities-source",
            type: "geojson",
            data: [
                {
                    id: "facility-1",
                    geometry: {
                        type: "Point",
                        coordinates: [36.8219, -1.2921],
                    },
                    properties: {
                        name: "Central Hospital",
                        type: "hospital",
                        beds: 200,
                    },
                },
            ],
        };

        const layer: MapLayer[] = [
            {
                id: "hospitals-layer",
                type: "circle",
                sourceId: "facilities-source",
                paint: {
                    "circle-radius": 8,
                    "circle-opacity": 0.8,
                },
                visible: true,
                interactive: true,
            },
        ];

        const map = new Map({
            id: "health-map",
            title: "Health Facilities Map",
            description: "Interactive map of health facilities",
            options: {
                center: [36.8219, -1.2921],
                zoom: 10,
                styleUrl: "https://demotiles.maplibre.org/style.json",
                controls: {
                    navigation: true,
                    scale: true,
                },
                interactions: {
                    drag: true,
                    zoom: true,
                    rotate: false,
                },
            },
            data: {
                sources: [source],
                layers: layer,
            },
        });

        expect(map.hasLayers()).toBe(true);
        expect(map.getVisibleLayerCount()).toBe(1);

        const hospitalLayer = map.getLayer("hospitals-layer");
        expect(hospitalLayer?.interactive).toBe(true);
    });
});
