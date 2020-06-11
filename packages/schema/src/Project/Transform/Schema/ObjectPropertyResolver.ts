import {XMap} from "@sirian/common";
import {GraphQLOutputType} from "graphql";
import {IPropertyReference, ITypeObject, OutputType} from "../../../Type";
import {PropertyResolver} from "./PropertyResolver";
import {SchemaInterfaceTypeTransform} from "./SchemaInterfaceTypeTransform";
import {SchemaObjectTypeTransform} from "./SchemaObjectTypeTransform";
import {SchemaTransform} from "./SchemaTransform";

export class ObjectPropertyResolver extends PropertyResolver<GraphQLOutputType> {
    constructor(context: SchemaTransform, cache: XMap<string, any>) {
        super(context, OutputType, cache);
    }

    protected createObjectType(type: ITypeObject) {
        return new SchemaObjectTypeTransform(this.context, type)
            .transform();
    }

    protected createInterfaceType(of: ITypeObject,
                                  property: IPropertyReference,
                                  type: ITypeObject): GraphQLOutputType {
        const interfaceName = SchemaInterfaceTypeTransform.getInterfaceName(of, property, type);
        if (!this.cache.has(interfaceName)) {
            this.cache.set(
                interfaceName,
                new SchemaInterfaceTypeTransform(this.context, interfaceName, property, type)
                    .transform(),
            );
        }

        return this.cache.ensure(interfaceName);
    }
}
