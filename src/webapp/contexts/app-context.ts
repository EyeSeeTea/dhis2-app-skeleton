import React, { useContext } from "react";
import { CompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";

export type AppContextState = {
    currentUser: User;
    compositionRoot: CompositionRoot;
};

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) throw new Error("App context uninitialized");
    return context;
}
