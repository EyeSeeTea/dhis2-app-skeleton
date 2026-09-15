import { HashRouter, Route, Switch } from "react-router-dom";
import { ExamplePage } from "./example/ExamplePage";
import { LandingPage } from "./landing/LandingPage";
import { UsersPage } from "./users/UsersPage";

// TODO: create a typesafe custom router over react-router-dom with both matching and parsing of
// paths, query params and hash params, and with a single source of truth for all routes in the app.
export function Router() {
    return (
        <HashRouter>
            <Switch>
                <Route
                    path="/for/:name?"
                    render={({ match }) => <ExamplePage name={match.params.name ?? "Stranger"} />}
                />

                <Route path="/users" render={() => <UsersPage />} />

                {/* Default route */}
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
}
