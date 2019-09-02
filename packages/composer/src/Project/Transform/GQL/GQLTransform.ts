import {IType, TypeBaseClass} from "../../../Serialization/interfaces";
import {TraceEvent} from "../../../util/TraceEvent";
import {TransformAbstract} from "../TransformAbstract";
import {GQLEnumTypeTransform} from "./GQLEnumTypeTransform";
import {GQLInputTypeTransform} from "./GQLInputTypeTransform";
import {GQLMutationTypeTransform} from "./GQLMutationTypeTransform";
import {GQLQueryTypeTransform} from "./GQLQueryTypeTransform";
import {GQLSchemaTransform} from "./GQLSchemaTransform";
import {GQLSubscriptionTypeTransform} from "./GQLSubscriptionTypeTransform";

export class GQLTransform extends TransformAbstract<[Map<string, IType>], string> {
    public traceEvent = TraceEvent.create(this);

    public transformers = new Map([
        [TypeBaseClass.Enum, GQLEnumTypeTransform],
        [TypeBaseClass.InputType, GQLInputTypeTransform],
        [TypeBaseClass.MutationType, GQLMutationTypeTransform],
        [TypeBaseClass.QueryType, GQLQueryTypeTransform],
        [TypeBaseClass.SubscriptionType, GQLSubscriptionTypeTransform],
        [TypeBaseClass.Schema, GQLSchemaTransform],
    ]);

    protected segments: string[] = [];

    public get types() {
        return this.args[0];
    }

    public emit(type: IType) {
        const transformerCtor = this.transformers.get(type.base)!;
        this.segments.push(
            new transformerCtor(this, type)
                .transform(),
        );
    }

    public transform() {
        const skip = [
            TypeBaseClass.InterfaceType,
            TypeBaseClass.Context,
            TypeBaseClass.Container,
        ];

        for (const type of this.types.values()) {
            if (type.abstract) {
                continue;
            }

            if (!this.transformers.has(type.base)) {
                if (!skip.includes(type.base)) {
                    this.traceEvent.warning(new Error(`Transformer not found for type ${type.base}`));
                }
                continue;
            }

            this.emit(type);
        }

        return this.segments.join("\n\n");
    }
}
