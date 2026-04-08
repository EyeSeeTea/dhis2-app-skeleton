import { command, run, string, option, Type } from "cmd-ts";
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
                type: userPass,
                long: "dhis2-auth",
                short: "a",
                description: "DHIS2 Auth. USERNAME:PASSWORD",
            }),
        },
        handler: async args => {
            const api = new D2Api({ baseUrl: args.url, auth: args.auth });
            const info = await api.system.info.getData();
            console.debug(info);
        },
    });

    run(cmd, process.argv.slice(2));
}

const userPass: Type<string, { username: string; password: string }> = {
    async from(str) {
        const [username, password] = str.split(":");

        if (!(username && password)) {
            throw new Error("Expected format USER:PASS");
        } else {
            return { username: username, password: password };
        }
    },
};

main();
