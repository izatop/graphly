import {GQLTypeTransform} from "./GQLTypeTransform";

export class GQLSchemaTransform extends GQLTypeTransform {
    public readonly declaration = "schema";

    public transform(): string {
        const segments: string[] = [];
        const {resolver} = this.context;
        for (const property of this.type.property) {
            const type = resolver.resolve(this.type, property);
            if (type) {
                segments.push(`${property.name}: ${type}`);
                continue;
            }

            if (property.name === "query") {
                this.error(new Error(`Schema.query field shouldn't be empty`));
            }
        }

        return `${this.declaration} {\n  ${segments.join("\n  ")}\n}`;
    }
}
