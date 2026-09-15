import { command, run, string, option } from "cmd-ts";
import path from "path";
import { D2Api } from "$/types/d2-api";
import { GetUserReportUseCase } from "$/domain/usecases/GetUserReportUseCase";
import { UserD2Repository } from "$/data/repositories/UserD2Repository";
import { UserRoleD2Repository } from "$/data/repositories/UserRoleD2Repository";
import { UserReport } from "$/domain/entities/UserReport";

function main() {
    const cmd = command({
        name: path.basename(__filename),
        description: "Show DHIS2 instance info and a user report",
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
            const [username = "", password = ""] = args.auth.split(":");
            const auth = { username, password };
            const api = new D2Api({ baseUrl: args.url, auth });

            const info = await api.system.info.getData();
            console.info("System info:", info);

            const useCase = new GetUserReportUseCase(
                new UserD2Repository(api),
                new UserRoleD2Repository(api)
            );

            const report = await useCase.execute().toPromise();
            printReport(report);
        },
    });

    run(cmd, process.argv.slice(2));
}

function printReport(report: UserReport): void {
    console.info("\n=== User Report ===");
    console.info(`Total users : ${report.totalUsers}`);
    console.info(`Admins      : ${report.adminCount}`);
    console.info(`Non-admins  : ${report.nonAdminCount}`);

    console.info("\nRoles by usage (most used first):");
    for (const { role, userCount } of report.rolesSortedByUsage) {
        console.info(`  ${role.name} — ${userCount} user(s)`);
    }

    console.info("\nUsers with multiple roles:");
    if (report.usersWithMultipleRoles.length === 0) {
        console.info("  (none)");
    } else {
        for (const user of report.usersWithMultipleRoles) {
            console.info(`  ${user.name} (${user.userRoleIds.length} roles)`);
        }
    }

    console.info("\nUnique authorities across all assigned roles:");
    console.info(" ", report.uniqueAuthorities.join(", ") || "(none)");
}

main();
