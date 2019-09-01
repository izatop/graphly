// tslint:disable-next-line:no-submodule-imports
import {DeclarationReflection, UnionType} from "typedoc/dist/lib/models";
import {PropertyBox} from "../interfaces";
import {createPropertySerializer} from "./index";
import {PropertySerializer} from "./PropertySerializer";

export class UnionPropertySerializer extends PropertySerializer<UnionType> {
    public serialize() {
        let types: Array<PropertyBox | string> = [];
        for (const type of this.data.type.types) {
            const delegateReflection = {
                type,
                name: this.name,
                flags: this.data.flags,
            };

            const serializer = createPropertySerializer(this.project, delegateReflection)!;
            this.assert(
                serializer,
                "Property serializer not found",
                () => type.toObject(),
            );

            const nextType = serializer.serialize().type;
            if (Array.isArray(nextType)) {
                types.push(...nextType);
            } else {
                types.push(nextType);
            }
        }

        if (types.includes("true") && types.includes("false")) {
            types = types.filter((type) => !(type === "true" || type === "false"));
            types.push("boolean");
        }

        // clear undefined value and treat it as value is optional
        const clearTypes = types.filter((value) => value !== "undefined");
        if (clearTypes.length === 1) {
            return {
                ...this.optional,
                name: this.name,
                type: clearTypes[0],
            };
        }

        return {
            ...this.optional,
            name: this.name,
            type: clearTypes,
        };
    }
}
