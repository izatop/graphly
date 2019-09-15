import {PaginationInput} from "./PaginationInput";

export class TodoSearchInput extends PaginationInput {
    public readonly solved?: boolean;
}
