import {DeclarationReflection, ReflectionKind} from "typedoc";
import {IProperty} from "../interfaces";
import {createPropertySerializer} from "../Property";
import {SerializerAbstract} from "../SerializerAbstract";

export class CallableTypeSerializer extends SerializerAbstract<IProperty, DeclarationReflection> {
    get name(): string {
        return this.data.name;
    }

    public serialize() {
        this.assert(
            this.data.signatures && this.data.signatures.length === 1,
            "Wrong signature of a resolver",
            () => this.data.toObject(),
        );

        const property = [];
        const signature = this.data.signatures![0];
        for (const parameter of signature.parameters || []) {
            if (parameter.kind !== ReflectionKind.Parameter) {
                continue;
            }

            this.assert(
                parameter.type,
                "Argument type is required",
                () => ({name: parameter.name, type: parameter.type!.toObject()}),
            );

            const delegateReflection = {
                type: parameter.type!,
                name: parameter.name,
                flags: parameter.flags,
                defaultValue: parameter.defaultValue,
            };

            const serializer = createPropertySerializer(this.project, delegateReflection)!;
            this.assert(
                serializer,
                "Argument property serializer not found",
                () => ({name: parameter.name, type: parameter.type!.toObject()}),
            );

            property.push(serializer.serialize());
        }

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
            resolver: property,
        };
    }
}
