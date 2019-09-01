// tslint:disable-next-line:no-submodule-imports
import {TypeParameterType} from "typedoc/dist/lib/models";
import {PropertySerializer} from "./PropertySerializer";

/**
 * @todo check constraint parameter references
 */
export class TypeParameterPropertySerializer extends PropertySerializer<TypeParameterType> {
    public serialize() {
        return {
            ...this.optional,
            name: this.name,
            type: this.data.type.name,
        };
    }
}
