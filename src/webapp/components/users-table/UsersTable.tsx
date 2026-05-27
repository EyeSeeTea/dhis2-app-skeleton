import React from "react";
import styled from "styled-components";
import { CircularProgress, Typography } from "@material-ui/core";
import {
    ConfirmationDialog,
    ObjectsTable,
    TableGlobalAction,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import GetAppIcon from "@material-ui/icons/GetApp";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useAppContext } from "$/webapp/contexts/app-context";
import i18n from "$/utils/i18n";
import { UsersFilterInfo } from "$/domain/usecases/GetUsersFilterInfoUseCase";
import { Maybe } from "$/utils/ts-utils";
import { ConfirmState, UserRow, useGetUsersRows, useUsersTableConfig } from "./UsersTableConfig";
import {
    FiltersState,
    initialFiltersState,
    toUsersFilters,
    UsersTableFilters,
} from "./UsersTableFilters";
import { useRefresh } from "$/webapp/utils/refresh";

export const UsersTable: React.FC = React.memo(() => {
    const filterInfo = useFilterInfo();

    if (!filterInfo) {
        return (
            <LoadingWrapper>
                <CircularProgress />
            </LoadingWrapper>
        );
    }

    return <UsersTableLoaded filterInfo={filterInfo} />;
});

const UsersTableLoaded: React.FC<{ filterInfo: UsersFilterInfo }> = React.memo(props => {
    const { filterInfo } = props;
    const [filtersState, setFiltersState] = React.useState<FiltersState>(initialFiltersState);
    const [confirm, setConfirm] = React.useState<Maybe<ConfirmState>>(undefined);
    const rowsRef = React.useRef<UserRow[]>([]);

    const [refreshKey, refresh] = useRefresh();
    const filters = React.useMemo(() => toUsersFilters(filtersState), [filtersState]);

    const { getRows, loading } = useGetUsersRows({ filters, refreshKey, rowsRef });
    const config = useUsersTableConfig({ info: filterInfo, rowsRef, reload: refresh, setConfirm });
    const tableProps = useObjectsTable<UserRow>(config, getRows);

    const globalActions = React.useMemo<TableGlobalAction[]>(
        () => [
            {
                name: "refresh",
                text: i18n.t("Refresh"),
                icon: <RefreshIcon />,
                onClick: () => refresh(),
            },
            {
                name: "export-csv",
                text: i18n.t("Export CSV"),
                icon: <GetAppIcon />,
                onClick: () => exportRowsToCsv(rowsRef.current, filterInfo),
            },
        ],
        [refresh, filterInfo]
    );

    const filterComponents = (
        <UsersTableFilters info={filterInfo} selection={filtersState} onChange={setFiltersState} />
    );

    const closeConfirm = React.useCallback(() => setConfirm(undefined), []);

    return (
        <Wrapper>
            <ObjectsTable<UserRow>
                {...tableProps}
                loading={loading}
                globalActions={globalActions}
                filterComponents={filterComponents}
            />

            {confirm && (
                <ConfirmationDialog
                    isOpen
                    title={confirm.title}
                    saveText={i18n.t("OK")}
                    onSave={confirm.onConfirm}
                    cancelText={i18n.t("Cancel")}
                    onCancel={closeConfirm}
                    onClose={closeConfirm}
                    maxWidth="sm"
                    fullWidth
                >
                    <Typography variant="body2">{confirm.message}</Typography>
                </ConfirmationDialog>
            )}
        </Wrapper>
    );
});

function useFilterInfo(): Maybe<UsersFilterInfo> {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [info, setInfo] = React.useState<UsersFilterInfo>();

    React.useEffect(() => {
        return compositionRoot.users.getFiltersInfo
            .execute()
            .run(setInfo, err => snackbar.error(err.message));
    }, [compositionRoot, snackbar]);

    return info;
}

function exportRowsToCsv(rows: UserRow[], info: UsersFilterInfo): void {
    const groupName = new Map(info.userGroups.map(g => [g.id, g.name]));
    const roleName = new Map(info.userRoles.map(r => [r.id, r.name]));
    const header = ["id", "name", "username", "userGroups", "userRoles"].join(",");
    const body = rows
        .map(row =>
            [
                row.id,
                quote(row.name),
                quote(row.username),
                quote(row.userGroupIds.map(id => groupName.get(id) ?? id).join("; ")),
                quote(row.userRoleIds.map(id => roleName.get(id) ?? id).join("; ")),
            ].join(",")
        )
        .join("\n");

    saveFile({
        filename: "users.csv",
        content: `${header}\n${body}`,
        contentType: "text/csv",
    });
}

function saveFile(options: { filename: string; content: string; contentType: string }): void {
    const blob = new Blob([options.content], { type: options.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = options.filename;
    a.click();
    URL.revokeObjectURL(url);
}

function quote(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

const Wrapper = styled.div`
    margin: 10px;
`;

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px;
`;
