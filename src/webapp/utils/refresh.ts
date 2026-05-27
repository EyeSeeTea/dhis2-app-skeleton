import React from "react";

type RefreshFun = () => void;

export function useRefresh(): [number, RefreshFun] {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const refresh = React.useCallback(() => setRefreshKey(k => k + 1), []);
    return [refreshKey, refresh];
}
