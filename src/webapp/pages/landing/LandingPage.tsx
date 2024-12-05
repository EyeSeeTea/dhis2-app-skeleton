import { Typography } from "@material-ui/core";
import React from "react";
import { useAppContext } from "$/webapp/contexts/app-context";

import { TutorialModule } from "training-component";
import { Button, Dialog } from "@material-ui/core";

export const LandingPage: React.FC = React.memo(() => {
    const { currentUser } = useAppContext();

    return (
        <>
            <Typography variant="h6">
                Current user: {currentUser.name} [{currentUser.id}]
            </Typography>

            <MyComponent />
        </>
    );
});

function MyComponent() {
    const { api } = useAppContext();
    const [showTutorial, setShowTutorial] = React.useState(false);

    const openTutorial = React.useCallback(() => {
        setShowTutorial(true);
    }, []);

    return (
        <>
            <Button variant="contained" onClick={openTutorial}>
                OPEN TUTORIAL
            </Button>
            <Dialog open={showTutorial} fullScreen>
                <TutorialModule
                    moduleId="data-entry"
                    onExit={() => setShowTutorial(false)}
                    onHome={() => setShowTutorial(false)}
                    locale="en"
                    baseUrl={api.baseUrl}
                />
            </Dialog>
        </>
    );
}
