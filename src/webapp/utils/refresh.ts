import React from "react";

type RefreshFun = () => void;

/**
 * A hook that provides a refresh function and a refresh key. The refresh key can be used as a dependency in other hooks to trigger a refresh when the refresh function is called.
 */
export function useRefresh(): [number, RefreshFun] {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const refresh = React.useCallback(() => setRefreshKey(k => k + 1), []);
    return [refreshKey, refresh];
}
