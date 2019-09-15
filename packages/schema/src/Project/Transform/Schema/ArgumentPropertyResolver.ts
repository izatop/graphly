import {GraphQLInputType} from "graphql";
import {IPropertyReference, ITypeObject, OutputType} from "../../../Type";
import {PropertyResolver} from "./PropertyResolver";
import {SchemaInputObjectTypeTransform} from "./SchemaInputObjectTypeTransform";
import {SchemaTransform} from "./SchemaTransform";

export class ArgumentPropertyResolver extends PropertyResolver<GraphQLInputType> {
    constructor(context: SchemaTransform) {
        super(context, OutputType);
    }

    protected createObjectType(type: ITypeObject) {
        return new SchemaInputObjectTypeTransform(this.context, type)
            .transform();
    }

    protected createInterfaceType(name: string, property: IPropertyReference, type: ITypeObject): GraphQLInputType {
        throw new Error(`Input types don't support interfaces`);
    }
}
