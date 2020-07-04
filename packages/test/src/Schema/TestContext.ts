import {MainContext} from "../MainContext";
import {ITodo} from "../Repository/ITodo";
import {ITestState} from "./interfaces";

export class TestContext extends MainContext<ITestState> {
    public get todos() {
        return this.repository.get<ITodo>("todos");
    }
}
