import React from "react";
import { Card, CardGrid } from "$/webapp/components/card-grid/CardGrid";
import { useAppContext } from "$/webapp/contexts/app-context";
import i18n from "$/utils/i18n";
import { CurrentUserBadge } from "./CurrentUserBadge";
import styles from "./LandingPage.module.css";

export const LandingPage: React.FC = React.memo(() => {
    const { currentUser } = useAppContext();

    const cards: Card[] = [
        {
            title: i18n.t("Users"),
            key: "main",
            items: [
                {
                    name: "Mary",
                    description: "Go to Mary's page",
                    route: "for/Mary",
                },
                {
                    name: "John",
                    description: "Go to John's page",
                    route: "for/John",
                },
                {
                    name: i18n.t("Users"),
                    description: i18n.t("Browse users with filters and actions"),
                    route: "users",
                },
            ],
        },
    ];

    return (
        <div className={styles.page}>
            <CurrentUserBadge user={currentUser} />

            <CardGrid cards={cards} />
        </div>
    );
});
