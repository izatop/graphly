import {KeyValue} from "../Interface";

export type ContainerCtor<TContainer extends Container<TConfig>,
    TConfig extends KeyValue = {}> = new(config: TConfig) => TContainer;

/**
 * Container is an application state class which provides a lot of
 * global services and a context state factory/validation methods.
 */
export class Container<TConfig extends KeyValue = {}> {
    public readonly config: TConfig;

    constructor(config: TConfig) {
        this.config = config;
    }
}
