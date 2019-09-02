import {GraphQLFieldConfigMap, GraphQLObjectType, GraphQLString, Thunk} from "graphql";
import {IType} from "../../../Serialization/interfaces";
import {TransformAbstract} from "../TransformAbstract";
import {SchemaFieldTransform} from "./SchemaFieldTransform";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, IType];

export class SchemaObjectTypeTransform extends TransformAbstract<Args, GraphQLObjectType> {
    public get context() {
        return this.args[0];
    }

    public get declaration() {
        return this.args[1];
    }

    public get types() {
        return this.context.types;
    }

    public get project() {
        return this.context.project;
    }

    public transform() {
        const name = this.declaration.name;
        if (this.context.hasObjectType(name)) {
            return this.context.getObjectType(name);
        }

        const objectType = new GraphQLObjectType({
            name,
            // @todo Pick a description from comments
            description: `Description of ${this.declaration.name}`,
            fields: this.transformFields(),
        });

        this.context.setObjectType(name, objectType);
        return objectType;
    }

    protected transformFields(): Thunk<GraphQLFieldConfigMap<any, any, any>> {
        const fields: Thunk<GraphQLFieldConfigMap<any, any, any>> = {
            _: {type: GraphQLString},
        };

        for (const property of this.declaration.property) {
            const fieldTransform = new SchemaFieldTransform(
                this.context,
                this.declaration,
                property,
            );

            fields[property.name] = fieldTransform.transform();
        }

        console.log({fields});

        return fields;
    }
}
