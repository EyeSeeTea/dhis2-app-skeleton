import { ESLintUtils } from "@typescript-eslint/utils";

const arrayMutators = new Set([
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse",
    "fill",
    "copyWithin",
]);
export default ESLintUtils.RuleCreator(
    name =>
        `https://github.com/EyeSeeTea/dhis2-app-skeleton/blob/master/eslint/rules/${name}/README.md`
)({
    name: "no-collection-mutation",
    defaultOptions: [],
    meta: {
        type: "suggestion",
        docs: { description: "Prefer new collections over in-place mutations." },
        schema: [],
        messages: { mutation: "Return a new collection instead of mutating it with {{method}}()." },
    },
    create(context) {
        const services = ESLintUtils.getParserServices(context);
        const checker = services.program.getTypeChecker();
        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") return;
                const member = node.callee;
                const method = member.computed
                    ? member.property.type === "Literal"
                        ? member.property.value
                        : null
                    : member.property.type === "Identifier"
                      ? member.property.name
                      : null;
                if (typeof method !== "string") return;
                const type = services.getTypeAtLocation(member.object);
                const types = type.isUnion() ? type.types : [type];
                const mutates = types.some(type => {
                    if (checker.isArrayType(type) || checker.isTupleType(type))
                        return arrayMutators.has(method);
                    const symbol = type.getSymbol();
                    // Only standard-library Map/Set, not similarly named application classes.
                    const builtin = symbol?.declarations?.some(declaration =>
                        /[\\/]typescript[\\/]lib[\\/]lib\..*\.d\.ts$/.test(
                            declaration.getSourceFile().fileName
                        )
                    );
                    return (
                        builtin &&
                        symbol &&
                        ((symbol.name === "Map" && ["set", "delete", "clear"].includes(method)) ||
                            (symbol.name === "Set" && ["add", "delete", "clear"].includes(method)))
                    );
                });
                if (mutates) context.report({ node, messageId: "mutation", data: { method } });
            },
        };
    },
});
