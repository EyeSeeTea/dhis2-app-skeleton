import React, { useContext } from "react";
import { CompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";
import { D2Api } from "@eyeseetea/d2-api/2.36";

export interface AppContextState {
    currentUser: User;
    compositionRoot: CompositionRoot;
    api: D2Api;
}

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
