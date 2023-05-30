import {isString} from "@sirian/common";
import {GraphQLError, GraphQLScalarType, Kind} from "graphql";
import phone from "phone";

const parse = (value: any): string => {
    if (!isString(value)) {
        throw new TypeError(`Value is not a valid phone number: ${value}`);
    }

    const result = phone(value);

    if (!result.isValid) {
        throw new TypeError(`Value is not a valid phone number: ${value}`);
    }

    return result.phoneNumber;
};

export const PhoneNumberType = new GraphQLScalarType({
    name: "Phone",
    description: "The `Phone` scalar type represents the phone number",
    parseValue: parse,
    serialize: parse,
    parseLiteral: (ast): string => {
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(
                `Can only validate strings as a phone number but received: ${ast.kind}`,
            );
        }

        const result = phone(ast.value);

        if (!result.isValid) {
            throw new TypeError(`Value is not a valid phone number: ${ast.value}`);
        }

        return result.phoneNumber;
    },
});
