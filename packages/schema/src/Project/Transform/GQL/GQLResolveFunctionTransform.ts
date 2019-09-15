import {IPropertyFunction} from "../../../Type";
import {TransformAbstract} from "../TransformAbstract";
import {GQLTypeTransform} from "./GQLTypeTransform";

export class GQLResolveFunctionTransform extends TransformAbstract<[GQLTypeTransform, IPropertyFunction], string> {
    public get property() {
        return this.args[1];
    }

    public get context() {
        return this.args[0];
    }

    public get resolver() {
        return this.context.resolver;
    }

    public get type() {
        return this.context.type;
    }

    public transform() {
        return this.transformResolverArgs(this.property);
    }

    protected transformResolverArgs(property: IPropertyFunction) {
        const args: string[] = [];
        if (!property.args.length) {
            return `${property.name}`;
        }

        for (const arg of property.args) {
            const nextArg = this.resolver.resolve(this.type, arg);
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
}
