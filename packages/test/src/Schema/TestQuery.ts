import {QueryType} from "@graphly/type";
import {TodoQuery} from "./Query/TodoQuery";

export class TestQuery extends QueryType {
    public readonly hello: string = "world";

    public readonly optional?: number;

    public readonly todo: TodoQuery;

    protected readonly hidden: boolean;

    private readonly random = Math.random();

    public get timestamp() {
        return Date.now();
    }
}
