import {XMap} from "@sirian/common";
import {memoize} from "@sirian/decorators";
import {ok} from "assert";
import {GraphQLObjectType, GraphQLSchema, GraphQLSchemaConfig} from "graphql";
import {IPropertyReference, PropertyKind, TYPE, TypeKind} from "../../../Type";
import {Project} from "../../Project";
import {TransformAbstract} from "../TransformAbstract";
import {ArgumentPropertyResolver} from "./ArgumentPropertyResolver";
import {ObjectPropertyResolver} from "./ObjectPropertyResolver";
import {SchemaObjectTypeTransform} from "./SchemaObjectTypeTransform";

type Args = [Project];

export class SchemaTransform extends TransformAbstract<Args, GraphQLSchema> {
    public readonly output: ObjectPropertyResolver = new ObjectPropertyResolver(this, this.cache);

    public readonly input: ArgumentPropertyResolver = new ArgumentPropertyResolver(this, this.cache);

    public get project() {
        return this.args[0];
    }

    public get types() {
        return this.project.types;
    }

    @memoize()
    protected get cache() {
        return new XMap<string, any>();
    }

    public transform() {
        return new GraphQLSchema(this.transformSchemaType());
    }

    protected getSchemaType() {
        for (const type of this.types.values()) {
            if (type.kind === TypeKind.CLASS && type.base === TYPE.SCHEMA) {
                return type;
            }
        }
    }

    protected transformSchemaType(): GraphQLSchemaConfig {
        const schema = this.getSchemaType()!;
        ok(schema, "The Schema should be defined");

        const config: Partial<GraphQLSchemaConfig> = {};
        for (const property of schema.property) {
            if (property.kind === PropertyKind.REFERENCE && this.types.has(property.reference)) {
                Reflect.set(config, property.name, this.transformSchemaRoot(property));
            }
        }

        ok(config.query, `The query field should be defined in the ${schema.name}`);
        return config as GraphQLSchemaConfig;
    }

    protected transformSchemaRoot(property: IPropertyReference): GraphQLObjectType | undefined {
        const type = this.types.ensure(property.reference);
        ok(type.kind === TypeKind.CLASS, `Wrong type ${type.name} of ${property.name}`);
        if (type.kind === TypeKind.CLASS) {
            return new SchemaObjectTypeTransform(this, type)
                .transform();
        }
    }
}
