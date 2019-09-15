import {ITypeEnum} from "../../../Type";
import {TransformAbstract} from "../TransformAbstract";

export class GQLEnumTypeTransform extends TransformAbstract<[ITypeEnum], string> {
    public get type() {
        return this.args[0];
    }

    public transform() {
        const segments = [];
        for (const [name] of Object.entries(this.type.property)) {
            segments.push(name);
        }

        return `enum ${this.type.name} {\n  ${segments.join("\n  ")}\n}`;
    }
}
