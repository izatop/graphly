import {ok} from "assert";
import {GraphQLInputType, GraphQLObjectType, GraphQLSchema, GraphQLSchemaConfig} from "graphql";
import {IProperty, IType, TypeBaseClass} from "../../../Serialization/interfaces";
import {Project} from "../../Project";
import {TransformAbstract} from "../TransformAbstract";
import {TypeTransform} from "../TypeTransform";
import {SchemaObjectTypeTransform} from "./SchemaObjectTypeTransform";

type Args = [Project];

export class SchemaTransform extends TransformAbstract<Args, GraphQLSchema> {
    public typeTransform = new TypeTransform();

    protected readonly objectType = new Map<string, GraphQLObjectType>();

    protected readonly inputType = new Map<string, GraphQLInputType>();

    public get project() {
        return this.args[0];
    }

    public get types() {
        return this.project.types;
    }

    public transform() {
        return new GraphQLSchema(this.transformSchemaType());
    }

    public hasInputType(name: string) {
        return this.inputType.has(name);
    }

    public getInputType(name: string) {
        return this.inputType.get(name)!;
    }

    public setInputType(name: string, type: GraphQLInputType) {
        this.inputType.set(name, type);
    }

    public hasObjectType(name: string) {
        return this.objectType.has(name);
    }

    public getObjectType(name: string) {
        return this.objectType.get(name)!;
    }

    public setObjectType(name: string, type: GraphQLObjectType) {
        this.objectType.set(name, type);
    }

    protected transformSchemaType(): GraphQLSchemaConfig {
        const schema = [...this.types.values()]
            .find(({base}) => base === TypeBaseClass.Schema)!;
        ok(schema, "Schema not found");

        const config: Partial<GraphQLSchemaConfig> = {};
        for (const property of schema.property) {
            Reflect.set(config, property.name, this.transformSchemaRoot(property));
        }

        ok(config.query, "The query field should be defined in a schema");
        return config as GraphQLSchemaConfig;
    }

    protected transformSchemaRoot(property: IProperty): GraphQLObjectType {
        ok(typeof property.type === "string");
        ok(this.types.has(property.type as string));

        const declaration = this.types.get(property.type as string)!;
        return new SchemaObjectTypeTransform(this, declaration)
            .transform();
    }
}
