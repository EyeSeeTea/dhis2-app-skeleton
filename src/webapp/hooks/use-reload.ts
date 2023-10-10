import { useState, useCallback } from "react";

export function useReload(): [string, () => void] {
    const [state, updateState] = useState(`${Math.random()}`);

    const reload = useCallback(() => {
        updateState(`${Math.random()}`);
    }, []);

    return [state, reload];
}
