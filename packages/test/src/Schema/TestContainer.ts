import {Container} from "@graphly/type";
import {TestRepository} from "../Repository/TestRepository";

export class TestContainer extends Container<{time: number}> {
    public get repository() {
        return Promise.resolve(new TestRepository());
    }
}
