// tslint:disable-next-line:no-empty-interface
import {Arrayable, OutputType} from "./index";

export interface IObject {
    readonly [key: string]: Arrayable<OutputType>;
}
