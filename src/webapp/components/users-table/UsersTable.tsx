import React from "react";
import { CircularProgress, Typography } from "@material-ui/core";
import {
    ConfirmationDialog,
    ObjectsTable,
    TableGlobalAction,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import GetAppIcon from "@material-ui/icons/GetApp";
import RefreshIcon from "@material-ui/icons/Refresh";
import i18n from "$/utils/i18n";
import { Maybe } from "$/utils/ts-utils";
import styles from "./UsersTable.module.css";
import { useObjectsTableFuture } from "$/webapp/utils/objects-table";
import { UsersFilterInfo, useUsersFilterInfo } from "./useUsersFilterInfo";
import { useExportUsersCsv } from "./useExportUsersCsv";
import { UserView } from "./UserView";
import { ConfirmState, UserRow, useGetUsersRows, useUsersTableConfig } from "./UsersTableConfig";
import {
    FiltersState,
    initialFiltersState,
    toUsersFilters,
    UsersTableFilters,
} from "./UsersTableFilters";
export const UsersTable: React.FC = React.memo(() => {
    const filterInfo = useUsersFilterInfo();

    switch (filterInfo.type) {
        case "loading":
            return (
                <div className={styles.loadingWrapper}>
                    <CircularProgress />
                </div>
            );
        case "error":
            return (
                <div className={styles.loadingWrapper}>
                    <Typography color="error">{filterInfo.error.message}</Typography>
                </div>
            );
        case "success":
            return <UsersTableLoaded filterInfo={filterInfo.data} />;
    }
});

const UsersTableLoaded: React.FC<{ filterInfo: UsersFilterInfo }> = React.memo(props => {
    const { filterInfo } = props;
    const [filtersState, setFiltersState] = React.useState<FiltersState>(initialFiltersState);
    const [confirm, setConfirm] = React.useState<Maybe<ConfirmState>>(undefined);
    const reloadRef = React.useRef<() => void>(() => {});
    const snackbar = useSnackbar();

    const filters = React.useMemo(() => toUsersFilters(filtersState), [filtersState]);
    /* Built once here, so both the table and the export share the same indexes. */
    const userView = React.useMemo(() => new UserView(filterInfo), [filterInfo]);
    const onError = React.useCallback(
        (error: Error) => {
            console.error(error);
            return snackbar.error(error.message);
        },
        [snackbar]
    );

    const { getRows, getAllRows, rows } = useGetUsersRows({ filters });
    const config = useUsersTableConfig({ userView, rows, reloadRef, setConfirm });
    const tableProps = useObjectsTableFuture<UserRow>(config, getRows, { onError: onError });
    const { exportCsv, exporting } = useExportUsersCsv({ getAllRows, userView });

    reloadRef.current = tableProps.reload;

    const globalActions = React.useMemo<TableGlobalAction[]>(
        () => [
            {
                name: "refresh",
                text: i18n.t("Refresh"),
                icon: <RefreshIcon />,
                onClick: () => reloadRef.current(),
            },
            {
                name: "export-csv",
                text: i18n.t("Export CSV"),
                icon: <GetAppIcon />,
                onClick: exportCsv,
            },
        ],
        [reloadRef, exportCsv]
    );

    const filterComponents = (
        <UsersTableFilters info={filterInfo} selection={filtersState} onChange={setFiltersState} />
    );

    const closeConfirm = React.useCallback(() => setConfirm(undefined), []);

    return (
        <div className={styles.wrapper}>
            <ObjectsTable<UserRow>
                {...tableProps}
                loading={tableProps.isLoading || exporting}
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
        </div>
    );
});
