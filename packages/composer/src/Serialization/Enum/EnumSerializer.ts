import {DeclarationReflection, ReflectionKind} from "typedoc";
import {IProperty, IType, TypeBaseClass} from "../interfaces";
import {SerializerAbstract} from "../SerializerAbstract";

export class EnumSerializer extends SerializerAbstract<IType, DeclarationReflection> {
    public get name() {
        return this.data.name;
    }

    public get file() {
        return this.data.sources![0].fileName;
    }

    public serialize() {
        const property: IProperty[] = [];
        for (const child of this.data.children || []) {
            if (child.kind !== ReflectionKind.EnumMember) {
                continue;
            }

            property.push({
                name: child.name,
                defaultValue: child.defaultValue,
                nullable: false,
                type: "string",
            });
        }
        return {
            property,
            name: this.name,
            file: this.file,
            base: TypeBaseClass.Enum,
            reference: "enum",
        };
    }
}
