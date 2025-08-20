import { command, run, string, option } from "cmd-ts";
import path from "path";
import { D2Api } from "$/types/d2-api";

function main() {
    const cmd = command({
        name: path.basename(__filename),
        description: "Show DHIS2 instance info",
        args: {
            url: option({
                type: string,
                long: "dhis2-url",
                short: "u",
                description: "DHIS2 base URL. Example: http://localhost:8080",
            }),
            auth: option({
                type: string,
                long: "dhis2-auth",
                short: "a",
                description: "DHIS2 Auth. USERNAME:PASSWORD",
            }),
        },
        handler: async args => {
            const [username = "", password = ""] = (args.auth || "").split(":");
            const auth = { username, password };
            const api = new D2Api({ baseUrl: args.url, auth: auth });
            const info = await api.system.info.getData();
            console.debug(info);
        },
    });

    run(cmd, process.argv.slice(2));
}

main();
