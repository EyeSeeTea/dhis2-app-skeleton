import { NamedRef } from "$/domain/entities/Ref";

export type PointFeatureProperties = NamedRef;

export const geoJsonPoints: GeoJSON.FeatureCollection = {
    type: "FeatureCollection" as const,
    features: [
        {
            type: "Feature",
            properties: { name: "Lagos" },
            geometry: {
                type: "Point",
                coordinates: [3.3792, 6.5244],
            },
        },
        {
            type: "Feature",
            properties: { name: "London" },
            geometry: {
                type: "Point",
                coordinates: [-0.1276, 51.5074],
            },
        },
    ],
};
