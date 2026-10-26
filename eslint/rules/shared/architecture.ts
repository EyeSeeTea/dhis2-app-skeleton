import path from "node:path";
import { isBuiltin } from "node:module";
import ts from "typescript";
import { ESLintUtils, type TSESTree, type TSESLint } from "@typescript-eslint/utils";

const globalNamespaces = new Set(["window", "globalThis", "self"]);
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

export type ArchitectureOptions = {
    paths?: Partial<
        Record<
            | "domain"
            | "data"
            | "presentation"
            | "repositories"
            | "compositionRoots"
            | "apiAdapters",
            string[]
        >
    >;
    clientFactories?: string[];
};

const defaultPaths = {
    domain: ["src/domain/**"],
    data: ["src/data/**"],
    presentation: ["src/webapp/**", "src/scripts/**"],
    repositories: ["src/data/repositories/**"],
    compositionRoots: ["src/CompositionRoot.ts"],
    apiAdapters: ["src/types/d2-api.ts", "src/data/api-futures.ts"],
};

// Project-relative globs support *, **, and ?. **/ also matches zero directories.
function compileGlob(pattern: string): RegExp {
    const normalized = normalize(pattern).replace(/^\.\//, "");
    let expression = "^";
    for (let index = 0; index < normalized.length; index++) {
        const char = normalized[index]!;
        if (char === "*" && normalized[index + 1] === "*") {
            index++;
            if (normalized[index + 1] === "/") {
                expression += "(?:.*/)?";
                index++;
            } else expression += ".*";
        } else if (char === "*") expression += "[^/]*";
        else if (char === "?") expression += "[^/]";
        else expression += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    return new RegExp(expression + "$");
}

type ArchitectureCheck = "layerDependencies" | "httpClientAccess" | "clientConstruction";

export function createArchitectureRule(
    ruleName: string,
    description: string,
    check: ArchitectureCheck
) {
    return ESLintUtils.RuleCreator(
        name =>
            `https://github.com/EyeSeeTea/dhis2-app-skeleton/blob/master/eslint/rules/${name}/README.md`
    )({
        name: ruleName,
        defaultOptions: [{} as ArchitectureOptions],
        meta: {
            type: "problem",
            docs: {
                description,
            },
            schema: [
                {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        paths: {
                            type: "object",
                            additionalProperties: false,
                            properties: Object.fromEntries(
                                Object.keys(defaultPaths).map(key => [
                                    key,
                                    {
                                        type: "array",
                                        items: { type: "string", minLength: 1 },
                                        uniqueItems: true,
                                    },
                                ])
                            ),
                        },
                        ...(check === "clientConstruction"
                            ? {
                                  clientFactories: {
                                      type: "array",
                                      items: { type: "string", minLength: 1 },
                                      uniqueItems: true,
                                  },
                              }
                            : {}),
                    },
                },
            ],
            messages: {
                boundary: "{{message}}",
            },
        },
        create(context, [configuration]) {
            const paths = { ...defaultPaths, ...configuration.paths };
            const patterns = Object.fromEntries(
                Object.entries(paths).map(([key, globs]) => [key, globs.map(compileGlob)])
            );
            const matches = (key: keyof typeof defaultPaths, filename: string) =>
                patterns[key]!.some(pattern =>
                    pattern.test(normalize(path.relative(context.cwd, filename)))
                );
            const filename = context.filename;
            // Roots and adapters are infrastructure exceptions even when nested in a layer.
            const root = matches("compositionRoots", filename);
            const apiAdapter = matches("apiAdapters", filename);
            const domain = !root && !apiAdapter && matches("domain", filename);
            const data = !root && !apiAdapter && matches("data", filename);
            const repository = matches("repositories", filename);
            const presentation = !root && !apiAdapter && matches("presentation", filename);
            const factories = configuration.clientFactories ?? ["getWebappCompositionRoot"];
            const sourceCode = context.sourceCode;
            const program = sourceCode.parserServices?.program;
            const configFile = !program && ts.findConfigFile(context.cwd, ts.sys.fileExists);
            const parsedConfig = configFile
                ? ts.readConfigFile(configFile, ts.sys.readFile)
                : undefined;
            const options =
                program?.getCompilerOptions() ??
                (configFile && !parsedConfig?.error
                    ? ts.parseJsonConfigFileContent(
                          parsedConfig?.config,
                          ts.sys,
                          path.dirname(configFile)
                      ).options
                    : { baseUrl: path.join(context.cwd, "src"), paths: { "$/*": ["./*"] } });
            const resolveModule = (source: string) =>
                ts.resolveModuleName(source, context.filename, options, ts.sys).resolvedModule
                    ?.resolvedFileName;
            const isClientSource = (source: string) => {
                const target = resolveModule(source);
                return (
                    /^@eyeseetea\/d2-api(\/|$)/.test(source) ||
                    (target !== undefined && matches("apiAdapters", target))
                );
            };
            const report = (node: TSESTree.Node, message: string) =>
                context.report({ node, messageId: "boundary", data: { message } });
            function checkImport(node: TSESTree.Node, source: unknown) {
                if (
                    (check !== "layerDependencies" && check !== "httpClientAccess") ||
                    typeof source !== "string"
                )
                    return;
                const target = resolveModule(source);
                const targetMatches = (key: keyof typeof defaultPaths) =>
                    target !== undefined && matches(key, target);
                const boundary = (layer: string, destination: string, guidance = "") =>
                    report(
                        node,
                        `${layer} must not import ${destination} through '${source}'${target ? ` (resolved to ${normalize(path.relative(context.cwd, target))})` : ""}.${guidance ? ` ${guidance}` : ""}`
                    );
                if (check === "layerDependencies") {
                    if (
                        domain &&
                        (targetMatches("data") ||
                            targetMatches("presentation") ||
                            targetMatches("compositionRoots") ||
                            targetMatches("apiAdapters"))
                    )
                        boundary("Domain", "data, presentation, or infrastructure adapters");
                    else if (
                        data &&
                        (targetMatches("presentation") || targetMatches("compositionRoots"))
                    )
                        boundary("Data", "presentation or composition roots");
                    if (presentation && targetMatches("data"))
                        boundary("Presentation", "data implementations");
                }
                if (check === "httpClientAccess") {
                    if (
                        domain &&
                        (httpPackages.test(source) ||
                            infrastructurePackages.test(source) ||
                            isBuiltin(source))
                    )
                        boundary("Domain", "platform infrastructure");
                    else if ((repository || presentation) && httpPackages.test(source))
                        boundary(
                            repository ? "Repositories" : "Presentation",
                            "HTTP clients",
                            repository
                                ? "Use d2-api for DHIS2 access. For an external API, add a justified exception for this rule."
                                : "Access HTTP through d2-api repositories."
                        );
                    if (
                        !domain &&
                        !repository &&
                        !root &&
                        !apiAdapter &&
                        (/^@eyeseetea\/d2-api(\/|$)/.test(source) || targetMatches("apiAdapters"))
                    )
                        boundary(
                            "This file",
                            "DHIS2 clients or API adapters; keep them in repositories, composition roots, or adapters"
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
                    if (check !== "clientConstruction" || node.callee.type !== "Identifier") return;
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
                            def.node.imported.name === "D2Api" &&
                            def.parent.type === "ImportDeclaration" &&
                            isClientSource(def.parent.source.value)
                    );
                    if (!importedApi) return;
                    const inFactory = sourceCode.getAncestors(node).some(ancestor => {
                        if (ancestor.type === "FunctionDeclaration")
                            return ancestor.id && factories.includes(ancestor.id.name);
                        if (
                            ancestor.type !== "ArrowFunctionExpression" &&
                            ancestor.type !== "FunctionExpression"
                        )
                            return false;
                        const parent = ancestor.parent;
                        return (
                            parent?.type === "VariableDeclarator" &&
                            parent.id.type === "Identifier" &&
                            factories.includes(parent.id.name)
                        );
                    });
                    if (!root || !inFactory)
                        report(
                            node,
                            `Instantiate D2Api only inside a configured client factory (${factories.join(", ") || "none"}) in a configured composition root.`
                        );
                },
                "Program:exit"() {
                    if (check !== "httpClientAccess") return;
                    for (const scope of sourceCode.scopeManager?.scopes ?? []) {
                        for (const reference of scope.references) {
                            if (!reference.isValueReference || reference.resolved?.defs.length)
                                continue;
                            const name = reference.identifier.name;
                            // Resolve qualified globals only when their namespace is unshadowed.
                            let access: TSESTree.Node = reference.identifier;
                            let qualifiedName = name;
                            while (
                                globalNamespaces.has(qualifiedName) &&
                                access.parent?.type === "MemberExpression" &&
                                access.parent.object === access
                            ) {
                                const member: TSESTree.MemberExpression = access.parent;
                                const property = member.property;
                                qualifiedName =
                                    !member.computed && property.type === "Identifier"
                                        ? property.name
                                        : member.computed &&
                                            property.type === "Literal" &&
                                            typeof property.value === "string"
                                          ? property.value
                                          : "";
                                access = member;
                            }
                            if (
                                domain &&
                                (platformGlobals.has(name) || platformGlobals.has(qualifiedName))
                            )
                                report(
                                    reference.identifier,
                                    "Domain must not access runtime platform APIs."
                                );
                            else if (
                                repository &&
                                ["fetch", "XMLHttpRequest"].includes(qualifiedName)
                            )
                                report(
                                    reference.identifier,
                                    "Use d2-api for DHIS2 access. For an external API, add a justified exception for this rule."
                                );
                            else if (
                                presentation &&
                                ["fetch", "XMLHttpRequest"].includes(qualifiedName)
                            )
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
}
