import {IProperty, IPropertyResolver, IType} from "../../../Serialization/interfaces";
import {TransformAbstract} from "../TransformAbstract";
import {TypeTransform} from "../TypeTransform";
import {GQLPropertyTransform} from "./GQLPropertyTransform";
import {GQLTransform} from "./GQLTransform";
import {GQLTransformResolverArgs} from "./GQLTransformResolverArgs";

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
            return new GQLTransformResolverArgs(this, property)
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
