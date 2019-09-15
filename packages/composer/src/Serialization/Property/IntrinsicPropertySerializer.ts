// tslint:disable-next-line:no-submodule-imports
import {IntrinsicType} from "typedoc/dist/lib/models";
import {IPropertyScalar, PropertyKind} from "../../Type";
import {PropertySerializer} from "./PropertySerializer";

export class IntrinsicPropertySerializer extends PropertySerializer<IntrinsicType> {
    public serialize() {
        const property: IPropertyScalar = {
            ...this.optional,
            kind: PropertyKind.SCALAR,
            name: this.name,
            type: this.data.type.name,
        };

        return property;
    }
}
