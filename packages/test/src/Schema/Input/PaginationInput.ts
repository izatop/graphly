import {InputType, TypeInt} from "@graphly/type";

export abstract class PaginationInput extends InputType {
    public offset: TypeInt = 0;

    public limit: TypeInt = 10;
}
