import {IProperty, IPropertyResolver, PropertyBox, TypeBaseClass} from "../../../Serialization/interfaces";
import {Boxes} from "../interfaces";
import {TransformAbstract} from "../TransformAbstract";
import {GQLTypeTransform} from "./GQLTypeTransform";

export class GQLTransformResolverArgs extends TransformAbstract<[GQLTypeTransform, IPropertyResolver], string> {
    public get property() {
        return this.args[1];
    }

    public get context() {
        return this.args[0];
    }

    public get typeTransform() {
        return this.context.typeTransform;
    }

    public get types() {
        return this.context.context.types;
    }

    public get type() {
        return this.context.type;
    }

    public transform() {
        return this.transformResolverArgs(this.property);
    }

    protected transformResolverArgs(property: IPropertyResolver) {
        const args: string[] = [];
        for (const arg of property.resolver) {
            const nextArg = this.transformResolverArg(arg);
            if (nextArg) {
                const signature: string[] = [`${arg.name}: ${nextArg}`];
                if (arg.defaultValue) {
                    signature.push(" = ", arg.defaultValue);
                } else if (!arg.nullable) {
                    signature.push("!");
                }

                args.push(signature.join(""));
            }
        }

        return `${property.name}(${args.join(", ")})`;
    }

    protected transformResolverArg(arg: IProperty): string | undefined {
        if (typeof arg.type === "string") {
            if (this.typeTransform.has(arg.type)) {
                return this.typeTransform.transform(arg.type).name;
            }

            if (this.types.has(arg.type)) {
                const declaration = this.types.get(arg.type)!;
                if (declaration.base === TypeBaseClass.InputType) {
                    return arg.type;
                }

                return;
            }
        }

        if (arg.type instanceof PropertyBox) {
            const [parameter, ...parameters] = arg.type.args;
            const type = this.transformResolverArg({
                ...arg,
                type: parameter,
            });

            if (arg.type.type === Boxes.Array && type) {
                return `[${type}!]`;
            }

            if (typeof parameter === "string" && this.types.has(parameter)) {
                return;
            }
        }

        throw new Error(`Cannot resolve ${this.type.name}.${this.property.name}.${arg.name}`);
    }
}
