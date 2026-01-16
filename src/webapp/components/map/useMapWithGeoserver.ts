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

export type InitialCoordinates = {
    center: [number, number];
    maxZoom: number;
    minZoom: number;
    zoom: number;
};

const initialData: InitialCoordinates = {
    center: [13.675063, 51.751569],
    maxZoom: 8,
    minZoom: 2.5,
    zoom: 2.5,
};

export const useMapWithGeoserver = () => {
    const mapRef = useRef<MapLibreMap | null>(null);
    const mapContainer = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: mapStyle,
            center: initialData.center,
            zoom: initialData.zoom,
            maxZoom: initialData.maxZoom,
            minZoom: initialData.minZoom,
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
            map.addSource("geoserver-wms", {
                type: "raster",
                tiles: [buildWmsTileUrl()],
                tileSize: 256,
            });

            map.addLayer({
                id: "geoserver-wms-layer",
                type: "raster",
                source: "geoserver-wms",
                paint: {
                    "raster-opacity": 0.5,
                },
            });

            geoJsonPoints.features.forEach(feature => {
                const popup = new maplibregl.Popup({ offset: 25 }).setText(feature.properties.name);

                new maplibregl.Marker({ color: "#ff5722" })
                    .setLngLat(feature.geometry.coordinates as [number, number])
                    .setPopup(popup)
                    .addTo(map);
            });

            const coordinates = geoJsonPoints.features.map(
                feature => feature.geometry.coordinates as [number, number]
            );

            if (coordinates.length > 0) {
                const bounds = coordinates.reduce(
                    (bounds, coord) => bounds.extend(coord),
                    new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
                );

                map.fitBounds(bounds, {
                    padding: 100,
                    maxZoom: 5,
                });
            }
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    return { mapRef: mapRef, mapContainerRef: mapContainer };
};

const mapStyle: maplibregl.StyleSpecification = {
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
};
