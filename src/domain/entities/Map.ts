import { Maybe } from "$/utils/ts-utils";
import { Struct } from "./generic/Struct";
import { Id } from "./Ref";

export class Map extends Struct<MapAttrs>() {
    hasLayers(): boolean {
        return this.data.layers.length > 0;
    }

    getLayer(layerId: Id): Maybe<MapLayer> {
        return this.data.layers.find(layer => layer.id === layerId);
    }

    addLayer(layer: MapLayer): Map {
        const updatedLayers = [...this.data.layers, layer];

        return this._update({
            data: { ...this.data, layers: updatedLayers },
        });
    }

    removeLayer(layerId: Id): Map {
        const updatedLayers = this.data.layers.filter(layer => layer.id !== layerId);
        if (updatedLayers.length === this.data.layers.length) return this;

        return this._update({
            data: { ...this.data, layers: updatedLayers },
        });
    }

    updateOptions(options: Partial<MapOptions>): Map {
        return this._update({
            options: { ...this.options, ...options },
        });
    }

    getVisibleLayerCount(): number {
        return this.data.layers.filter(layer => layer.visible).length;
    }
}

export type MapAttrs = {
    id: Id;
    title: string;
    description?: string;
    created?: Date;
    lastUpdated?: Date;
    options: MapOptions;
    data: MapData;
};

export type MapOptions = {
    center: [number, number];
    zoom: number;
    bounds?: [number, number, number, number];
    styleUrl?: string;
    controls?: MapControls;
    interactions?: MapInteractions;
};

export type MapControls = {
    navigation?: boolean;
    scale?: boolean;
    fullscreen?: boolean;
};

export type MapInteractions = {
    drag?: boolean;
    zoom?: boolean;
    rotate?: boolean;
};

export type MapData = {
    sources: MapDataSource[];
    layers: MapLayer[];
};

export type MapDataSource = {
    id: Id;
    type: "vector" | "geojson" | "raster";
    url?: string;
    data?: GeoJSONData[];
};

export type GeoJSONData = {
    id?: Id;
    geometry: GeoJSONGeometry;
    properties?: Record<string, unknown>;
};

export type GeoJSONGeometry = {
    type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
    coordinates: number[] | number[][] | number[][][] | number[][][][];
};

export type MapLayer = {
    id: Id;
    type: MapLayerType;
    sourceId?: Id;
    paint?: MapLayerPaint;
    interactive?: boolean;
    visible?: boolean;
};

type MapLayerPaint = {
    "fill-color"?: string;
    "fill-opacity"?: number;
    "circle-radius"?: number;
    "circle-color"?: string;
    "circle-opacity"?: number;
};

export type MapLayerType =
    | "fill"
    | "line"
    | "symbol"
    | "circle"
    | "heatmap"
    | "fill-extrusion"
    | "raster"
    | "hillshade"
    | "background";
