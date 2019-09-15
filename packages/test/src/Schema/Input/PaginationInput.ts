import {InputObjectType, TypeInt} from "@graphly/type";

export abstract class PaginationInput extends InputObjectType {
    public readonly offset: TypeInt = 0;

    public readonly limit: TypeInt = 10;
}
