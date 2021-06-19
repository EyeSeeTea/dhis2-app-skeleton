import { useConfig } from "@dhis2/app-runtime";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core";
import { init } from "d2";
import _ from "lodash";
import { useEffect, useState } from "react";
import { appConfig, AppConfig } from "../app-config";
import { getCompositionRoot } from "../CompositionRoot";
import { getD2APiFromInstance } from "../utils/d2-api";
import Share from "./components/share/Share";
import { AppContext, AppContextState } from "./contexts/AppContext";
import { Router } from "./pages";
import { muiTheme } from "./themes/dhis2.theme";

type AppWindow = Window & {
    $: {
        feedbackDhis2: (d2: object, appKey: string, feedbackOptions: object) => void;
    };
};

function initFeedbackTool(d2: object, appConfig: AppConfig): void {
    const appKey = _(appConfig).get("appKey");

    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        (window as unknown as AppWindow).$.feedbackDhis2(d2, appKey, feedbackOptions);
    }
}

const App = () => {
    const { baseUrl } = useConfig();

    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const d2 = await init({ baseUrl: baseUrl + "/api", schemas: [] });
            const api = getD2APiFromInstance({ url: baseUrl });
            const compositionRoot = getCompositionRoot(api);

            const currentUser = await compositionRoot.config.getCurrentUser();
            const appContext: AppContextState = { api, currentUser, compositionRoot };

            setAppContext(appContext);
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            initFeedbackTool(d2, appConfig);
            setLoading(false);
        }
        setup();
    }, [baseUrl]);

    if (loading) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <SnackbarProvider>
                <AppContext.Provider value={appContext}>
                    <Router />
                </AppContext.Provider>

                <Share visible={showShareButton} />
            </SnackbarProvider>
        </MuiThemeProvider>
    );
};

export default App;
