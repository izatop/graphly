import {ok} from "assert";
import {GraphQLFieldResolver} from "graphql";
import {resolve} from "path";
import {InputType, IPropertyFunction, PropertyKind, PropertyType, TYPE, TypeKind} from "../../../Type";
import {getPropertyDescriptor} from "../../../util/helper";
import {TransformAbstract} from "../TransformAbstract";
import {SchemaObjectFieldTransform} from "./SchemaObjectFieldTransform";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, SchemaObjectFieldTransform, IPropertyFunction];
type Returns = GraphQLFieldResolver<any, any, any> | undefined;
type ResolveArgFn = (args: object, context: object) => any;

export class SchemaResolveTransform extends TransformAbstract<Args, Returns> {
    public get schema() {
        return this.args[0];
    }

    public get context() {
        return this.args[1];
    }

    public get type() {
        return this.context.type;
    }

    public get property() {
        return this.args[2];
    }

    public transform(): Returns {
        const file = resolve(this.context.project.root, this.type.file.target);
        const module = require(file);
        ok(this.type.name in module, `Cannot find module ${this.type.name} at ${file}`);

        const owner: ObjectConstructor = Reflect.get(module, this.type.name);
        ok(
            this.property.name in owner.prototype,
            `Cannot find resolver ${this.type.name}.${this.property.name} at ${file}`,
        );

        const ns = `${this.type.name}.${this.property.name}`;
        const descriptor = getPropertyDescriptor(owner, this.property.name)!;
        ok(descriptor, `Cannot find descriptor of ${ns}`);

        const resolver = this.createMagickResolveFunction(ns, owner.prototype, descriptor);
        return function $resolve(parent: object, args: object, context: object) {
            return resolver(parent, args, context);
        };
    }

    protected createMagickResolveFunction(ns: string, proto: object, descriptor: PropertyDescriptor) {
        ok(
            descriptor && descriptor.value || descriptor.get,
            `Wrong resolver function ${this.type.name}.${this.property.name}`,
        );

        const map: ResolveArgFn[] = [];
        const resolver = descriptor.value || descriptor.get;
        for (const arg of this.property.args) {
            map.push(this.createArgResolver(arg));
        }

        return function $map$(parent: object, args: object, context: object) {
            const thisArg = Object.create(proto, Object.getOwnPropertyDescriptors(parent));
            const resolveArgs = map.map((fn) => fn(args, context));
            return resolver.apply(thisArg, resolveArgs);
        };
    }

    protected createArgResolver(property: PropertyType): ResolveArgFn {
        const {name} = property;
        const ns = `${this.type.name}.${this.property.name}`;
        if (property.kind === PropertyKind.SCALAR) {
            ok(
                InputType.has(property.type),
                `Wrong scalar type ${property.type} of ${ns}`,
            );

            return (args: { [k: string]: any }) => {
                return args[name];
            };
        }

        if (property.kind === PropertyKind.REFERENCE && property.parameters.length > 0) {
            ok(
                property.parameters.length === 1,
                `Wrong parameters count for ${property.reference} of ${ns}`,
            );

            return this.createArgResolver(property.parameters[0]);
        }

        if (property.kind === PropertyKind.REFERENCE) {
            if (this.schema.input.scalars.has(property.reference)) {
                return (args: { [k: string]: any }) => {
                    return args[name];
                };
            }

            if (this.schema.types.has(property.reference)) {
                const type = this.schema.types.ensure(property.reference)!;
                if (type.kind === TypeKind.CLASS) {
                    if (InputType.has(type.base)) {
                        return (args: { [k: string]: any }) => {
                            return args[name];
                        };
                    }
                }

                if (type.kind === TypeKind.ENUM) {
                    return (args: { [k: string]: any }) => {
                        return args[name];
                    };
                }

                if (type.kind === TypeKind.SERVICE) {
                    if (type.base === TYPE.CONTEXT) {
                        return (args: { [k: string]: any }, context: object) => {
                            return context;
                        };
                    }

                    if (type.base === TYPE.CONTAINER) {
                        return (args: { [k: string]: any }, context: object) => {
                            return Reflect.get(context, "container");
                        };
                    }
                }
            }

            return () => {
                throw new Error(`Cannot resolve an argument type of ${ns}(${property.name}: ${property.reference})`);
            };
        }

        return () => {
            throw new Error(`Cannot resolve an argument type of ${ns}`);
        };
    }
}
