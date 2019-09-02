import {QueryType, TypeInt} from "@graphly/type";
import {TodoChecklist} from "./TodoChecklist";
import {TodoFlag} from "./TodoFlag";

/**
 * Todo type description
 */
export class Todo extends QueryType {
    public readonly id: TypeInt;

    public readonly title: string;

    public readonly description?: string;

    public readonly checklist: TodoChecklist[] = [];

    public readonly solved: boolean = false;

    public readonly flag: TodoFlag;
}
