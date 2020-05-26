import {MainContext} from "../MainContext";
import {IState} from "./interfaces";
import {Todo} from "./Query/Todo";

export class TestContext extends MainContext<IState> {
    public get todos() {
        return this.repository.get<Todo>("todos");
    }
}
