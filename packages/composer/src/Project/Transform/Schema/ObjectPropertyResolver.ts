import {GraphQLOutputType} from "graphql";
import {IPropertyReference, ITypeObject, OutputType} from "../../../Type";
import {PropertyResolver} from "./PropertyResolver";
import {SchemaInterfaceTypeTransform} from "./SchemaInterfaceTypeTransform";
import {SchemaObjectTypeTransform} from "./SchemaObjectTypeTransform";
import {SchemaTransform} from "./SchemaTransform";

export class ObjectPropertyResolver extends PropertyResolver<GraphQLOutputType> {
    constructor(context: SchemaTransform) {
        super(context, OutputType);
    }

    protected createObjectType(type: ITypeObject) {
        return new SchemaObjectTypeTransform(this.context, type)
            .transform();
    }

    protected createInterfaceType(name: string, property: IPropertyReference, type: ITypeObject): GraphQLOutputType {
        return new SchemaInterfaceTypeTransform(this.context, name, property, type)
            .transform();
    }
}
