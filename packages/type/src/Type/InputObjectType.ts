import {Arrayable, InputType} from "../Interface";

export abstract class InputObjectType {
    readonly [key: string]: Arrayable<InputType>;
}
