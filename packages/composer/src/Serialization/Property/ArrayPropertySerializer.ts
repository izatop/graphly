// tslint:disable-next-line:no-submodule-imports
import {ArrayType} from "typedoc/dist/lib/models";
import {IPropertyReference, PropertyKind} from "../../Type";
import {TYPE} from "../../Type/const";
import {createPropertySerializer} from "./index";
import {PropertySerializer} from "./PropertySerializer";

export class ArrayPropertySerializer extends PropertySerializer<ArrayType> {
    public serialize(): IPropertyReference {
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

        const reference = serializer.serialize();
        return {
            ...this.optional,
            name: this.name,
            kind: PropertyKind.REFERENCE,
            reference: TYPE.ARRAY,
            parameters: [reference],
        };
    }
}
