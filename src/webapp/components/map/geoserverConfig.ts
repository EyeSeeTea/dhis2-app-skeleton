export const GEOSERVER_WMS_BASE_URL = "/geoserver/ne/wms";
export const GEOSERVER_LAYER_NAME = "ne:world";

export const buildWmsTileUrl = () =>
    `${GEOSERVER_WMS_BASE_URL}?` +
    [
        "service=WMS",
        "request=GetMap",
        "version=1.1.1",
        `layers=${GEOSERVER_LAYER_NAME}`,
        "styles=",
        "format=image/png",
        "transparent=true",
        "bbox={bbox-epsg-3857}",
        "srs=EPSG:3857",
        "width=256",
        "height=256",
    ].join("&");
