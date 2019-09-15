import {GQLTypeTransform} from "./GQLTypeTransform";

export class GQLSchemaTransform extends GQLTypeTransform {
    public readonly declaration = "schema";

    public transform(): string {
        const segments: string[] = [];
        for (const property of this.type.property) {
            const type = this.context.resolver.resolve(this.type, property);
            if (type) {
                segments.push(`${property.name}: ${type}`);
                continue;
            }

            this.context.traceEvent.warning(new Error(`Skip schema property ${property.name}`));
        }

        return `${this.declaration} {\n  ${segments.join("\n  ")}\n}`;
    }
}
