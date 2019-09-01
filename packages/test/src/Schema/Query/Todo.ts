import {QueryType, TypeInt} from "@graphly/type";
import {TodoCheckList} from "./TodoCheckList";
import {TodoFlag} from "./TodoFlag";

/**
 * Todo type description
 */
export class Todo extends QueryType {
    public readonly id: TypeInt;

    public readonly title: string;

    public readonly description?: string;

    public readonly list: TodoCheckList[] = [];

    public readonly solved: boolean = false;

    public readonly flag: TodoFlag;
}
