import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@material-ui/core";
import React from "react";
import { useAppContext } from "$/webapp/contexts/app-context";
import { MultiSelector, OrgUnitsSelector, ShareUpdate, Sharing } from "d2-ui-components-test";
import { D2Api } from "@eyeseetea/d2-api/2.36";

const api = new D2Api({ baseUrl: "/dhis2" });

export const LandingPage: React.FC = React.memo(() => {
    const { currentUser } = useAppContext();
    const [selectedCountries, setSelectedCountries] = React.useState<string[]>([]);
    const [showSharing, setShowSharing] = React.useState(false);
    const [showMultiSelector, setShowMultiSelector] = React.useState(false);
    const [orgSelected, setOrgSelected] = React.useState<string[]>([]);
    const [showOrgUnitsSelector, setShowOrgUnitsSelector] = React.useState(false);
    const updateCountry = (selected: string[]) => {
        setSelectedCountries(selected);
    };

    const countries = [
        { text: "United States", value: "US" },
        { text: "Canada", value: "CA" },
        { text: "Mexico", value: "MX" },
        { text: "Brazil", value: "BR" },
        { text: "Argentina", value: "AR" },
        { text: "Spain", value: "ES" },
        { text: "France", value: "FR" },
        { text: "Germany", value: "DE" },
        { text: "Italy", value: "IT" },
        { text: "United Kingdom", value: "GB" },
        { text: "Japan", value: "JP" },
        { text: "China", value: "CN" },
        { text: "Australia", value: "AU" },
    ];

    const updateSharing = (shareUpdate: ShareUpdate) => {
        console.debug("Selected sharing options:", shareUpdate);
        return Promise.resolve();
    };

    const searchSharing = async (query: string) => {
        console.debug("Debounce query:", query);
        return api.metadata
            .get({
                users: {
                    fields: { id: true, displayName: true },
                    filter: { name: { ilike: query } },
                },
                userGroups: {
                    fields: { id: true, displayName: true },
                    filter: { name: { ilike: query } },
                },
            })
            .getData()
            .then(response => {
                return { userGroups: response.userGroups, users: response.users };
            });
    };

    return (
        <>
            <Typography variant="h6">
                Current user: {currentUser.name} [{currentUser.id}]
            </Typography>

            <Box padding={1}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowMultiSelector(true)}
                >
                    MultiSelector Demo
                </Button>
            </Box>
            <Box padding={1}>
                <Button variant="contained" color="primary" onClick={() => setShowSharing(true)}>
                    Sharing Demo
                </Button>
            </Box>
            <Box padding={1}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowOrgUnitsSelector(true)}
                >
                    OrgUnitsSelector Demo
                </Button>
            </Box>

            <Dialog
                maxWidth="lg"
                fullWidth
                open={showMultiSelector}
                onClose={() => setShowMultiSelector(false)}
            >
                <DialogTitle>
                    MultiSelector Component (no rxjs dependency)
                    <p>Selected Countries: {selectedCountries.join(",")}</p>
                </DialogTitle>
                <DialogContent>
                    <MultiSelector
                        options={countries}
                        onChange={updateCountry}
                        selected={selectedCountries}
                        searchFilterLabel="Search"
                        ordered
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowMultiSelector(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog fullWidth open={showSharing} onClose={() => setShowSharing(false)}>
                <DialogTitle>Sharing Component (no rxjs dependency in search)</DialogTitle>
                <DialogContent>
                    <Sharing
                        meta={{
                            object: {
                                id: "id",
                            },
                        }}
                        onChange={updateSharing}
                        onSearch={searchSharing}
                        showOptions={{
                            title: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSharing(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                maxWidth="lg"
                open={showOrgUnitsSelector}
                fullWidth
                onClose={() => setShowOrgUnitsSelector(false)}
            >
                <DialogContent>
                    <OrgUnitsSelector api={api} selected={orgSelected} onChange={setOrgSelected} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowOrgUnitsSelector(false)} color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});
