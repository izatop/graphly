// tslint:disable-next-line:no-submodule-imports
import {ReflectionType} from "typedoc/dist/lib/models";
import {IPropertyNever, PropertyKind} from "../../Type";
import {PropertySerializer} from "./PropertySerializer";

export class ReflectionPropertySerializer extends PropertySerializer<ReflectionType> {
    public serialize() {
        this.assert(
            false,
            "Do not use rest syntax in resolver arguments",
            () => ({name: this.data.name}),
        );

        const property: IPropertyNever = {
            ...this.optional,
            name: this.name,
            kind: PropertyKind.NEVER,
        };

        return property;
    }
}
