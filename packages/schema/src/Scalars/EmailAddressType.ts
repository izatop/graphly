import {isString} from "@sirian/common";
import {GraphQLError, GraphQLScalarType, Kind} from "graphql";

const sQtext = "[^\\x0d\\x22\\x5c\\x80-\\xff]";
const sDtext = "[^\\x0d\\x5b-\\x5d\\x80-\\xff]";
const sAtom = "[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+";
const sQuotedPair = "\\x5c[\\x00-\\x7f]";
const sDomainLiteral = "\\x5b(" + sDtext + "|" + sQuotedPair + ")*\\x5d";
const sQuotedString = "\\x22(" + sQtext + "|" + sQuotedPair + ")*\\x22";
const sDomainRef = sAtom;
const sSubDomain = "(" + sDomainRef + "|" + sDomainLiteral + ")";
const sWord = "(" + sAtom + "|" + sQuotedString + ")";
const sDomain = sSubDomain + "(\\x2e" + sSubDomain + ")*";
const sLocalPart = sWord + "(\\x2e" + sWord + ")*";
const sAddrSpec = sLocalPart + "\\x40" + sDomain; // complete RFC822 email address spec
const sValidEmail = "^" + sAddrSpec + "$"; // as whole string
const validator = new RegExp(sValidEmail);

const parse = (value: any) => {
    if (!isString(value) || !validator.test(value)) {
        throw new TypeError(`Value is not a valid email address: ${value}`);
    }

    return value;
};

export const EmailAddressType = new GraphQLScalarType({
    name: "EmailAddress",
    description: "The `Email` scalar type represents an email address as specified by RFC822.",
    serialize: parse,
    parseValue: parse,
    parseLiteral: (ast) => {
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(
                `Can only validate strings as email addresses but recieved: ${ast.kind}`,
            );
        }

        if (!validator.test(ast.value)) {
            throw new TypeError(`Value is not a valid email address: ${ast.value}`);
        }

        return ast.value;
    },
});
