import {ObjectType, TypeDomain, TypeEmail, TypeIPv4} from "@graphly/type";
import {ITestState} from "./interfaces";
import {TodoQuery} from "./Query/TodoQuery";
import {TestContext} from "./TestContext";
import {TestObject} from "./TestObject";

export class TestQuery extends ObjectType {
    /**
     * Empty optional field without a resolver
     */
    public readonly optional?: number;

    /**
     * Subtype ObjectType without
     */
    declare public readonly todo: TodoQuery;

    /**
     * Evaluate expression as a resolver
     */
    public readonly random = Math.random();

    public readonly domain: TypeDomain = "foo.example.com";
    public readonly email: TypeEmail = "a+b@foo.example.com";
    public readonly ipv4: TypeIPv4 = "127.0.0.1";
    public readonly extra: TestObject = {selectors: [1, 2, 3], flag: true};

    /**
     * Not in a schema
     */
    declare protected protectedMember: number;

    /**
     * Not in a schema
     */
    declare private privateMember: number;

    /**
     * Getter as a resolver
     */
    public get timestamp(): number {
        return Date.now();
    }

    /**
     * Hello World's resolver
     */
    public hello(): string {
        return "Hello world";
    }

    public config(ctx: TestContext): boolean {
        return this.testProtectedState(ctx.state);
    }

    protected testProtectedState(_state: ITestState): boolean {
        return true;
    }
}
