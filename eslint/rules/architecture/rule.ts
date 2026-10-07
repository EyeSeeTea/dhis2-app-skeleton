import path from "node:path";
import ts from "typescript";
import { ESLintUtils, type TSESTree, type TSESLint } from "@typescript-eslint/utils";

const platformGlobals = new Set([
    "window",
    "document",
    "File",
    "FileReader",
    "Blob",
    "HTMLElement",
    "localStorage",
    "sessionStorage",
    "navigator",
    "fetch",
    "XMLHttpRequest",
]);
const httpPackages = /^(axios|node-fetch|cross-fetch|undici|got|ky)(\/|$)/;
const infrastructurePackages =
    /^(react|react-dom|@material-ui\/|@mui\/|@dhis2\/|@eyeseetea\/d2-api|axios|node-fetch|node:|fs$|fs\/|path$|http$|https$)/;
const normalize = (value: string) => value.replaceAll("\\", "/");

export default ESLintUtils.RuleCreator(
    name =>
        `https://github.com/EyeSeeTea/dhis2-app-skeleton/blob/master/eslint/rules/${name}/README.md`
)({
    name: "architecture",
    defaultOptions: [],
    meta: {
        type: "problem",
        docs: {
            description:
                "Check Clean Architecture dependency directions and DHIS2 client boundaries.",
        },
        schema: [],
        messages: {
            boundary: "{{message}}",
        },
    },
    create(context) {
        const filename = normalize(context.filename);
        const domain = filename.includes("/src/domain/");
        const data = filename.includes("/src/data/");
        const repository = filename.includes("/src/data/repositories/");
        const presentation = /\/src\/(webapp|scripts)\//.test(filename);
        const root = filename.endsWith("/src/CompositionRoot.ts");
        const apiAdapter =
            filename.endsWith("/src/types/d2-api.ts") ||
            filename.endsWith("/src/data/api-futures.ts");
        const sourceCode = context.sourceCode;
        const program = sourceCode.parserServices?.program;
        const options = program?.getCompilerOptions() ?? {
            baseUrl: path.join(context.cwd, "src"),
            paths: { "$/*": ["./*"] },
        };
        const report = (node: TSESTree.Node, message: string) =>
            context.report({ node, messageId: "boundary", data: { message } });
        function checkImport(node: TSESTree.Node, source: unknown) {
            if (typeof source !== "string") return;
            const resolved = ts.resolveModuleName(
                source,
                context.filename,
                options,
                ts.sys
            ).resolvedModule;
            const target = normalize(resolved?.resolvedFileName ?? source);
            if (
                domain &&
                (/\/src\/(data|webapp|scripts)\//.test(target) ||
                    target.endsWith("/src/CompositionRoot.ts") ||
                    target.endsWith("/src/types/d2-api.ts") ||
                    httpPackages.test(source) ||
                    infrastructurePackages.test(source))
            ) {
                report(
                    node,
                    "Domain must not depend on data, presentation, DHIS2 clients, or platform infrastructure."
                );
            } else if (
                data &&
                (/\/src\/(webapp|scripts)\//.test(target) ||
                    target.endsWith("/src/CompositionRoot.ts"))
            ) {
                report(node, "Data must not depend on presentation or the composition root.");
            }
            if ((repository || presentation) && httpPackages.test(source))
                report(
                    node,
                    "Repositories access HTTP through d2-api, not a separate HTTP client."
                );
            if (presentation && target.includes("/src/data/"))
                report(
                    node,
                    "Presentation accesses repositories through composition-root use cases."
                );
            if (
                !domain &&
                !repository &&
                !root &&
                !apiAdapter &&
                (/^@eyeseetea\/d2-api(\/|$)/.test(source) ||
                    target.endsWith("/src/types/d2-api.ts"))
            ) {
                report(
                    node,
                    "Keep the DHIS2 client in repositories, the composition root, or a documented infrastructure adapter."
                );
            }
        }
        return {
            ImportDeclaration(node) {
                checkImport(node, node.source.value);
            },
            ExportNamedDeclaration(node) {
                if (node.source) checkImport(node, node.source.value);
            },
            ExportAllDeclaration(node) {
                checkImport(node, node.source.value);
            },
            ImportExpression(node) {
                if (node.source.type === "Literal") checkImport(node, node.source.value);
            },
            CallExpression(node) {
                if (
                    node.callee.type === "Identifier" &&
                    node.callee.name === "require" &&
                    node.arguments[0]?.type === "Literal"
                )
                    checkImport(node, node.arguments[0].value);
            },
            NewExpression(node) {
                if (node.callee.type !== "Identifier") return;
                let scope: TSESLint.Scope.Scope | null = sourceCode.getScope(node);
                let variable;
                while (scope && !variable) {
                    variable = scope.set.get(node.callee.name);
                    scope = scope.upper;
                }
                const importedApi = variable?.defs.some(
                    def =>
                        def.type === "ImportBinding" &&
                        def.node.type === "ImportSpecifier" &&
                        def.node.imported.type === "Identifier" &&
                        def.node.imported.name === "D2Api"
                );
                if (!importedApi) return;
                const inFactory = sourceCode
                    .getAncestors(node)
                    .some(
                        ancestor =>
                            ancestor.type === "FunctionDeclaration" &&
                            ancestor.id?.name === "getWebappCompositionRoot"
                    );
                if (!root || !inFactory)
                    report(
                        node,
                        "Instantiate D2Api only inside getWebappCompositionRoot() in CompositionRoot.ts."
                    );
            },
            "Program:exit"() {
                for (const scope of sourceCode.scopeManager?.scopes ?? []) {
                    for (const reference of scope.references) {
                        if (reference.resolved?.defs.length) continue;
                        const name = reference.identifier.name;
                        if (domain && platformGlobals.has(name))
                            report(
                                reference.identifier,
                                "Domain must not access runtime platform APIs."
                            );
                        else if (repository && ["fetch", "XMLHttpRequest"].includes(name))
                            report(
                                reference.identifier,
                                "Repositories access HTTP through d2-api."
                            );
                        else if (presentation && ["fetch", "XMLHttpRequest"].includes(name))
                            report(
                                reference.identifier,
                                "Move data access to a repository and call a composition-root use case."
                            );
                    }
                }
            },
        };
    },
});
