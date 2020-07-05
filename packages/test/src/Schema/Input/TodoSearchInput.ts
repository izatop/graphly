import {TodoStatus} from "../../Repository/ITodo";
import {PaginationInput} from "./PaginationInput";

export class TodoSearchInput extends PaginationInput {
    public readonly status?: TodoStatus;
}
