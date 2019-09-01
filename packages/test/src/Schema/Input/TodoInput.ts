import {InputType} from "@graphly/type";
import {TodoCheckListInput} from "./TodoCheckListInput";

export class TodoInput extends InputType {
    public title: string = "New todo";

    public description?: string;

    public solved: boolean = false;

    public deadlineAt?: Date;

    public list: TodoCheckListInput[] = [];
}
