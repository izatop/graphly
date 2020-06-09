import {BaseType} from "./BaseType";
import {TodoChecklist} from "./TodoChecklist";
import {TodoFlag} from "./TodoFlag";

/**
 * Todo type description
 */
export class Todo extends BaseType {
    public readonly title: string;

    public readonly description?: string;

    public readonly checklist: TodoChecklist[] = [];

    public readonly solved: boolean = false;

    public readonly deadlineAt?: Date;

    public readonly flag?: TodoFlag;
}
