import {TodoStatus} from "./TodoStatus";

export class TodoArray extends Array<TodoStatus> {
    constructor(todos: TodoStatus[]) {
        super(...todos);
    }
}
