import {MainContext} from "../MainContext";
import {ITestState} from "./interfaces";
import {Todo} from "./Query/Todo";

export class TestContext extends MainContext<ITestState> {
    public get todos() {
        return this.repository.get<Todo>("todos");
    }
}
