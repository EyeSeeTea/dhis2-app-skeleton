import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import i18n from "$/utils/i18n";
import { PageHeader } from "$/webapp/components/page-header/PageHeader";

export const ExamplePage: React.FC<ExamplePageProps> = React.memo(props => {
    const { name } = props;
    const title = i18n.t("Hello {{name}}", { name });
    const history = useHistory();

    const goBack = React.useCallback(() => {
        history.goBack();
    }, [history]);

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Detail page")} onBackClick={goBack} />
            <Title>{title}</Title>
        </React.Fragment>
    );
});

const Title = styled.h2`
    color: blue;
`;

interface ExamplePageProps {
    name: string;
}
