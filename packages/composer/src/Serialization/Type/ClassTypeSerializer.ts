import {DeclarationReflection, ReflectionKind} from "typedoc";
// tslint:disable-next-line:no-submodule-imports
import {Type} from "typedoc/dist/lib/models";
import {ITypeObject, ITypeService, PropertyType, TypeKind} from "../../Type";
import {AccessorTypeSerializer} from "../Function/AccessorTypeSerializer";
import {CallableTypeSerializer} from "../Function/CallableTypeSerializer";
import {createPropertySerializer} from "../Property";
import {SerializerAbstract} from "../SerializerAbstract";

export interface ISchemaTypeSerializerParameter {
    base: string;
    kind: TypeKind.ABSTRACT | TypeKind.CLASS | TypeKind.INTERFACE;
    declaration: DeclarationReflection;
}

export class ClassTypeSerializer extends SerializerAbstract<ITypeObject | ITypeService,
    ISchemaTypeSerializerParameter> {
    public get declaration() {
        return this.data.declaration;
    }

    public get base() {
        return this.data.base;
    }

    public get kind() {
        return this.data.kind;
    }

    public get name() {
        return this.declaration.name;
    }

    public get file() {
        return this.declaration.sources![0].fileName;
    }

    public getReference() {
        const inheritance = this.declaration.extendedTypes!.map((item) => item.toObject());
        return inheritance.find((item) => item.type === "reference")!;
    }

    public serialize(): ITypeObject {
        const property: PropertyType[] = [];
        const reference = this.getReference();
        for (const child of this.declaration.children || []) {
            const valid = !child.flags.isPrivate
                && !child.flags.isProtected
                && !child.flags.isStatic;

            if (!valid) {
                continue; // skip protected or static properties
            }

            const serializer = this.createPropertySerializer(child)!;
            this.assert(
                serializer,
                "Property serializer not found",
                () => child!.toObject(),
            );

            property.push(serializer.serialize());
        }

        const parameter: string[] = [];
        if (this.data.declaration.typeParameters) {
            for (const p of this.data.declaration.typeParameters) {
                parameter.push(p.name);
            }
        }

        return {
            property,
            parameter,
            name: this.name,
            base: this.base,
            kind: this.kind,
            file: this.file,
            reference: reference.name,
        };
    }

    protected createPropertySerializer<T extends Type>(property: DeclarationReflection) {
        if (property.kind === ReflectionKind.Property) {
            return createPropertySerializer(this.project, {
                name: property.name,
                type: property.type!,
                flags: property.flags,
                defaultValue: property.defaultValue,
            });
        }

        if (property.kind === ReflectionKind.Method) {
            return new CallableTypeSerializer(this.project, property);
        }

        if (property.kind === ReflectionKind.Accessor) {
            return new AccessorTypeSerializer(this.project, property);
        }
    }
}
