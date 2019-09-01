import {IType} from "../../../Serialization/interfaces";
import {TransformAbstract} from "../TransformAbstract";
import {GQLTransform} from "./GQLTransform";

export class GQLSchemaTransform extends TransformAbstract<[GQLTransform, IType], string> {
    public get context() {
        return this.args[0];
    }

    public get type() {
        return this.args[1];
    }

    public transform(): string {
        const segments: string[] = [];
        for (const property of this.type.property) {
            segments.push(`${property.name}: ${property.type}`);
        }

        return `schema {\n  ${segments.join("\n  ")}\n}`;
    }
}
