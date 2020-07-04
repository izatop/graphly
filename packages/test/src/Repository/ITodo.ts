import {TodoChecklist} from "../Schema/Query/TodoChecklist";
import {TodoFlag} from "../Schema/Query/TodoFlag";
import {TDocument} from "./TestRepository";

export interface ITodo extends TDocument {
    title: string;
    description?: string;
    checklist: TodoChecklist[];
    solved: boolean;
    deadlineAt?: Date;
    createdAt: Date;
    flag?: TodoFlag;
    ownerId: number;
}
