import React from "react";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { Cancel, FutureData } from "$/domain/entities/generic/Future";
import { Paginated } from "$/domain/entities/generic/Pagination";
import i18n from "$/utils/i18n";
import { UsersFilterInfo } from "./useUsersFilterInfo";
import { UserRow } from "./UsersTableConfig";

/* Exports all the users matching the current search/filters/order, not only the page shown. */
export function useExportUsersCsv(options: {
    getAllRows: () => FutureData<Paginated<UserRow>>;
    info: UsersFilterInfo;
}): { exportCsv: () => void; exporting: boolean } {
    const { getAllRows, info } = options;
    const snackbar = useSnackbar();
    const [exporting, setExporting] = React.useState(false);
    const cancelRef = React.useRef<Cancel>(undefined);

    /* Drop the export request if the user leaves while it is still running. */
    React.useEffect(() => () => cancelRef.current?.(), []);

    const exportCsv = React.useCallback(() => {
        setExporting(true);

        cancelRef.current = getAllRows().run(
            response => {
                if (response.pager.total > response.objects.length) {
                    snackbar.warning(
                        i18n.t("Only the first {{count}} users have been exported", {
                            count: response.objects.length,
                        })
                    );
                }
                exportRowsToCsv(response.objects, info);
                cancelRef.current = undefined;
                setExporting(false);
            },
            err => {
                snackbar.error(err.message);
                cancelRef.current = undefined;
                setExporting(false);
            }
        );
    }, [getAllRows, info, snackbar]);

    return { exportCsv: exportCsv, exporting: exporting };
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
