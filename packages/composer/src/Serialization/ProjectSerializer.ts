import {DeclarationReflection, ProjectReflection, ReflectionKind} from "typedoc";
import {inspect} from "../util/inspect";
import {ClassSerializer} from "./Class/ClassSerializer";
import {EnumSerializer} from "./Enum/EnumSerializer";
import {IType, TypeBaseClass} from "./interfaces";
import {SerializeError} from "./SerializeError";
import {TraceEvent} from "./TraceEvent";

export class ProjectSerializer {
    public types = new Map<string, IType>();

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

    public getSerializableType(type: string): TypeBaseClass {
        if (type in TypeBaseClass) {
            return Reflect.get(TypeBaseClass, type);
        }

        if (this.types.has(type)) {
            const chain = this.types.get(type)!;
            return this.getSerializableType(chain.reference);
        }

        return TypeBaseClass.None;
    }

    protected applyExternalModule(declaration: DeclarationReflection) {
        for (const child of declaration.children || []) {
            if (child.kind === ReflectionKind.Enum) {
                const serializer = new EnumSerializer(this, child);
                const description = serializer.serialize();
                this.types.set(serializer.name, description);
                this.traceEvent.emit("enum", serializer.name, description);
            }

            if ([ReflectionKind.Class, ReflectionKind.Interface].includes(child.kind)) {
                try {
                    const serializer = new ClassSerializer(this, child);
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
