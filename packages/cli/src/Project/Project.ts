import {ITypeObject, TypeBase, TypeKind, TypeMap} from "@graphly/schema";
import {JSONOutput} from "typedoc";
import {getEnumConfig, getServiceConfig, getTypeConfig} from "./class";
import {assert, isContainerReflection, isEnum, isObject, isReferenceType, isService, isType} from "./common";

export class Project {
    public readonly types = new Map<string, JSONOutput.Reflection>();
    public readonly base: string;

    constructor(path: string, reflection: JSONOutput.ProjectReflection) {
        this.base = path;
        for (const child of reflection.children ?? []) {
            if (isContainerReflection(child)) {
                this.applyModule(child);
                continue;
            }

            this.warn("skip", child.name);
        }
    }

    public serialize() {
        const types = new Map<string, TypeMap>();
        for (const type of this.traverse()) {
            this.log("serialize:success", type.name);
            types.set(type.name, type);
        }

        const kinds = [TypeKind.CLASS, TypeKind.ABSTRACT, TypeKind.INTERFACE];
        const isReference = (value: TypeMap): value is ITypeObject => kinds.includes(value.kind);
        const getParentBase = (base: string) => {
            const type = types.get(base);
            assert(type && isReference(type));
            return type.base;
        };

        const resolve = (value: ITypeObject) => TypeBase.has(value.base)
            ? value.base
            : getParentBase(value.base);

        for (const type of types.values()) {
            if (isReference(type)) {
                type.base = resolve(type);
            }
        }

        return types;
    }

    public* traverse() {
        for (const child of this.types.values()) {
            try {
                this.log("transform", child.name);
                if (isEnum(child)) {
                    yield getEnumConfig(child, this);
                    continue;
                }

                if (isService(child)) {
                    yield getServiceConfig(child, this);
                    continue;
                }

                if (isType(child)) {
                    yield getTypeConfig(child, this);
                    continue;
                }

                this.warn("transform:skip", child.name);
            } catch (error) {
                this.warn("transform:error", child.name, {message: error.message, stack: error.stack}, child);
                throw error;
            }
        }
    }

    protected applyModule(module: JSONOutput.ContainerReflection) {
        this.log("module:children", module.name);
        for (const child of module.children ?? []) {
            this.log("child:cache", child.name);
            if (isReferenceType(child)) {
                this.types.set(child.name, child);
                continue;
            }

            this.warn("child:skip", child);
        }
    }

    protected warn(message: string, ...data: any[]) {
        this.log(message, ...data);
    }

    protected log(message: string, ...data: any[]) {
        process.stdout.write(
            message
            + ": "
            + data.map((item) => isObject(item) ? JSON.stringify(item, null, 2) : item).join("\n")
            + "\n\n",
        );
    }
}
