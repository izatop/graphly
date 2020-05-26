import {TYPE, TypeMap} from "@graphly/schema";
import {assert} from "@sirian/assert";
import * as path from "path";
import {JSONOutput} from "typedoc";
import {getEnumConfig, getServiceConfig, getTypeConfig} from "./class";
import {
    getTypeMapBase,
    inheritances,
    isContainerReflection,
    isEnum,
    isExtendableType,
    isObject,
    isReference,
    isReferenceType,
    isService,
    isType,
    isTypeMapReference,
} from "./common";

export class Project {
    public readonly verbose: boolean;
    public readonly types = new Map<string, JSONOutput.Reflection>();

    constructor(reflection: JSONOutput.ProjectReflection, verbose = false) {
        this.verbose = verbose;
        for (const child of reflection.children ?? []) {
            if (isContainerReflection(child)) {
                this.applyModule(child);
                continue;
            }

            this.warn("skip", child.name);
        }
    }

    public serialize(schema: string, source: string) {
        const types = new Map<string, TypeMap>();
        for (const type of this.traverse()) {
            this.info("serialize:success", type.name);
            types.set(type.name, type);
        }

        for (const type of types.values()) {
            if (isTypeMapReference(type)) {
                type.base = getTypeMapBase(type, types);
            }
        }

        const SchemaType = [...types.values()].find((type) => (
            isTypeMapReference(type) && type.base === TYPE.SCHEMA),
        );

        assert(SchemaType, "Cannot find the Schema Type");
        const base = path.relative(schema.replace(SchemaType.file.source, ""), source);
        for (const type of types.values()) {
            type.file = {
                source: path.relative(base, type.file.source),
                target: path.relative(base, type.file.target),
            };
        }

        return types;
    }

    public* traverse() {
        for (const child of this.types.values()) {
            try {
                this.info("transform", child.name);
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
        this.info("module:children", module.name);
        for (const child of module.children ?? []) {
            const name = child.name;
            this.info("child:cache", name);

            if (isExtendableType(child) && child.extendedTypes) {
                for (const type of child.extendedTypes) {
                    if (isReference(type)) {
                        inheritances.set(child.name, type.name);
                    }
                }
            }

            if (isReferenceType(child)) {
                this.types.set(name, child);
                continue;
            }

            this.warn("child:skip", name);
        }
    }

    protected warn(message: string, ...data: any[]) {
        this.log(message, ...data);
    }

    protected info(message: string, ...data: any[]) {
        if (this.verbose) {
            this.log(message, ...data);
        }
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
