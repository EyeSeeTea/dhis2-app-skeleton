import "./webapp/utils/wdyr";
import { Provider } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import axios from "axios";
import { init } from "d2";
import _ from "lodash";
import ReactDOM from "react-dom";
import { Instance } from "./data/entities/Instance";
import { getD2APiFromInstance } from "./utils/d2-api";
import { App } from "./webapp/pages/app/App";
import { D2Api } from "./types/d2-api";

declare global {
    interface Window {
        $: { feedbackDhis2(d2: object, appKey: string, feedbackOptions: object): void };
        api: D2Api;
    }
}

const isDev = process.env.NODE_ENV === "development";

async function getBaseUrl() {
    if (isDev) {
        return "/dhis2"; // See src/setupProxy.js
    } else {
        const { data: manifest } = await axios.get("manifest.webapp");
        return manifest.activities.dhis.href;
    }
}

const isLangRTL = (code: string) => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }: { keyUiLocale: string }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};

async function main() {
    const baseUrl = await getBaseUrl();

    try {
        const d2 = await init({ baseUrl: baseUrl + "/api", schemas: [] });
        const instance = new Instance({ url: baseUrl });
        const api = getD2APiFromInstance(instance);
        if (isDev) window.api = api;

        const userSettings = await api.get<{ keyUiLocale: string }>("/userSettings").getData();
        configI18n(userSettings);

        ReactDOM.render(
            <Provider config={{ baseUrl, apiVersion: 30 }}>
                <App api={api} d2={d2} instance={instance} />
            </Provider>,
            document.getElementById("root")
        );
    } catch (err) {
        console.error(err);
        const error = `${err}`;
        const feedback = error.match("Unable to get schemas") ? (
            <h3 style={{ margin: 20 }}>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>
            </h3>
        ) : (
            <h3>{error}</h3>
        );
        ReactDOM.render(<div>{feedback}</div>, document.getElementById("root"));
    }
}

main();
