import {isNumber, isInstanceOf, isString, assert} from "@sirian/common";
import {GraphQLScalarType} from "graphql";

const validate = (value: unknown): Date => {
    assert(isString(value) || isNumber(value) || isInstanceOf(value, Date), "Valid DateTime types is string, number and Date");

    const date = new Date(value);
    assert(date.toDateString() !== "Invalid Date", "Invalid date");

    return date;
}

export const DateTimeType = new GraphQLScalarType<Date | string | number, number>({
    name: "DateTime",
    description: "The `DateTime` scalar type represents a date in ISO format",
    parseValue: (value: any) => {
        return new Date(value);
    },
    serialize: (value) => {
        return validate(value).getTime();
    },
});
