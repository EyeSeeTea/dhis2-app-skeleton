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

function isFutureBlockCall(node: TSESTree.Node | null | undefined): boolean {
    return (
        node?.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        !node.callee.computed &&
        isIdentifier(node.callee.object, "Future") &&
        isIdentifier(node.callee.property, "block")
    );
}

function isFutureBlockFactoryCall(node: TSESTree.Node | null | undefined): boolean {
    return (
        node?.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        !node.callee.computed &&
        isIdentifier(node.callee.object, "Future") &&
        isIdentifier(node.callee.property, "block_")
    );
}

function getBlockCaptureParam(functionNode: FunctionNode): TSESTree.Identifier | null {
    const [firstParam] = functionNode.params;
    return firstParam?.type === "Identifier" ? firstParam : null;
}

function getFunctionAncestor(
    sourceCode: TSESLint.SourceCode,
    node: TSESTree.Node
): FunctionNode | null {
    const ancestors = sourceCode.getAncestors(node);
    for (let idx = ancestors.length - 1; idx >= 0; idx -= 1) {
        const ancestor = ancestors[idx];
        if (!ancestor) continue;
        if (
            ancestor.type === "ArrowFunctionExpression" ||
            ancestor.type === "FunctionDeclaration" ||
            ancestor.type === "FunctionExpression"
        ) {
            return ancestor;
        }
    }

    return null;
}

function isFutureBlockCallback(functionNode: FunctionNode): boolean {
    const parent = functionNode.parent;
    if (parent?.type !== "CallExpression") return false;

    if (isFutureBlockCall(parent) && parent.arguments[0] === functionNode) {
        return true;
    }

    if (parent.arguments[0] !== functionNode) return false;

    const callee = parent.callee;
    if (callee.type !== "CallExpression") return false;

    return isFutureBlockFactoryCall(callee);
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

                const captureParam = getBlockCaptureParam(functionNode);
                if (!captureParam) {
                    context.report({
                        node,
                        messageId: "wrapAwait",
                        data: { capture: "$" },
                    });
                    return;
                }

                const awaited = node.argument;
                if (
                    awaited.type === "CallExpression" &&
                    awaited.callee.type === "Identifier" &&
                    awaited.callee.name === captureParam.name
                ) {
                    return;
                }

                context.report({
                    node,
                    messageId: "wrapAwait",
                    data: { capture: captureParam.name },
                });
            },
        };
    },
});
