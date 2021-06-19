import { D2Api } from "../types/d2-api";

interface Instance {
    url: string;
    username?: string;
    password?: string;
}

export function getD2APiFromInstance(instance: Instance) {
    if (instance.username && instance.password) {
        return new D2Api({
            baseUrl: instance.url,
            auth: { username: instance.username, password: instance.password },
            backend: "fetch",
        });
    }

    return new D2Api({ baseUrl: instance.url, backend: "fetch" });
}
