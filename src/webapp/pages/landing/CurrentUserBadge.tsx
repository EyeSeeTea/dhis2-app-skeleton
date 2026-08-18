import React from "react";
import { Tag } from "@dhis2/ui";
import { User } from "$/domain/entities/User";
import i18n from "$/utils/i18n";
import styles from "./CurrentUserBadge.module.css";

export const CurrentUserBadge: React.FC<{ user: User }> = React.memo(props => {
    const { user } = props;

    const meta = [
        `@${user.username}`,
        i18n.t("Roles: {{total}}", { total: user.userRoleIds.length }),
        i18n.t("Groups: {{total}}", { total: user.userGroupIds.length }),
    ].join(" · ");

    return (
        <div className={styles.container}>
            <aside className={styles.badge}>
                {/* The id is not shown, but kept as the tooltip, as it's still needed to report issues */}
                <div className={styles.avatar} title={user.id}>
                    {getInitials(user.name)}
                </div>

                <div className={styles.details}>
                    <div className={styles.name}>
                        {user.name}
                        {user.isAdmin && <Tag positive>{i18n.t("Administrator")}</Tag>}
                    </div>

                    <div className={styles.meta}>{meta}</div>
                </div>
            </aside>
        </div>
    );
});

function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(part => part.length > 0)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? "")
        .join("");
}
