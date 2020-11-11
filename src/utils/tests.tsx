import { render, RenderResult } from "@testing-library/react";
import { SnackbarProvider } from "d2-ui-components";
import React, { ReactNode } from "react";
import { getMockApi } from "../types/d2-api";
import { AppContext } from "../webapp/contexts/app-context";
import { Config } from "./../models/Config";
import { User } from "./../models/User";

export function getTestUser() {
    return new User({
        id: "xE7jOejl9FI",
        displayName: "John Traore",
        username: "admin",
        organisationUnits: [
            {
                level: 1,
                id: "ImspTQPwCqd",
                path: "/ImspTQPwCqd",
            },
        ],
        userRoles: [],
    });
}

export function getTestConfig() {
    return new Config({
        base: {},
        categoryCombos: [],
    });
}

export function getTestD2() {
    return {};
}

export function getTestContext() {
    const { api, mock } = getMockApi();

    return {
        mock,
        api,
        context: {
            api: api,
            d2: getTestD2(),
            currentUser: getTestUser(),
            config: getTestConfig(),
        },
    };
}

export function getReactComponent(children: ReactNode, context: AppContext): RenderResult {
    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}