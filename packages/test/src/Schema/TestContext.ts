import {Context} from "@graphly/type";
import {Todo} from "./Query/Todo";
import {TestContainer} from "./TestContainer";

export class TestContext extends Context<TestContainer> {
    public get todos() {
        return this.container.repository.get<Todo>("todos");
    }
}
