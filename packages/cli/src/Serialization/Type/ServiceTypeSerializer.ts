import {ITypeService, TypeKind} from "@graphly/schema";
import {DeclarationReflection} from "typedoc";
import {SerializerAbstract} from "../SerializerAbstract";

interface IParameter {
    base: string;
    declaration: DeclarationReflection;
}

export class ServiceTypeSerializer extends SerializerAbstract<ITypeService, IParameter> {
    public get declaration() {
        return this.data.declaration;
    }

    public get base() {
        return this.data.base;
    }

    public get name() {
        return this.declaration.name;
    }

    public get file() {
        const source = this.declaration.sources![0].fileName;
        const target = source.replace(/.ts$/, "");
        return {
            source,
            target,
        };
    }

    public serialize(): ITypeService {
        return {
            name: this.name,
            base: this.base,
            file: this.file,
            kind: TypeKind.SERVICE,
        };
    }
}
