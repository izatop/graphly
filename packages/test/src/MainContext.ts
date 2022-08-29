import {Context, KeyValue} from "@graphly/type";
import {MainContainer} from "./MainContainer";
import {TestRepository} from "./Repository/TestRepository";
import {IConfig} from "./Schema/interfaces";
import {Todo} from "./Schema/Query/Todo";

export class MainContext<S extends KeyValue> extends Context<MainContainer, IConfig, S> {
    public get repository(): TestRepository {
        return this.container.repository;
    }

    public getConfig(): IConfig {
        return this.config;
    }

    public tables() {
        const {repository} = this.container;
        return {
            todos: repository.get<Todo>("todos"),
        };
    }
}
