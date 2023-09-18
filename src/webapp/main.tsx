import i18n from "@dhis2/d2-i18n";
import { Provider } from "@dhis2/app-runtime";
import ReactDOM from "react-dom/client";
import { getCompositionRoot } from "../CompositionRoot";
import { D2Api } from "../types/d2-api";
import App from "./pages/app/App";

const isDev = process.env.NODE_ENV === "development";

async function getBaseUrl() {
    if (isDev) {
        return "/dhis2"; // See src/setupProxy.js
    } else {
        const manifest = await fetch("manifest.webapp").then(res => res.json());
        return manifest.activities.dhis.href;
    }
}

const isLangRTL = (code: string) => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return langs.includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }: { keyUiLocale: string }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};

const env = import.meta.env;

async function main() {
    const baseUrl = await getBaseUrl();
    const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

    try {
        const [username = "admin", password = "district"] = (env["VITE_DHIS2_AUTH"] || "").split(":");
        const api = new D2Api({ baseUrl: baseUrl, auth: { username, password } });
        const compositionRoot = getCompositionRoot(api);

        const userSettings = await api.get<{ keyUiLocale: string }>("/userSettings").getData();
        configI18n(userSettings);

        root.render(
            <Provider config={{ baseUrl, apiVersion: 30 }}>
                <App compositionRoot={compositionRoot} />
            </Provider>
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

        root.render(<div>{feedback}</div>);
    }
}

main();
