// tslint:disable:no-submodule-imports
import {IPropertyParameter, PropertyKind} from "@graphly/schema";
import {TypeParameterType} from "typedoc/dist/lib/models";
import {PropertySerializer} from "./PropertySerializer";

/**
 * @todo check constraint parameter references
 */
export class TypeParameterPropertySerializer extends PropertySerializer<TypeParameterType> {
    public serialize() {
        const property: IPropertyParameter = {
            ...this.optional,
            kind: PropertyKind.PARAMETER,
            name: this.name,
            parameter: this.data.type.name,
        };

        return property;
    }
}
