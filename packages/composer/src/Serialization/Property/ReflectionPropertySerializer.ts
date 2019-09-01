// tslint:disable-next-line:no-submodule-imports
import {ReflectionType} from "typedoc/dist/lib/models";
import {PropertySerializer} from "./PropertySerializer";

export class ReflectionPropertySerializer extends PropertySerializer<ReflectionType> {
    public serialize() {
        this.assert(
            false,
            "Do not use rest syntax in resolver arguments",
        );

        return {
            ...this.optional,
            name: this.name,
            type: "None",
        };
    }
}
