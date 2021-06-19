import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import { ExamplePage } from "./example/ExamplePage";

export const Router = () => {
    return (
        <Container>
            <HashRouter>
                <Switch>
                    <Route render={() => <ExamplePage />} />
                </Switch>
            </HashRouter>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;
`;
