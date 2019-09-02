import {QueryType} from "@graphly/type";
import {TodoQuery} from "./Query/TodoQuery";

export class TestQuery extends QueryType {
    /**
     * Empty optional field without a resolver
     */
    public readonly optional?: number;

    /**
     * Subtype ObjectType without
     */
    public readonly todo: TodoQuery;

    /**
     * Evaluate expression as a resolver
     */
    public readonly random = Math.random();

    /**
     * Not in a schema
     */
    protected protectedMember: number;

    /**
     * Not in a schema
     */
    private privateMember: number;

    /**
     * Getter as a resolver
     */
    public get timestamp() {
        return Date.now();
    }

    /**
     * Hello World's resolver
     */
    public hello() {
        return "Hello world";
    }
}
