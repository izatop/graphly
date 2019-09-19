import {Context} from "@graphly/type";
import {IConfig, IState} from "./interfaces";
import {Todo} from "./Query/Todo";
import {TestContainer} from "./TestContainer";

export class TestContext extends Context<TestContainer, IConfig, IState> {
    public get repository() {
        return this.container.repository;
    }

    public get todos() {
        return this.repository.get<Todo>("todos");
    }

    public getConfig() {
        return this.config;
    }
}
