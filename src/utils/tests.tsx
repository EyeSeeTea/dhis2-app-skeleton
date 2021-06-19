import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { render, RenderResult } from "@testing-library/react";
import { ReactNode } from "react";
import { getCompositionRoot } from "../CompositionRoot";
import { User } from "../domain/entities/User";
import { getMockApi } from "../types/d2-api";
import { AppContext, AppContextState } from "../webapp/contexts/AppContext";

export function getTestUser(): User {
    return {
        id: "xE7jOejl9FI",
        name: "John Traore",
        username: "admin",
        organisationUnits: [{ level: 1, id: "ImspTQPwCqd", path: "/ImspTQPwCqd" }],
        userRoles: [],
    };
}

export function getTestConfig() {
    return {};
}

export function getTestD2() {
    return {};
}

export function getTestContext() {
    const { api, mock } = getMockApi();
    const context = {
        api: api,
        d2: getTestD2(),
        currentUser: getTestUser(),
        config: getTestConfig(),
        compositionRoot: getCompositionRoot(api),
    };

    return { mock, api, context };
}

export function getReactComponent(children: ReactNode, context: AppContextState): RenderResult {
    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}
