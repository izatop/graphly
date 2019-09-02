import {GraphQLScalarType, Kind} from "graphql";

export const DateTimeType = new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime scalar type represents in ISO date string",
    parseValue(value) {
        return new Date(value);
    },
    serialize(value) {
        if (typeof value === "number") {
            return value;
        }

        return value.getTime();
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return +ast.value;
        }

        return null;
    },
});
