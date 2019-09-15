import {XMap} from "@sirian/common";
import {DeclarationReflection, ProjectReflection, ReflectionKind} from "typedoc";
import {ITypeObject, TypeBase, TypeKind, TypeMap} from "../Type";
import {TYPE} from "../Type/const";
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
    }
}
