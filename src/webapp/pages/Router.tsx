import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { ExamplePage } from "./example/ExamplePage";
import { LandingPage } from "./landing/LandingPage";
import { AuditsTable } from "@eyeseetea/d2-audit-report";
import { useAppContext } from "$/webapp/contexts/app-context";

export function Router() {
    const { compositionRoot } = useAppContext();
    return (
        <HashRouter>
            <Switch>
                <Route
                    path="/for/:name?"
                    render={({ match }) => <ExamplePage name={match.params.name ?? "Stranger"} />}
                />

                <Route
                    path="/audits"
                    render={() => (
                        <div style={{ padding: "20px" }}>
                            <AuditsTable baseUrl={compositionRoot.config.baseurl || ""} />
                        </div>
                    )}
                />

                {/* Default route */}
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
}
