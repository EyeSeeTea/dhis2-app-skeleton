import i18n from "@dhis2/d2-i18n";
import { Typography } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import { useAppContext } from "../../contexts/AppContext";

export const ExamplePage: React.FC = () => {
    const { currentUser } = useAppContext();

    return (
        <Container>
            <React.Fragment>
                <Typography variant="h4">{i18n.t("Hello {{name}}", { name: currentUser.name })}</Typography>
                <Typography variant="h6">{i18n.t("Welcome to DHIS2!")}</Typography>
            </React.Fragment>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
`;
