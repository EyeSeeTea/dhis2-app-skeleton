import { useEffect, useRef } from "react";
import maplibregl, {
    FullscreenControl,
    GeolocateControl,
    Map as MapLibreMap,
    NavigationControl,
    ScaleControl,
} from "maplibre-gl";
import { buildWmsTileUrl } from "./geoserverConfig";
import { geoJsonPoints } from "$/webapp/components/map/points";

const MAP_CONTAINER_ID = "map-container";

export const useMapWithGeoserver = () => {
    const mapRef = useRef<MapLibreMap | null>(null);

    useEffect(() => {
        const container = document.getElementById(MAP_CONTAINER_ID);
        if (!container) return;

        const map = new maplibregl.Map({
            container,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: "raster",
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution: "© OpenStreetMap contributors",
                    },
                },
                layers: [
                    {
                        id: "osm-base",
                        type: "raster",
                        source: "osm",
                    },
                ],
            },
            center: [0, 0],
            zoom: 2,
        });

        mapRef.current = map;

        map.addControl(new NavigationControl(), "top-right");
        map.addControl(new ScaleControl({ maxWidth: 100 }), "bottom-left");
        map.addControl(new FullscreenControl(), "top-right");
        map.addControl(
            new GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
            }),
            "top-right"
        );

        map.on("load", () => {
            console.log("Map loaded, adding layers...");

            // Add points source first
            map.addSource("points", {
                type: "geojson",
                data: geoJsonPoints,
            });

            console.log("Points source added:", geoJsonPoints);

            // Add points layers on top
            map.addLayer({
                id: "points-circle",
                type: "circle",
                source: "points",
                paint: {
                    "circle-radius": 10,
                    "circle-color": "#ff5722",
                    "circle-stroke-width": 3,
                    "circle-stroke-color": "#ffffff",
                },
            });

            console.log("Points circle layer added");

            map.addLayer({
                id: "points-label",
                type: "symbol",
                source: "points",
                layout: {
                    "text-field": ["get", "name"],
                    "text-offset": [0, 1.5],
                    "text-anchor": "top",
                    "text-size": 14,
                },
                paint: {
                    "text-color": "#111111",
                    "text-halo-color": "#ffffff",
                    "text-halo-width": 2,
                },
            });

            console.log("Points label layer added");

            // Add geoserver WMS layer
            map.addSource("geoserver-wms", {
                type: "raster",
                tiles: [buildWmsTileUrl()],
                tileSize: 256,
            });

            map.addLayer(
                {
                    id: "geoserver-wms-layer",
                    type: "raster",
                    source: "geoserver-wms",
                    paint: {
                        "raster-opacity": 0.5,
                    },
                },
                "points-circle" // Add before points so points render on top
            );

            console.log("Geoserver layer added");

            // Fit map to show all points
            const coordinates = geoJsonPoints.features.map(
                (feature: any) => feature.geometry.coordinates
            );

            if (coordinates.length > 0) {
                const bounds = coordinates.reduce(
                    (bounds: any, coord: any) => bounds.extend(coord),
                    new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
                );

                map.fitBounds(bounds, {
                    padding: 100,
                    maxZoom: 5,
                });

                console.log("Map fitted to bounds:", bounds);
            }
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    return { mapRef: mapRef, containerId: MAP_CONTAINER_ID };
};
