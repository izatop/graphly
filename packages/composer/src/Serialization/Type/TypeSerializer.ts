import {DeclarationReflection, ReflectionKind} from "typedoc";
import {TypeBase, TypeKind, TypeMap, TypeService} from "../../Type";
import {SerializerAbstract} from "../SerializerAbstract";
import {ClassTypeSerializer} from "./ClassTypeSerializer";
import {EnumTypeSerializer} from "./EnumTypeSerializer";
import {ServiceTypeSerializer} from "./ServiceTypeSerializer";

export class TypeSerializer extends SerializerAbstract<TypeMap, DeclarationReflection> {
    public get name() {
        return this.data.name;
    }

    public serialize(): TypeMap {
        if (this.data.kind === ReflectionKind.Enum) {
            return new EnumTypeSerializer(this.project, this.data)
                .serialize();
        }

        this.assert(
            this.data.extendedTypes && this.data.extendedTypes.length > 0,
            "Class should have inheritance",
        );

        const inheritance = this.data.extendedTypes!.map((item) => item.toObject());
        const reference = inheritance.find((item) => item.type === "reference")!;
        this.assert(
            reference,
            "Class should have reference type",
        );

        const base = this.project.getBaseType(reference.name)!;
        this.assert(
            base,
            "Class should inherit one of a valid base",
            () => ({reference}),
        );

        if (TypeService.has(base)) {
            return new ServiceTypeSerializer(this.project, {base, declaration: this.data})
                .serialize();
        }

        if (this.data.kind === ReflectionKind.Class) {
            const kind = this.data.flags.isAbstract
                ? TypeKind.ABSTRACT
                : TypeKind.CLASS;

            return new ClassTypeSerializer(this.project, {base, kind, declaration: this.data})
                .serialize();
        }

        if (this.data.kind === ReflectionKind.Interface) {
            const kind = TypeKind.INTERFACE;
            return new ClassTypeSerializer(this.project, {base, kind, declaration: this.data})
                .serialize();
        }

        throw new Error(`A type ${this.data.name} isn't allowed here`);
    }
}
