import React from "react";
import { TableAction, TableConfig, useSnackbar } from "@eyeseetea/d2-ui-components";
import { User } from "$/domain/entities/User";
import { Id } from "$/domain/entities/Ref";
import i18n from "$/utils/i18n";
import { useAppContext } from "$/webapp/contexts/app-context";
import { GetRows } from "$/webapp/utils/objects-table";
import { UsersFilters } from "$/domain/repositories/UserRepository";
import { UsersFilterInfo } from "$/domain/usecases/GetUsersFilterInfoUseCase";
import { isValueInUnionType, Maybe } from "$/utils/ts-utils";

export type UserRow = User;

export type ConfirmState = {
    title: string;
    message: string;
    onConfirm: () => void;
};

export function useUsersTableConfig(options: {
    info: UsersFilterInfo;
    rowsRef: React.MutableRefObject<UserRow[]>;
    reload: () => void;
    setConfirm: (state: Maybe<ConfirmState>) => void;
}): TableConfig<UserRow> {
    const { info, rowsRef, reload, setConfirm } = options;
    const snackbar = useSnackbar();

    const groupNameById = React.useMemo(
        () => new Map(info.userGroups.map(g => [g.id, g.name])),
        [info.userGroups]
    );

    const roleNameById = React.useMemo(
        () => new Map(info.userRoles.map(r => [r.id, r.name])),
        [info.userRoles]
    );

    const renderIds = React.useCallback(
        (ids: Id[], lookup: Map<Id, string>) => ids.map(id => lookup.get(id) ?? id).join(", "),
        []
    );

    const actions = React.useMemo<TableAction<UserRow>[]>(
        () => [
            {
                name: "copy-username",
                text: i18n.t("Copy username"),
                multiple: false,
                primary: true,
                onClick: selectedIds => {
                    const row = rowsRef.current.find(r => r.id === selectedIds[0]);
                    if (!row) return;
                    void navigator.clipboard.writeText(row.username).then(
                        () =>
                            snackbar.success(
                                i18n.t("Copied {{username}}", { username: row.username })
                            ),
                        () => snackbar.error(i18n.t("Failed to copy to clipboard"))
                    );
                },
            },
            {
                name: "show-roles",
                text: i18n.t("Show roles"),
                multiple: false,
                onClick: selectedIds => {
                    const row = rowsRef.current.find(r => r.id === selectedIds[0]);
                    if (!row) return;
                    const roles = renderIds(row.userRoleIds, roleNameById) || i18n.t("(none)");
                    setConfirm({
                        title: i18n.t("Roles for {{name}}", { name: row.name }),
                        message: roles,
                        onConfirm: () => setConfirm(undefined),
                    });
                },
            },
            {
                name: "disable",
                text: i18n.t("Disable user"),
                multiple: true,
                onClick: selectedIds => {
                    setConfirm({
                        title: i18n.t("Disable users"),
                        message: i18n.t("You are about to disable {{count}} user(s)", {
                            count: selectedIds.length,
                        }),
                        onConfirm: () => {
                            snackbar.info(
                                i18n.t("Disabled {{count}} users (stub)", {
                                    count: selectedIds.length,
                                })
                            );
                            setConfirm(undefined);
                            reload();
                        },
                    });
                },
            },
        ],
        [rowsRef, snackbar, reload, setConfirm, renderIds, roleNameById]
    );

    return React.useMemo(
        () => ({
            columns: [
                {
                    name: "name",
                    text: i18n.t("Name"),
                    sortable: sortableFields.includes("name"),
                },
                {
                    name: "username",
                    text: i18n.t("Username"),
                    sortable: sortableFields.includes("username"),
                },
                {
                    name: "userGroupIds",
                    text: i18n.t("User groups"),
                    sortable: false,
                    getValue: row => renderIds(row.userGroupIds, groupNameById),
                },
                {
                    name: "userRoleIds",
                    text: i18n.t("User roles"),
                    sortable: false,
                    getValue: row => renderIds(row.userRoleIds, roleNameById),
                },
            ],
            details: [
                { name: "id", text: i18n.t("Id") },
                { name: "name", text: i18n.t("Name") },
                { name: "username", text: i18n.t("Username") },
                {
                    name: "userGroupIds",
                    text: i18n.t("User groups"),
                    getValue: row => renderIds(row.userGroupIds, groupNameById),
                },
                {
                    name: "userRoleIds",
                    text: i18n.t("User roles"),
                    getValue: row => renderIds(row.userRoleIds, roleNameById),
                },
            ],
            actions: actions,
            paginationOptions: {
                pageSizeOptions: [10, 25, 50],
                pageSizeInitialValue: 25,
            },
            initialSorting: { field: "name", order: "asc" },
            searchBoxLabel: i18n.t("Search by name or username"),
        }),
        [actions, renderIds, groupNameById, roleNameById]
    );
}

const sortableFields = ["name", "username"] as const;

export function useGetUsersRows(options: {
    filters: UsersFilters;
    refreshKey: number;
    rowsRef: React.MutableRefObject<UserRow[]>;
}): {
    getRows: GetRows<UserRow>;
    loading: boolean;
} {
    const { filters, refreshKey, rowsRef } = options;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [loading, setLoading] = React.useState(false);

    const getRows = React.useCallback<GetRows<UserRow>>(
        (search, paging, sorting) =>
            new Promise((resolve, reject) => {
                void refreshKey; // to trigger refresh when refreshKey changes
                setLoading(true);

                const sortingField = isValueInUnionType(sorting.field, sortableFields)
                    ? sorting.field
                    : "name";

                return compositionRoot.users.get
                    .execute({
                        search: search,
                        page: paging.page,
                        pageSize: paging.pageSize,
                        filters: filters,
                        order: { field: sortingField, order: sorting.order },
                    })
                    .run(
                        response => {
                            rowsRef.current = response.objects;
                            resolve(response);
                            setLoading(false);
                        },
                        err => {
                            snackbar.error(err.message);
                            setLoading(false);
                            reject(err);
                        }
                    );
            }),
        [compositionRoot, snackbar, refreshKey, filters, rowsRef]
    );

    return { getRows, loading };
}
