import {isNumber} from "@sirian/common";
import {GraphQLError, GraphQLScalarType, Kind} from "graphql";

export const DateTimeType = new GraphQLScalarType({
    name: "DateTime",
    description: "The `DateTime` scalar type represents a date in ISO format",
    parseValue: (value) => {
        return new Date(value);
    },
    serialize: (value) => {
        if (isNumber(value)) {
            return value;
        }

        return value.getTime();
    },
    parseLiteral: (ast) => {
        if (ast.kind !== Kind.INT) {
            throw new GraphQLError(
                `Only INT value allowed as timestamp, received: ${ast.kind}`,
            );
        }

        return +ast.value;
    },
});
