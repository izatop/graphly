import {ITypeEnum, TypeKind} from "@graphly/schema";
import {DeclarationReflection, ReflectionKind} from "typedoc";
import {SerializerAbstract} from "../SerializerAbstract";

export class EnumTypeSerializer extends SerializerAbstract<ITypeEnum, DeclarationReflection> {
    public get name() {
        return this.data.name;
    }

    public get file() {
        const source = this.data.sources![0].fileName;
        const target = source.replace(/.ts$/, "");
        return {
            source,
            target,
        };
    }

    public serialize(): ITypeEnum {
        let index = 0;
        const property: { [key: string]: string | number } = {};
        for (const child of this.data.children || []) {
            if (child.kind !== ReflectionKind.EnumMember) {
                continue;
            }

            property[child.name] = child.defaultValue
                ? JSON.parse(child.defaultValue)
                : index++;
        }

        return {
            property,
            name: this.name,
            file: this.file,
            kind: TypeKind.ENUM,
        };
    }
}
