import React from "react";
import styled from "styled-components";
import { useMapWithGeoserver } from "$/webapp/components/map/useMapWithGeoserver";
import i18n from "$/utils/i18n";

const Map: React.FC = () => {
    const { mapContainerRef } = useMapWithGeoserver();

    return (
        <MapBox>
            <MapTitle>{i18n.t("Map")}</MapTitle>
            <MapContainer ref={mapContainerRef}></MapContainer>
        </MapBox>
    );
};

export default Map;

const MapContainer = styled.div`
    width: 100%;
    height: 40rem;
`;

const MapBox = styled.div`
    min-width: 30rem;
    height: 40rem;
    margin-block: 2rem;
    margin-inline: 2rem;
`;

const MapTitle = styled.div`
    font-weight: bold;
    font-size: 1.25rem;
    padding-block-end: 2rem;
    width: 100%;
`;
