import {DeclarationReflection} from "typedoc";
import {IProperty} from "../interfaces";
import {createPropertySerializer} from "../Property";
import {SerializerAbstract} from "../SerializerAbstract";

export class AccessorTypeSerializer extends SerializerAbstract<IProperty, DeclarationReflection> {
    get name(): string {
        return this.data.name;
    }

    public serialize() {
        this.assert(
            this.data.getSignature,
            "Wrong signature of an accessor",
            () => this.data.toObject(),
        );

        const signature = this.data.getSignature!;
        const returnsSerializer = createPropertySerializer(this.project, {
            name: this.name,
            type: signature.type!,
            flags: signature.flags,
        })!;

        this.assert(
            returnsSerializer,
            "Property serializer not found",
            () => this.data.type!.toObject(),
        );

        const returns = returnsSerializer.serialize();
        return {
            type: returns.type,
            nullable: false,
            name: this.name,
            resolver: [],
        };
    }
}
