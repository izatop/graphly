import {Container} from "@graphly/type";
import {TestRepository} from "../Repository/TestRepository";
import {IConfig} from "./interfaces";

export class TestContainer extends Container<IConfig> {
    public get repository() {
        return Promise.resolve(new TestRepository(this.config.dsn));
    }
}
