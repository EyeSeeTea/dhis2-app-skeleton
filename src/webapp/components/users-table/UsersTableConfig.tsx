import React from "react";
import { TableAction, TableConfig, TableSorting, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Tooltip } from "@material-ui/core";
import { User } from "$/domain/entities/User";
import i18n from "$/utils/i18n";
import { useAppContext } from "$/webapp/contexts/app-context";
import { GetRowsFuture } from "$/webapp/utils/objects-table";
import { GetUsersOptions, UsersFilters } from "$/domain/repositories/UserRepository";
import { FutureData } from "$/domain/entities/generic/Future";
import { Paginated } from "$/domain/entities/generic/Pagination";
import { UserView } from "./UserView";
import { isValueInUnionType, Maybe } from "$/utils/ts-utils";

export type UserRow = User;

export type ConfirmState = {
    title: string;
    message: string;
    onConfirm: () => void;
};

export function useUsersTableConfig(options: {
    userView: UserView;
    rows: UserRow[];
    reloadRef: React.MutableRefObject<() => void>;
    setConfirm: (state: Maybe<ConfirmState>) => void;
}): TableConfig<UserRow> {
    const { userView, rows, reloadRef, setConfirm } = options;
    const snackbar = useSnackbar();

    const actions = React.useMemo<TableAction<UserRow>[]>(
        () => [
            {
                name: "copy-username",
                text: i18n.t("Copy username"),
                multiple: false,
                primary: true,
                onClick: selectedIds => {
                    const row = rows.find(r => r.id === selectedIds[0]);
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
                    const row = rows.find(r => r.id === selectedIds[0]);
                    if (!row) return;
                    const roles = userView.renderUserRoles(row) || i18n.t("(none)");
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
                            reloadRef.current();
                        },
                    });
                },
            },
        ],
        [rows, snackbar, reloadRef, setConfirm, userView]
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
                    getValue: row =>
                        renderNamesCell(
                            userView.renderUserGroups(row, { ellipsis: maxNamesInColumn }),
                            userView.renderUserGroups(row)
                        ),
                },
                {
                    name: "userRoleIds",
                    text: i18n.t("User roles"),
                    sortable: false,
                    getValue: row =>
                        renderNamesCell(
                            userView.renderUserRoles(row, { ellipsis: maxNamesInColumn }),
                            userView.renderUserRoles(row)
                        ),
                },
                {
                    name: "disabled",
                    text: i18n.t("Status"),
                    sortable: true,
                    getValue: row => (row.disabled ? i18n.t("Disabled") : i18n.t("Enabled")),
                },
            ],
            details: [
                { name: "id", text: i18n.t("Id") },
                { name: "name", text: i18n.t("Name") },
                { name: "username", text: i18n.t("Username") },
                {
                    name: "userGroupIds",
                    text: i18n.t("User groups"),
                    getValue: row => userView.renderUserGroups(row),
                },
                {
                    name: "userRoleIds",
                    text: i18n.t("User roles"),
                    getValue: row => userView.renderUserRoles(row),
                },
            ],
            actions: actions,
            paginationOptions: {
                pageSizeOptions: [10, 25, 50],
                pageSizeInitialValue: 25,
            },
            initialSorting: initialSorting,
            searchBoxLabel: i18n.t("Search by name or username"),
        }),
        [actions, userView]
    );
}

/* useObjectsTable reloads the rows whenever the identity of config.initialSorting changes, so it
   must be a constant: the config is rebuilt every time the rows change (the actions use them). */
const initialSorting: TableSorting<UserRow> = { field: "name", order: "asc" };

const sortableFields = ["name", "username", "disabled"] as const;

/* Groups/roles shown in a table cell. The details panel and the roles dialog show them all. */
const maxNamesInColumn = 3;

/* Shows the names that fit in the cell, with the full list as its tooltip. */
function renderNamesCell(shown: string, all: string): React.ReactNode {
    return (
        <Tooltip title={all} placement="bottom-start">
            <span>{shown}</span>
        </Tooltip>
    );
}

/* Users requested in a single call when the whole selection is needed (the CSV export). Users
   beyond this limit are not exported, the caller is expected to report it (see pager.total). */
const maxUsersInSingleRequest = 10_000;

export function useGetUsersRows(options: { filters: UsersFilters }): {
    getRows: GetRowsFuture<UserRow>;
    getAllRows: () => FutureData<Paginated<UserRow>>;
    rows: UserRow[];
} {
    const { filters } = options;
    const { compositionRoot } = useAppContext();
    const [rows, setRows] = React.useState<UserRow[]>([]);
    const [query, setQuery] = React.useState<UsersQuery>(initialQuery);

    const getRows = React.useCallback<GetRowsFuture<UserRow>>(
        (search, paging, sorting) => {
            const sortingField = isValueInUnionType(sorting.field, sortableFields)
                ? sorting.field
                : "name";

            const query: UsersQuery = {
                search: search,
                order: { field: sortingField, order: sorting.order },
            };

            setQuery(query);

            return compositionRoot.users.get
                .execute({
                    ...query,
                    page: paging.page,
                    pageSize: paging.pageSize,
                    filters: filters,
                })
                .map(response => {
                    /* Keep the rows shown: the row actions look them up to find the selected
                       row, and they are built before the table props exist. A cancelled request
                       rejects, so a stale response never reaches this point. */
                    setRows(response.objects);
                    return response;
                });
        },
        [compositionRoot, filters]
    );

    /* Same search/filters/order as the rows currently shown, but all of them in a single page. */
    const getAllRows = React.useCallback(
        () =>
            compositionRoot.users.get.execute({
                ...query,
                page: 1,
                pageSize: maxUsersInSingleRequest,
                filters: filters,
            }),
        [compositionRoot, filters, query]
    );

    return { getRows, getAllRows, rows };
}

type UsersQuery = Pick<GetUsersOptions, "search" | "order">;

const initialQuery: UsersQuery = { search: "", order: { field: "name", order: "asc" } };
