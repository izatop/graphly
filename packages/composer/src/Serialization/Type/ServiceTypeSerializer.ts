import {DeclarationReflection} from "typedoc";
import {ITypeService, TypeKind} from "../../Type";
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
        return this.declaration.sources![0].fileName;
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
