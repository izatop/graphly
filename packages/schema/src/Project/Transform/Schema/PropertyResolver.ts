import {XMap} from "@sirian/common";
import {
    GraphQLEnumType,
    GraphQLEnumValueConfigMap,
    GraphQLInputType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLOutputType,
} from "graphql";
import {
    IPropertyFunction,
    IPropertyReference,
    ITypeEnum,
    ITypeObject,
    PropertyKind,
    PropertyType,
    ReturnType,
    TypeKind,
} from "../../../Type";
import {TYPE} from "../../../Type/const";
import {ucfirst} from "../../../util/ucfirst";
import {ScalarTypeTransform} from "../ScalarTypeTransform";
import {SchemaTransform} from "./SchemaTransform";

const cache = new XMap<string, any>();

export abstract class PropertyResolver<T extends GraphQLOutputType | GraphQLInputType> {
    public scalars = new ScalarTypeTransform();

    public context: SchemaTransform;

    public cache = cache;

    public base: Set<string>;

    constructor(context: SchemaTransform, base: Set<string>) {
        this.base = base;
        this.context = context;
    }

    public resolve(of: ITypeObject, property: PropertyType): T | undefined {
        if (property.kind === PropertyKind.SCALAR) {
            return this.scalars.transform(property.type) as T;
        }

        if (property.kind === PropertyKind.FUNCTION) {
            return this.resolveFunctionType(of, property);
        }

        if (property.kind === PropertyKind.REFERENCE) {
            return this.resolveReferenceType(of, property);
        }
    }

    protected resolveFunctionType(of: ITypeObject, property: IPropertyFunction): T | undefined {
        return this.resolve(of, property.returns);
    }

    protected resolveReferenceType(of: ITypeObject, property: IPropertyReference): T | undefined {
        if (this.scalars.has(property.reference)) {
            return this.scalars.transform(property.reference) as T;
        }

        if (this.cache.has(property.reference)) {
            return this.cache.ensure(property.reference);
        }

        if (ReturnType.has(property.reference)) {
            return this.resolve(of, property.parameters[0]);
        }

        if (property.reference === TYPE.ARRAY) {
            const type = this.resolve(of, property.parameters[0]);
            return type ? new GraphQLList(GraphQLNonNull(type)) as T : undefined;
        }

        if (this.context.types.has(property.reference)) {
            const type = this.context.types.ensure(property.reference);
            if (type.kind === TypeKind.CLASS) {
                this.cache.set(type.name, this.createObjectType(type));
            }

            if (type.kind === TypeKind.INTERFACE) {
                this.cache.set(type.name, this.createInterfaceType(
                    ucfirst(of.name) + ucfirst(property.name),
                    property,
                    type,
                ));
            }

            if (type.kind === TypeKind.ENUM) {
                this.cache.set(type.name, this.createEnumType(type));
            }
        }

        return this.cache.get(property.reference);
    }

    protected createEnumType(type: ITypeEnum): T {
        const values: GraphQLEnumValueConfigMap = {};
        for (const [key, value] of Object.entries(type.property)) {
            values[key] = {value};
        }

        return new GraphQLEnumType({
            name: type.name,
            values,
        }) as T;
    }

    protected abstract createObjectType(type: ITypeObject): T;

    protected abstract createInterfaceType(name: string, property: IPropertyReference, type: ITypeObject): T;
}
