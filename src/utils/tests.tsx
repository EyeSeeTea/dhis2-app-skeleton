import { ReactNode } from "react";
import { render, RenderResult } from "@testing-library/react";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { createAdminUser } from "$/domain/entities/__tests__/userFixtures";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";

export function getTestContext(): AppContextState {
    return {
        currentUser: createAdminUser(),
        compositionRoot: getTestCompositionRoot(),
    };
}

export function getReactComponent(children: ReactNode): RenderResult {
    const context = getTestContext();

    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}
