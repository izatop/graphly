import {TodoStatus} from "@graphly/todo";
import {TodoChecklist} from "../Schema/Query/TodoChecklist";
import {TodoFlag} from "../Schema/Query/TodoFlag";
import {TDocument} from "./TestRepository";

export interface ITodo extends TDocument {
    title: string;
    description?: string;
    checklist: TodoChecklist[];
    deadlineAt?: Date;
    createdAt: Date;
    flag?: TodoFlag;
    ownerId: number;
    status: TodoStatus;
}

export {TodoStatus};
