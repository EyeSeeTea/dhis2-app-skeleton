import { NamedRef } from "$/domain/entities/Ref";

export type PointFeatureProperties = NamedRef;

export const geoJsonPoints: GeoJSON.FeatureCollection<GeoJSON.Point, PointFeatureProperties> = {
    type: "FeatureCollection" as const,
    features: [
        {
            type: "Feature",
            properties: { id: "lagos", name: "Lagos" },
            geometry: {
                type: "Point",
                coordinates: [3.3792, 6.5244],
            },
        },
        {
            type: "Feature",
            properties: { id: "madrid", name: "Madrid" },
            geometry: {
                type: "Point",
                coordinates: [-3.7038, 40.4168],
            },
        },
    ],
};
