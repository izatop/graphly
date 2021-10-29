import {isNumber, isInstanceOf} from "@sirian/common";
import {GraphQLScalarType} from "graphql";

export const DateTimeType = new GraphQLScalarType({
    name: "DateTime",
    description: "The `DateTime` scalar type represents a date in ISO format",
    parseValue: (value: any) => {
        return new Date(value);
    },
    serialize: (value) => {
        if (isNumber(value)) {
            return value;
        }

        if (isInstanceOf(value, Date)) {
            return value.getTime();
        }
    },
});
