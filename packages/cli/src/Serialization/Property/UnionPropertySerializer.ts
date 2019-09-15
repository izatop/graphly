// tslint:disable:no-submodule-imports
import {IPropertyScalar, PropertyKind, PropertyType} from "@graphly/schema";
import {UnionType} from "typedoc/dist/lib/models";
import {createPropertySerializer} from "./index";
import {PropertySerializer} from "./PropertySerializer";

export class UnionPropertySerializer extends PropertySerializer<UnionType> {
    public serialize() {
        const properties: PropertyType[] = [];
        for (const type of this.data.type.types) {
            const delegateReflection = {
                type,
                name: this.name,
                flags: this.data.flags,
                defaultValue: this.data.defaultValue,
            };

            const serializer = createPropertySerializer(this.project, delegateReflection)!;
            this.assert(
                serializer,
                "Property serializer not found",
                () => type.toObject(),
            );

            properties.push(serializer.serialize());
        }

        return this.suggest(properties);
    }

    protected suggest(properties: PropertyType[]): PropertyType {
        const defaultValue = this.optional.defaultValue;
        const nullable = properties.some((p) => (p.kind === PropertyKind.SCALAR && p.type === "undefined"))
            || this.optional.nullable;

        properties = properties.filter((p) => !(p.kind === PropertyKind.SCALAR && p.type === "undefined"));
        if (this.isScalarOnly(properties) && properties.length === 1) {
            return {
                nullable,
                defaultValue,
                kind: PropertyKind.SCALAR,
                name: this.name,
                type: properties[0].type,
            };
        }

        if (this.isScalarOnly(properties)) {
            const values = properties.map((p) => p.type);
            this.assert(
                properties.length === 2 && values.sort().join("") === ["false", "true"].join(""),
                `A property union type should be one of "true | false" or a list of references.`,
                () => ({properties}),
            );

            return {
                nullable,
                defaultValue,
                kind: PropertyKind.SCALAR,
                name: this.name,
                type: "boolean",
            };
        }

        this.assert(properties.length === 1, "Cannot resolve union type", () => ({properties}));
        return {
            ...properties.pop()!,
            nullable,
            defaultValue,
        };
    }

    protected isScalarOnly(properties: PropertyType[]): properties is IPropertyScalar[] {
        const kinds = new Set(properties.map((p) => p.kind));
        return kinds.size === 1 && kinds.has(PropertyKind.SCALAR);
    }
}
