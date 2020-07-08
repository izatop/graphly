import {isString} from "@sirian/common";
import {GraphQLError, GraphQLScalarType, Kind} from "graphql";

const validator = /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/i;

const parse = (value: any) => {
    if (!isString(value) || !validator.test(value)) {
        throw new TypeError(`Value is not a valid domain name: ${value}`);
    }

    return value.toLowerCase();
};

export const DomainNameType = new GraphQLScalarType({
    name: "DomainName",
    description: "The `DomainName` scalar type represents the domain name",
    parseValue: parse,
    serialize: parse,
    parseLiteral: (ast) => {
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(
                `Can only validate strings as a domain name but recieved: ${ast.kind}`,
            );
        }

        if (!validator.test(ast.value)) {
            throw new TypeError(`Value is not a valid domain name: ${ast.value}`);
        }

        return ast.value.toLowerCase();
    },
});
