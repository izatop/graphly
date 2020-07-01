import {isObject, isString} from "@sirian/common";
import {GraphQLScalarType, Kind} from "graphql";

const parse = (value?: string | object) => {
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
    parseLiteral: (ast) => {
        switch (ast.kind) {
            case Kind.STRING:
                return JSON.parse(ast.value);
            case Kind.OBJECT:
                throw new Error(`Not sure what to do with OBJECT for ObjectScalarType`);
            default:
                return null;
        }
    },
});
