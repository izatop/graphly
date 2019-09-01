// tslint:disable-next-line:no-submodule-imports
import {IntrinsicType} from "typedoc/dist/lib/models";
import {PropertySerializer} from "./PropertySerializer";

export class IntrinsicPropertySerializer extends PropertySerializer<IntrinsicType> {
    public serialize() {
        return {
            ...this.optional,
            name: this.name,
            type: this.data.type.name,
        };
    }
}
