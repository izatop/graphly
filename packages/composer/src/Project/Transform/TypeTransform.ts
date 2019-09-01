import {ok} from "assert";
import * as GQL from "graphql";
import {TransformAbstract} from "./TransformAbstract";

export class TypeTransform extends TransformAbstract<[], string, [string]> {
    public map = new Map<string, string | { name: string }>([
        ["symbol", GQL.GraphQLID],
        ["TypeID", GQL.GraphQLID],
        ["string", GQL.GraphQLString],
        ["TypeString", GQL.GraphQLString],
        ["boolean", GQL.GraphQLBoolean],
        ["TypeBoolean", GQL.GraphQLBoolean],
        ["number", GQL.GraphQLFloat],
        ["TypeFloat", GQL.GraphQLFloat],
        ["TypeInt", GQL.GraphQLInt],
        ["Date", "DateTime"],
        ["TypeDate", "DateTime"],
        ["TypeObject", "Object"],
        ["object", "Object"],
    ]);

    public has(input: string) {
        return this.map.has(input);
    }

    public transform(input: string) {
        ok(this.map.has(input));
        const type = this.map.get(input)!;

        if (typeof type === "string") {
            return type;
        }

        return type.name;
    }
}
