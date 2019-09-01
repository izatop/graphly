import {IProperty, IPropertyResolver, IType, PropertyBox, TypeBaseClass} from "../../../Serialization/interfaces";
import {Boxes} from "../interfaces";
import {TransformAbstract} from "../TransformAbstract";
import {TypeTransform} from "../TypeTransform";
import {GQLPropertyTransform} from "./GQLPropertyTransform";
import {GQLTransform} from "./GQLTransform";

export abstract class GQLTypeTransform extends TransformAbstract<[GQLTransform, IType], string> {
    public abstract readonly declaration: string;

    public typeTransform = new TypeTransform();

    public get context() {
        return this.args[0];
    }

    public get type() {
        return this.args[1];
    }

    public transform(): string {
        return `${this.declaration} ${this.type.name} {\n${this.transformBody()}\n}`;
    }

    public transformBody() {
        const segments = [];
        for (const property of this.type.property) {
            const type = new GQLPropertyTransform(this, property).transform();
            segments.push(`  ${this.transformName(property)}: ${this.nullable(type, property.nullable)}`);
        }

        return segments.join("\n");
    }

    public transformName(property: IProperty | IPropertyResolver) {
        if ("resolver" in property) {
            return this.transformResolverArgs(property);
        }

        return property.name;
    }

    protected transformResolverArgs(property: IPropertyResolver) {
        const args: string[] = [];
        for (const arg of property.resolver) {
            const nextArg = this.transformResolverArg(arg);
            if (nextArg) {
                const signature: string[] = [
                    `${arg.name}: ${nextArg}`,
                ];

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
                const nextType = this.typeTransform.transform(arg.type);
                return nextType;
            }

            if (this.context.types.has(arg.type)) {
                const declaration = this.context.types.get(arg.type)!;
                if (declaration.base === TypeBaseClass.InputType) {
                    return arg.type;
                }
            }
        }

        if (arg.type instanceof PropertyBox && arg.type.type === Boxes.Array) {
            const [parameter] = arg.type.args;
            return this.transformResolverArg({
                ...arg,
                type: parameter,
            });
        }
    }

    protected nullable(type: string, nullable?: boolean) {
        if (nullable) {
            return type;
        }

        return `${type}!`;
    }
}
