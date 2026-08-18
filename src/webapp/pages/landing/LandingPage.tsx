import React from "react";
import { Card, CardGrid } from "$/webapp/components/card-grid/CardGrid";
import { useAppContext } from "$/webapp/contexts/app-context";
import i18n from "$/utils/i18n";
import { Typography } from "@material-ui/core";

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
        <>
            <CardGrid cards={cards} />

            <footer>
                <Typography variant="h6">
                    Current user: {currentUser.name} [{currentUser.id}]
                </Typography>
            </footer>
        </>
    );
});
