import {GQLTypeTransform} from "./GQLTypeTransform";

export class GQLEnumTypeTransform extends GQLTypeTransform {
    public readonly declaration: string = "enum";

    public transformBody() {
        const segments = [];
        for (const property of this.type.property) {
            segments.push(`  ${property.name}`);
        }

        return segments.join("\n");
    }
}
