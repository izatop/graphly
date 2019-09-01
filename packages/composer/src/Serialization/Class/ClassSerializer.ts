import {DeclarationReflection} from "typedoc";
import {IType} from "../interfaces";
import {SerializerAbstract} from "../SerializerAbstract";
import {createClassSerializer} from "./index";

export class ClassSerializer extends SerializerAbstract<IType, DeclarationReflection> {
    public get name() {
        return this.data.name;
    }

    public serialize() {
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

        const kind = this.project.getSerializableType(reference.name)!;
        this.assert(
            kind,
            "Class should inherit one of a valid kind",
            () => ({reference}),
        );

        const serializer = createClassSerializer(this.project, kind, this.data)!;
        this.assert(
            serializer,
            "Schema serializer not found",
            () => ({kind}),
        );

        return serializer.serialize();
    }
}
