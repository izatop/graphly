// tslint:disable-next-line:no-submodule-imports
import {Type} from "typedoc/dist/lib/models";
// tslint:disable-next-line:no-submodule-imports
import {ReflectionFlags} from "typedoc/dist/lib/models/reflections/abstract";
import {PropertyType} from "../../Type";
import {SerializerAbstract} from "../SerializerAbstract";

export interface IPropertySerializer<T extends Type> {
    flags: ReflectionFlags;
    defaultValue?: string;
    type: T;
    name: string;
}

export abstract class PropertySerializer<T extends Type>
    extends SerializerAbstract<PropertyType, IPropertySerializer<T>> {
    public get name() {
        return this.data.name;
    }

    public get optional() {
        if (this.data.defaultValue) {
            return {
                nullable: this.data.flags.isOptional,
                defaultValue: this.data.defaultValue,
            };
        }

        return {
            nullable: this.data.flags.isOptional,
        };
    }
}
