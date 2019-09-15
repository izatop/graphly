import {DeclarationReflection} from "typedoc";
import {IPropertyFunction, PropertyKind} from "../../Type";
import {createPropertySerializer} from "../Property";
import {SerializerAbstract} from "../SerializerAbstract";

export class AccessorTypeSerializer extends SerializerAbstract<IPropertyFunction, DeclarationReflection> {
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
        const property: IPropertyFunction = {
            returns,
            name: this.name,
            kind: PropertyKind.FUNCTION,
            nullable: returns.nullable,
            args: [],
        };

        return property;
    }
}
