import {ok} from "assert";
import {GraphQLFieldConfigMap, GraphQLObjectType, Thunk} from "graphql";
import {ITypeObject, OutputType} from "../../../Type";
import {TransformAbstract} from "../TransformAbstract";
import {SchemaObjectFieldTransform} from "./SchemaObjectFieldTransform";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, ITypeObject];

export class SchemaObjectTypeTransform extends TransformAbstract<Args, GraphQLObjectType> {
    public get context() {
        return this.args[0];
    }

    public get type() {
        return this.args[1];
    }

    public get project() {
        return this.context.project;
    }

    public transform() {
        ok(
            OutputType.has(this.type.base),
            `Wrong object base type ${this.type.base} of ${this.type.name}`,
        );

        return new GraphQLObjectType({
            name: this.type.name,
            fields: () => this.fields(),
            // @todo Pick a description from comments
            description: `Description of ${this.type.name}`,
        });
    }

    protected fields(): GraphQLFieldConfigMap<any, any, any> {
        const fields: Thunk<GraphQLFieldConfigMap<any, any, any>> = {};
        for (const property of this.type.property) {
            fields[property.name] = new SchemaObjectFieldTransform(this.context, this, property)
                .transform();
        }

        return fields;
    }
}
