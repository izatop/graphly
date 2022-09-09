import {$Implement, TypeInt} from "@graphly/type";
import {ITodo, TodoStatus} from "../../Repository/ITodo";
import {BaseType} from "./BaseType";
import {TodoChecklist} from "./TodoChecklist";
import {TodoFlag} from "./TodoFlag";

/**
 * Todo type description
 */
export class Todo extends BaseType implements $Implement<ITodo, "createdAt"> {
    declare public readonly id: TypeInt;

    declare public readonly title: string;

    public readonly description?: string;

    public readonly checklist: TodoChecklist[] = [];

    public readonly check?: TodoChecklist;

    public readonly status: TodoStatus = TodoStatus.PENDING;

    public readonly deadlineAt?: Date;
    public readonly flag?: TodoFlag;

    declare protected readonly createdAt: Date;

    public get timestamp(): TypeInt {
        return this.createdAt.getTime();
    }
}
