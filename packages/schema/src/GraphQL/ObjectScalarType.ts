import {isObject, isString} from "@sirian/common";
import {GraphQLScalarType, Kind} from "graphql";

const parseValue = (value?: string | object) => {
    if (isObject(value)) {
        return value;
    }

    if (isString(value)) {
        return JSON.parse(value);
    }

    return null;
};

export const ObjectScalarType = new GraphQLScalarType({
    name: "Object",
    description: "Arbitrary object",
    parseValue,
    serialize: parseValue,
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
