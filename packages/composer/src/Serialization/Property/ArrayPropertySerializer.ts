// tslint:disable-next-line:no-submodule-imports
import {ArrayType} from "typedoc/dist/lib/models";
import {PropertyBox} from "../interfaces";
import {createPropertySerializer} from "./index";
import {PropertySerializer} from "./PropertySerializer";

export class ArrayPropertySerializer extends PropertySerializer<ArrayType> {
    public serialize() {
        const delegateReflection = {
            type: this.data.type.elementType,
            name: this.name,
            flags: this.data.flags,
        };

        const serializer = createPropertySerializer(this.project, delegateReflection)!;
        this.assert(
            serializer,
            "Property serializer not found",
            () => this.data.type.elementType.toObject(),
        );

        const {type, ...params} = serializer.serialize();
        return {
            ...params,
            name: this.name,
            type: new PropertyBox("Array", type),
        };
    }
}
