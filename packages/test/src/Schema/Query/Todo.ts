import {$Implement, TypeInt} from "@graphly/type";
import {ITodo} from "../../Repository/ITodo";
import {BaseType} from "./BaseType";
import {TodoChecklist} from "./TodoChecklist";
import {TodoFlag} from "./TodoFlag";

/**
 * Todo type description
 */
export class Todo extends BaseType implements $Implement<ITodo, "createdAt"> {
    public readonly id: TypeInt;

    public readonly title: string;

    public readonly description?: string;

    public readonly checklist: TodoChecklist[] = [];

    public readonly solved: boolean = false;

    public readonly deadlineAt?: Date;
    public readonly flag?: TodoFlag;

    protected readonly createdAt: Date;

    public get timestamp(): TypeInt {
        return this.createdAt.getTime();
    }
}
