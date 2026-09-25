import { ESLintUtils, type TSESLint, type TSESTree } from "@typescript-eslint/utils";

type FunctionNode =
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression;

function isIdentifier(
    node: TSESTree.Node | null | undefined,
    name: string
): node is TSESTree.Identifier {
    return node?.type === "Identifier" && node.name === name;
}

function isFutureMethodCall(
    node: TSESTree.Node | null | undefined,
    method: "block" | "block_"
): boolean {
    return (
        node?.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        !node.callee.computed &&
        isIdentifier(node.callee.object, "Future") &&
        isIdentifier(node.callee.property, method)
    );
}

function isFunctionNode(node: TSESTree.Node): node is FunctionNode {
    return (
        node.type === "ArrowFunctionExpression" ||
        node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression"
    );
}

function getFunctionAncestor(
    sourceCode: TSESLint.SourceCode,
    node: TSESTree.Node
): FunctionNode | null {
    return sourceCode.getAncestors(node).findLast(isFunctionNode) ?? null;
}

function isFutureBlockCallback(functionNode: FunctionNode): boolean {
    const parent = functionNode.parent;
    if (parent?.type !== "CallExpression" || parent.arguments[0] !== functionNode) return false;

    return isFutureMethodCall(parent, "block") || isFutureMethodCall(parent.callee, "block_");
}

const createRule = ESLintUtils.RuleCreator(
    name => `https://github.com/EyeSeeTea/dhis2-app-skeleton/blob/master/eslint/rules/${name}.md`
);

export default createRule({
    name: "require-future-block-capture",
    meta: {
        type: "problem",
        docs: {
            description:
                "Require await calls inside Future.block callbacks to go through the capture function",
        },
        schema: [],
        messages: {
            wrapAwait: "Use `await {{capture}}(...)` inside `Future.block`.",
        },
    },
    defaultOptions: [],
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            AwaitExpression(node) {
                const functionNode = getFunctionAncestor(sourceCode, node);
                if (!functionNode) return;
                if (!isFutureBlockCallback(functionNode)) return;

                const firstParam = functionNode.params[0];
                const captureName = firstParam?.type === "Identifier" ? firstParam.name : null;
                const awaited = node.argument;
                if (
                    captureName !== null &&
                    awaited.type === "CallExpression" &&
                    isIdentifier(awaited.callee, captureName)
                ) {
                    return;
                }

                context.report({
                    node,
                    messageId: "wrapAwait",
                    data: { capture: captureName ?? "$" },
                });
            },
        };
    },
});
