// tslint:disable-next-line:no-submodule-imports
import {TypeParameterType} from "typedoc/dist/lib/models";
import {IPropertyParameter, PropertyKind} from "../../Type";
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
