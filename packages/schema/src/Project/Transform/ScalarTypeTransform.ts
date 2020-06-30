import {ok} from "assert";
import * as GQL from "graphql";
import {DateTimeType, DomainNameType, EmailAddressType, IPv4AddressType} from "../../GraphQL";
import {ObjectScalarType} from "../../GraphQL/ObjectScalarType";
import {TransformAbstract} from "./TransformAbstract";

export class ScalarTypeTransform extends TransformAbstract<[], GQL.GraphQLScalarType, [string]> {
    public map = new Map<string, GQL.GraphQLScalarType>([
        ["symbol", GQL.GraphQLID],
        ["TypeID", GQL.GraphQLID],
        ["string", GQL.GraphQLString],
        ["TypeString", GQL.GraphQLString],
        ["boolean", GQL.GraphQLBoolean],
        ["TypeBoolean", GQL.GraphQLBoolean],
        ["number", GQL.GraphQLFloat],
        ["TypeFloat", GQL.GraphQLFloat],
        ["TypeInt", GQL.GraphQLInt],
        ["Date", DateTimeType],
        ["TypeDate", DateTimeType],
        ["TypeObject", ObjectScalarType],
        ["TypeEmail", EmailAddressType],
        ["TypeDomain", DomainNameType],
        ["TypeIPv4", IPv4AddressType],
        ["object", ObjectScalarType],
    ]);

    public has(type: string) {
        return this.map.has(type);
    }

    public transform(type: string) {
        ok(this.map.has(type));
        return this.map.get(type)!;
    }
}
