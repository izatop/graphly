import {Context} from "@graphly/type";
import {Todo} from "./Query/Todo";
import {TestContainer} from "./TestContainer";

export class TestContext extends Context<TestContainer> {
    public get repository() {
        return this.container.repository;
    }

    public get todos() {
        return this.repository.get<Todo>("todos");
    }
}
