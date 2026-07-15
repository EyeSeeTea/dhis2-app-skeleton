function isIdentifier(node, name) {
    return node?.type === "Identifier" && node.name === name;
}

function isFutureBlockCall(node) {
    return (
        node?.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        !node.callee.computed &&
        isIdentifier(node.callee.object, "Future") &&
        isIdentifier(node.callee.property, "block")
    );
}

function isFutureBlockFactoryCall(node) {
    return (
        node?.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        !node.callee.computed &&
        isIdentifier(node.callee.object, "Future") &&
        isIdentifier(node.callee.property, "block_")
    );
}

function getBlockCaptureParam(functionNode) {
    const [firstParam] = functionNode.params;
    return firstParam?.type === "Identifier" ? firstParam : null;
}

function getFunctionAncestor(sourceCode, node) {
    const ancestors = sourceCode.getAncestors(node);
    for (let idx = ancestors.length - 1; idx >= 0; idx -= 1) {
        const ancestor = ancestors[idx];
        if (ancestor.type === "ArrowFunctionExpression" || ancestor.type === "FunctionExpression") {
            return ancestor;
        }
    }

    return null;
}

function isFutureBlockCallback(functionNode) {
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

export default {
    meta: {
        type: "problem",
        fixable: "code",
        docs: {
            description:
                "Require await calls inside Future.block callbacks to go through the capture function",
        },
        schema: [],
        messages: {
            wrapAwait: "Use `await {{capture}}(...)` inside `Future.block`.",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            AwaitExpression(node) {
                const functionNode = getFunctionAncestor(sourceCode, node);
                if (!functionNode) return;
                if (!isFutureBlockCallback(functionNode)) return;

                const captureParam = getBlockCaptureParam(functionNode);
                if (!captureParam) return;

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
                    fix(fixer) {
                        const awaitedText = sourceCode.getText(awaited);
                        return fixer.replaceText(awaited, `${captureParam.name}(${awaitedText})`);
                    },
                });
            },
        };
    },
};
