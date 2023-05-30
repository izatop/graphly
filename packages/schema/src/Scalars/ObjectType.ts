import {isObject, isString} from "@sirian/common";
import {GraphQLScalarType} from "graphql";

const parse = (value?: any): unknown => {
    if (isObject(value)) {
        return value;
    }

    if (isString(value)) {
        return JSON.parse(value);
    }

    return null;
};

export const ObjectType = new GraphQLScalarType({
    name: "Object",
    description: "Arbitrary object",
    parseValue: parse,
    serialize: parse,
});
