// tslint:disable-next-line:no-submodule-imports
import {ReferenceType} from "typedoc/dist/lib/models";
import {PropertyBox, PropertyType} from "../interfaces";
import {createPropertySerializer} from "./index";
import {PropertySerializer} from "./PropertySerializer";

export class ReferencePropertySerializer extends PropertySerializer<ReferenceType> {
    public serialize() {
        if (this.data.type.typeArguments && this.data.type.typeArguments.length > 0) {
            const args: [PropertyType, ...PropertyType[]] = [] as any;
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
                args.push(value.type);
            }

            return {
                ...this.optional,
                name: this.name,
                type: new PropertyBox(this.data.type.name, ...args),
            };
        }

        return {
            ...this.optional,
            name: this.name,
            type: this.data.type.name,
        };
    }
}
