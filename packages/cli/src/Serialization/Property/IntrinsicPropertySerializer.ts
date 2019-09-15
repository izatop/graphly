// tslint:disable:no-submodule-imports
import {IPropertyScalar, PropertyKind} from "@graphly/schema";
import {IntrinsicType} from "typedoc/dist/lib/models";
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
