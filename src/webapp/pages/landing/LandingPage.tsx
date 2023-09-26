import { Typography } from "@material-ui/core";
import React from "react";
import { useHistory } from "react-router-dom";
import { Card, CardGrid } from "../../components/card-grid/CardGrid";
import { useAppContext } from "../../contexts/app-context";

export const LandingPage: React.FC = React.memo(() => {
    const history = useHistory();
    const { currentUser } = useAppContext();

    const cards: Card[] = [
        {
            title: "Section",
            key: "main",
            children: [
                {
                    name: "John",
                    description: "Entry point 1",
                    listAction: () => history.push("/for/John"),
                },
                {
                    name: "Mary",
                    description: "Entry point 2",
                    listAction: () => history.push("/for/Mary"),
                },
            ],
        },
    ];

    return (
        <>
            <Typography variant="h6">
                Current user: {currentUser.name} [{currentUser.id}]
            </Typography>

            <CardGrid cards={cards} />
        </>
    );
});
