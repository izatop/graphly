import {InputType, ITypeObject, PropertyKind, PropertyType, TypeKind} from "../../../Type";
import {TransformAbstract} from "../TransformAbstract";
import {GQLResolveFunctionTransform} from "./GQLResolveFunctionTransform";
import {GQLTransform} from "./GQLTransform";

export abstract class GQLTypeTransform extends TransformAbstract<[GQLTransform, ITypeObject], string> {
    public abstract readonly declaration: string;

    public get context() {
        return this.args[0];
    }

    public get type() {
        return this.args[1];
    }

    public get resolver() {
        return this.context.resolver;
    }

    public transform(): string {
        return `${this.declaration} ${this.type.name} {\n${this.transformBody()}\n}`;
    }

    public transformBody() {
        const segments = [];
        const isInputType = this.type.kind === TypeKind.CLASS && InputType.has(this.type.base);
        for (const property of this.type.property) {
            const type = this.resolver.resolve(this.type, property);
            if (type) {
                const nullable = isInputType
                    ? !!property.defaultValue || property.nullable
                    : property.nullable;

                segments.push(`  ${this.transformName(property)}: ${this.nullable(type, nullable)}`);
                continue;
            }

            this.context.traceEvent.warning(new Error(`Skip ${this.type.name}.${property.name}`));
        }

        return segments.join("\n");
    }

    public transformName(property: PropertyType) {
        if (property.kind === PropertyKind.FUNCTION) {
            return new GQLResolveFunctionTransform(this, property)
                .transform();
        }

        return property.name;
    }

    protected nullable(type: string, nullable?: boolean) {
        if (nullable) {
            return type;
        }

        return `${type}!`;
    }
}
