import { render, RenderResult } from "@testing-library/react";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { ReactNode } from "react";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { createAdminUser } from "$/domain/entities/__tests__/userFixtures";
import { D2Api } from "@eyeseetea/d2-api/2.36";

export function getTestContext() {
    const context: AppContextState = {
        api: {} as D2Api,
        currentUser: createAdminUser(),
        compositionRoot: getTestCompositionRoot(),
    };

    return context;
}

export function getReactComponent(children: ReactNode): RenderResult {
    const context = getTestContext();

    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}
