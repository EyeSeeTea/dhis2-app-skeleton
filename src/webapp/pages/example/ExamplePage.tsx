import React from "react";
import styled from "styled-components";
import i18n from "../../../locales";

export const ExamplePage: React.FC<ExamplePageProps> = props => {
    const { name } = props;
    const title = i18n.t("Hello {{name}}", { name });

    return (
        <React.Fragment>
            <Title>{title}</Title>
        </React.Fragment>
    );
};
const Title = styled.h2`
    color: blue;
`;

interface ExamplePageProps {
    name: string;
}
