import React, { useContext } from "react";
import { CompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";
import { assert } from "$/utils/assert";

export type AppContextState = {
    currentUser: User;
    compositionRoot: CompositionRoot;
};

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    assert(context, "App context uninitialized");
    return context;
}
