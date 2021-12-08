import {MainContext} from "../MainContext";
import {ITodo} from "../Repository/ITodo";
import {TestCollection} from "../Repository/TestRepository";
import {ITestState} from "./interfaces";

export class TestContext extends MainContext<ITestState> {
    public get todos(): TestCollection<ITodo> {
        return this.repository.get<ITodo>("todos");
    }
}
