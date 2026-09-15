import React from "react";
import { Future } from "$/domain/entities/generic/Future";
import { UserGroup } from "$/domain/entities/UserGroup";
import { UserRole } from "$/domain/entities/UserRole";
import { useAppContext } from "$/webapp/contexts/app-context";
import { Loader } from "$/webapp/utils/Loader";

export type UsersFilterInfo = {
    userGroups: UserGroup[];
    userRoles: UserRole[];
};

export function useUsersFilterInfo(): Loader<UsersFilterInfo> {
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = React.useState<Loader<UsersFilterInfo>>({ type: "loading" });

    React.useEffect(() => {
        return Future.joinObj(
            {
                userGroups: compositionRoot.userGroups.get.execute(),
                userRoles: compositionRoot.userRoles.get.execute(),
            },
            { concurrency: 2 }
        ).run(
            data => setLoader({ type: "success", data: data }),
            error => setLoader({ type: "error", error: error })
        );
    }, [compositionRoot]);

    return loader;
}
