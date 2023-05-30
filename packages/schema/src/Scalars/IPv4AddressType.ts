import {isString} from "@sirian/common";
import {GraphQLError, GraphQLScalarType, Kind} from "graphql";

const validator = /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/;

const parse = (value: any): string => {
    if (!isString(value) || !validator.test(value)) {
        throw new TypeError(`Value is not a valid IPv4 address: ${value}`);
    }

    return value;
};

export const IPv4AddressType = new GraphQLScalarType({
    name: "IPv4Address",
    description: "The `IPv4Type` scalar type represents the IPv4 format",
    parseValue: parse,
    serialize: parse,
    parseLiteral: (ast): string => {
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(
                `Can only validate strings as IPv4 but recieved: ${ast.kind}`,
            );
        }

        if (!validator.test(ast.value)) {
            throw new TypeError(`Value is not a valid IPv4: ${ast.value}`);
        }

        return ast.value;
    },
});
