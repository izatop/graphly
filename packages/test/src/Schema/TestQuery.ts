import {ObjectType, TypeBoolean, TypeDomain, TypeEmail, TypeIPv4} from "@graphly/type";
import {ITestState} from "./interfaces";
import {TodoQuery} from "./Query/TodoQuery";
import {TestContext} from "./TestContext";

export class TestQuery extends ObjectType {
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

    public readonly domain: TypeDomain = "foo.example.com";
    public readonly email: TypeEmail = "a+b@foo.example.com";
    public readonly ipv4: TypeIPv4 = "127.0.0.1";

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

    public config(ctx: TestContext): boolean {
        return this.testProtectedState(ctx.state);
    }

    protected testProtectedState(state: ITestState): boolean {
        return true;
    }
}
