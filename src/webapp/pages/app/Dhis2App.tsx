import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Provider } from "@dhis2/app-runtime";
import { D2Api } from "$/types/d2-api";
import App from "./App";
import { CompositionRoot, getWebappCompositionRoot } from "$/CompositionRoot";

export function Dhis2App(_props: {}) {
    const [compositionRootRes, setCompositionRootRes] = React.useState<CompositionRootResult>({
        type: "loading",
    });

    React.useEffect(() => {
        getData().then(setCompositionRootRes);
    }, []);

    switch (compositionRootRes.type) {
        case "loading":
            return <h3>Loading...</h3>;
        case "error": {
            const { baseUrl, error } = compositionRootRes.error;
            return (
                <h3 style={{ margin: 20 }}>
                    <h3>{error.message}</h3>
                    <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                        Login {baseUrl}
                    </a>
                </h3>
            );
        }
        case "loaded": {
            const { baseUrl, compositionRoot } = compositionRootRes.data;
            const config = { baseUrl, apiVersion: 30 };

            return (
                <Provider config={config}>
                    <App compositionRoot={compositionRoot} />
                </Provider>
            );
        }
    }
}

type Data = {
    compositionRoot: CompositionRoot;
    baseUrl: string;
};

async function getData(): Promise<CompositionRootResult> {
    const baseUrl = await getBaseUrl();

    const auth = env["VITE_DHIS2_AUTH"];
    const [username = "", password = ""] = auth.split(":");
    const api = auth
        ? new D2Api({ baseUrl: baseUrl, auth: { username, password } })
        : new D2Api({ baseUrl: baseUrl });
    const compositionRoot = getWebappCompositionRoot(api);

    const userSettings = await api.get<{ keyUiLocale: string }>("/userSettings").getData();
    configI18n(userSettings);

    try {
        return { type: "loaded", data: { baseUrl, compositionRoot } };
    } catch (err) {
        return { type: "error", error: { baseUrl, error: err as Error } };
    }
}

const env = import.meta.env;
const isDev = env.DEV;

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

type Result<Data, E> =
    | { type: "loading" }
    | { type: "loaded"; data: Data }
    | { type: "error"; error: E };

type CompositionRootResult = Result<Data, { baseUrl: string; error: Error }>;
