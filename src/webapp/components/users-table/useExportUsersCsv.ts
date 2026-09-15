import React from "react";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { Cancel, FutureData } from "$/domain/entities/generic/Future";
import { Paginated } from "$/domain/entities/generic/Pagination";
import i18n from "$/utils/i18n";
import { UserView } from "./UserView";
import { UserRow } from "./UsersTableConfig";

/* Exports all the users matching the current search/filters/order, not only the page shown. */
export function useExportUsersCsv(options: {
    getAllRows: () => FutureData<Paginated<UserRow>>;
    userView: UserView;
}): { exportCsv: () => void; exporting: boolean } {
    const { getAllRows, userView } = options;
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
                exportRowsToCsv(response.objects, userView);
                cancelRef.current = undefined;
                setExporting(false);
            },
            err => {
                snackbar.error(err.message);
                cancelRef.current = undefined;
                setExporting(false);
            }
        );
    }, [getAllRows, userView, snackbar]);

    return { exportCsv: exportCsv, exporting: exporting };
}

function exportRowsToCsv(rows: UserRow[], userView: UserView): void {
    const header = ["id", "name", "username", "userGroups", "userRoles"].join(",");
    const body = rows
        .map(row =>
            [
                row.id,
                quote(row.name),
                quote(row.username),
                quote(userView.renderUserGroups(row)),
                quote(userView.renderUserRoles(row)),
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
