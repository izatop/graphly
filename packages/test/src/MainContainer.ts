import {Container} from "@graphly/type";
import {TestRepository} from "./Repository/TestRepository";
import {IConfig} from "./Schema/interfaces";

export class MainContainer extends Container<IConfig> {
    public get repository() {
        return Promise.resolve(new TestRepository(this.config.dsn));
    }
}
