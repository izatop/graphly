import {isString} from "@sirian/common";
import {GraphQLError, GraphQLScalarType, Kind} from "graphql";
import phone from "phone";

const parse = (value: any) => {
    if (!isString(value)) {
        throw new TypeError(`Value is not a valid phone number: ${value}`);
    }

    const [result] = phone(value);

    if (!isString(result)) {
        throw new TypeError(`Value is not a valid phone number: ${value}`);
    }

    return result;
};

export const PhoneNumberType = new GraphQLScalarType({
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

        const [result] = phone(ast.value);

        if (!isString(result)) {
            throw new TypeError(`Value is not a valid phone number: ${result}`);
        }

        return result;
    },
});
