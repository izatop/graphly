import {TodoStatus} from "@graphly/todo";
import {InputObjectType} from "@graphly/type";
import {TodoFlag} from "../Query/TodoFlag";
import {TodoChecklistInput} from "./TodoChecklistInput";

export class TodoInput extends InputObjectType {
    public readonly title: string = "New todo";

    public readonly description?: string;

    public readonly status: TodoStatus = TodoStatus.PENDING;

    public readonly deadlineAt?: Date;

    public readonly checklist: TodoChecklistInput[] = [];

    public readonly flag?: TodoFlag;
}
