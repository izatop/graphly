import {ObjectType, TypeInt, TypeString} from "@graphly/type";

export abstract class BaseType extends ObjectType {
    public readonly id: TypeInt;

    public get code(): TypeString {
        return "code" + this.id.toString();
    }
}
