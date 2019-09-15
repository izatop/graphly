// tslint:disable:no-submodule-imports
import {IPropertyReference, PropertyKind} from "@graphly/schema";
import {ReferenceType} from "typedoc/dist/lib/models";
import {createPropertySerializer} from "./index";
import {PropertySerializer} from "./PropertySerializer";

export class ReferencePropertySerializer extends PropertySerializer<ReferenceType> {
    public serialize(): IPropertyReference {
        if (this.data.type.typeArguments && this.data.type.typeArguments.length > 0) {
            const parameters = [];
            for (const argument of this.data.type.typeArguments) {
                const typeSerializer = createPropertySerializer(this.project, {
                    defaultValue: this.data.defaultValue,
                    type: argument,
                    flags: this.data.flags,
                    name: this.name,
                })!;

                this.assert(
                    typeSerializer,
                    "Serializer not found of a type argument",
                    () => argument.toObject(),
                );

                const value = typeSerializer.serialize();
                parameters.push(value);
            }

            return {
                ...this.optional,
                parameters,
                name: this.name,
                kind: PropertyKind.REFERENCE,
                reference: this.data.type.name,
            };
        }

        return {
            ...this.optional,
            name: this.name,
            kind: PropertyKind.REFERENCE,
            reference: this.data.type.name,
            parameters: [],
        };
    }
}
