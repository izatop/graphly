import {ITypeObject, TYPE, TypeBase, TypeKind, TypeMap} from "@graphly/schema";
import {XMap} from "@sirian/common";
import {DeclarationReflection, ProjectReflection, ReflectionKind} from "typedoc";
import {TraceEvent} from "../util/TraceEvent";
import {TypeSerializer} from "./Type";

export class ProjectSerializer {
    public types = new XMap<string, TypeMap>();

    protected reflection: ProjectReflection;

    protected traceEvent = TraceEvent.create(this);

    constructor(reflection: ProjectReflection) {
        this.reflection = reflection;
    }

    public serialize() {
        for (const child of this.reflection.children || []) {
            if (child.kind === ReflectionKind.ExternalModule) {
                this.applyExternalModule(child);
            }
        }

        return this.types;
    }

    public getBaseType(type: string): string {
        if (TypeBase.has(type)) {
            return type;
        }

        if (this.types.has(type)) {
            const chain = this.types.ensure(type);
            if (chain.kind === TypeKind.ENUM) {
                return TYPE.ENUM;
            }

            if (this.isTypeObject(chain) && chain.reference) {
                return this.getBaseType(chain.reference);
            }
        }

        return TYPE.UNKNOWN;
    }

    protected isTypeObject(type: TypeMap): type is ITypeObject {
        const {kind} = type;
        return kind === TypeKind.ABSTRACT
            || kind === TypeKind.INTERFACE
            || kind === TypeKind.CLASS;
    }

    protected applyExternalModule(declaration: DeclarationReflection) {
        for (const child of declaration.children || []) {
            if ([ReflectionKind.Class, ReflectionKind.Interface, ReflectionKind.Enum].includes(child.kind)) {
                try {
                    const serializer = new TypeSerializer(this, child);
                    const description = serializer.serialize();
                    this.types.set(serializer.name, description);
                    this.traceEvent.emit("type", serializer.name, description);
                } catch (error) {
                    this.traceEvent.warning(error);
                }
            }
        }

        const kindTypeCheck = (t: TypeMap): t is ITypeObject => (
            [TypeKind.ABSTRACT, TypeKind.CLASS, TypeKind.INTERFACE, TypeKind.SERVICE].includes(t.kind)
        );

        // post-check for wrong ordered types
        for (const child of this.types.values()) {
            if (kindTypeCheck(child) && child.base === TYPE.UNKNOWN) {
                const base = this.resolveBaseByTypeMap(child);
                if (base) {
                    child.base = base;
                }
            }
        }
    }

    protected resolveBaseByTypeMap(type: ITypeObject): string {
        const {reference} = type;
        if (!reference) {
            return TYPE.UNKNOWN;
        }

        if (this.types.has(reference)) {
            return this.resolveBaseByTypeMap(this.types.ensure(reference) as ITypeObject);
        }

        if (reference in TypeBase) {
            return reference;
        }

        return TYPE.UNKNOWN;
    }
}
