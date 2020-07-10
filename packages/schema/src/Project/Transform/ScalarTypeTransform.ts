import {ok} from "assert";
import * as GQL from "graphql";
import * as Scalars from "../../Scalars";
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
        ["Date", Scalars.DateTimeType],
        ["TypeDate", Scalars.DateTimeType],
        ["TypeObject", Scalars.ObjectType],
        ["TypeEmail", Scalars.EmailAddressType],
        ["TypeDomain", Scalars.DomainNameType],
        ["TypePhone", Scalars.PhoneType],
        ["TypeIPv4", Scalars.IPv4AddressType],
        ["object", Scalars.ObjectType],
    ]);

    public has(type: string) {
        return this.map.has(type);
    }

    public transform(type: string) {
        ok(this.map.has(type));
        return this.map.get(type)!;
    }
}
