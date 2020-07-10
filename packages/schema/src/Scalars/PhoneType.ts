import {isString} from "@sirian/common";
import {GraphQLError, GraphQLScalarType, Kind} from "graphql";

const parse = (value: any) => {
    if (!isString(value)) {
        throw new TypeError(`Value is not a valid phone number: ${value}`);
    }

    value = value.replace(/[^0-9]/g, '');

    if (value.length !== 10) {
        throw new TypeError(`Value is not a valid phone number: ${value}`);
    }

    return value;
};

export const PhoneType = new GraphQLScalarType({
    name: "Phone",
    description: "The `Phone` scalar type represents the phone number",
    parseValue: parse,
    serialize: parse,
    parseLiteral: (ast) => {
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(
                `Can only validate strings as a phone number but recieved: ${ast.kind}`,
            );
        }

        const value = ast.value.replace(/[^0-9]/g, '');

        if (value.length !== 10) {
            throw new TypeError(`Value is not a valid phone number: ${value}`);
        }

        return value;
    },
});
