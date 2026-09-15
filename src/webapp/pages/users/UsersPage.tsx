import React from "react";
import { useHistory } from "react-router-dom";
import i18n from "$/utils/i18n";
import { PageHeader } from "$/webapp/components/page-header/PageHeader";
import { UsersTable } from "$/webapp/components/users-table/UsersTable";

export const UsersPage: React.FC = React.memo(() => {
    const history = useHistory();
    const goBack = React.useCallback(() => history.goBack(), [history]);

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Users")} onBackClick={goBack} />
            <UsersTable />
        </React.Fragment>
    );
});
